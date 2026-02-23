import crypto from 'crypto';
import { google } from 'googleapis';
import EmailConfig from '../models/EmailConfig.js';
import { EmailNotConfiguredError } from '../errors.js';

const ALGORITHM = 'aes-256-gcm';
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI ?? 'http://localhost:5000/api/email-config/callback';
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

function getKey(): Buffer {
  const key = process.env.EMAIL_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('EMAIL_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

export interface TransportAuthConfig {
  type: 'OAuth2';
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  expires?: number;
}

export class EmailConfigService {
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
  }

  static decrypt(encoded: string): string {
    const parts = encoded.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted value format');
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  static async saveCredentials(clientId: string, clientSecret: string): Promise<void> {
    await EmailConfig.findOneAndUpdate(
      {},
      {
        $set: {
          clientId,
          clientSecret: EmailConfigService.encrypt(clientSecret),
        },
        $unset: { refreshToken: '', accessToken: '', tokenExpiry: '', connectedEmail: '', connectedAt: '' },
      },
      { upsert: true }
    );
  }

  static async getStatus(): Promise<{ configured: boolean; connected: boolean; connectedEmail: string | null }> {
    const config = await EmailConfig.findOne();
    if (!config) return { configured: false, connected: false, connectedEmail: null };
    const connected = !!config.refreshToken;
    return {
      configured: true,
      connected,
      connectedEmail: connected ? (config.connectedEmail ?? null) : null,
    };
  }

  static async getAuthUrl(): Promise<string> {
    const config = await EmailConfig.findOne();
    if (!config) throw new EmailNotConfiguredError();
    const oAuth2Client = new google.auth.OAuth2(
      config.clientId,
      EmailConfigService.decrypt(config.clientSecret),
      REDIRECT_URI
    );
    return oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [GMAIL_SCOPE],
      prompt: 'consent',
    });
  }

  static async handleCallback(code: string): Promise<void> {
    const config = await EmailConfig.findOne();
    if (!config) throw new EmailNotConfiguredError();

    const oAuth2Client = new google.auth.OAuth2(
      config.clientId,
      EmailConfigService.decrypt(config.clientSecret),
      REDIRECT_URI
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2Api = google.oauth2({ version: 'v2', auth: oAuth2Client });
    const { data } = await oauth2Api.userinfo.get();

    await EmailConfig.findOneAndUpdate(
      {},
      {
        $set: {
          refreshToken: EmailConfigService.encrypt(tokens.refresh_token!),
          accessToken: tokens.access_token
            ? EmailConfigService.encrypt(tokens.access_token)
            : undefined,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          connectedEmail: data.email ?? '',
          connectedAt: new Date(),
        },
      }
    );
  }

  static async disconnect(): Promise<void> {
    await EmailConfig.findOneAndUpdate(
      {},
      {
        $unset: {
          refreshToken: '',
          accessToken: '',
          tokenExpiry: '',
          connectedEmail: '',
          connectedAt: '',
        },
      }
    );
  }

  static async getTransportConfig(): Promise<TransportAuthConfig> {
    const config = await EmailConfig.findOne();
    if (!config || !config.refreshToken) throw new EmailNotConfiguredError();

    return {
      type: 'OAuth2',
      user: config.connectedEmail!,
      clientId: config.clientId,
      clientSecret: EmailConfigService.decrypt(config.clientSecret),
      refreshToken: EmailConfigService.decrypt(config.refreshToken),
      accessToken: config.accessToken
        ? EmailConfigService.decrypt(config.accessToken)
        : undefined,
      expires: config.tokenExpiry?.getTime(),
    };
  }
}
