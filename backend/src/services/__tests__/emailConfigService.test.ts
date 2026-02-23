import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must set encryption key before importing service
process.env.EMAIL_ENCRYPTION_KEY = 'a'.repeat(64); // 32 bytes as hex

// Mock the model
vi.mock('../../models/EmailConfig.js', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

// Mock googleapis — use a real function constructor (not arrow fn) so `new OAuth2()` works
vi.mock('googleapis', () => {
  function MockOAuth2() {}
  MockOAuth2.prototype.generateAuthUrl = () => 'https://accounts.google.com/o/oauth2/auth?mock';
  MockOAuth2.prototype.getToken = () =>
    Promise.resolve({
      tokens: {
        refresh_token: 'mock-refresh-token',
        access_token: 'mock-access-token',
        expiry_date: Date.now() + 3600000,
      },
    });
  MockOAuth2.prototype.setCredentials = () => {};

  return {
    google: {
      auth: { OAuth2: MockOAuth2 },
      oauth2: () => ({
        userinfo: {
          get: () => Promise.resolve({ data: { email: 'admin@gmail.com' } }),
        },
      }),
    },
  };
});

import { EmailConfigService } from '../EmailConfigService.js';
import EmailConfig from '../../models/EmailConfig.js';

describe('EmailConfigService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('encrypt / decrypt — secret is never stored as plaintext', () => {
    it('round-trips a secret value through encryption and decryption', () => {
      const secret = 'super-secret-value';
      const encrypted = EmailConfigService.encrypt(secret);
      expect(encrypted).not.toBe(secret);
      expect(EmailConfigService.decrypt(encrypted)).toBe(secret);
    });

    it('produces different ciphertext each time so identical secrets cannot be detected by comparison', () => {
      const a = EmailConfigService.encrypt('hello');
      const b = EmailConfigService.encrypt('hello');
      expect(a).not.toBe(b);
    });
  });

  describe('saveCredentials — clientSecret is never stored in plaintext', () => {
    it('stores clientSecret encrypted so the DB value is not the original secret', async () => {
      vi.mocked(EmailConfig.findOneAndUpdate).mockResolvedValue({} as any);

      await EmailConfigService.saveCredentials('client-id-123', 'client-secret-abc');

      const [, update] = vi.mocked(EmailConfig.findOneAndUpdate).mock.calls[0] as any[];
      expect(update['$set'].clientId).toBe('client-id-123');
      // Security behavior: secret must not appear as plaintext in storage
      expect(update['$set'].clientSecret).not.toBe('client-secret-abc');
      // Correctness: decrypting the stored value returns the original
      expect(EmailConfigService.decrypt(update['$set'].clientSecret)).toBe('client-secret-abc');
    });
  });

  describe('getStatus — reflects current connection state', () => {
    it('reports unconfigured when no doc exists', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue(null);
      const status = await EmailConfigService.getStatus();
      expect(status).toEqual({ configured: false, connected: false, connectedEmail: null });
    });

    it('reports credentials saved but not connected when no refresh token', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue({
        clientId: 'id',
        clientSecret: 'enc',
        refreshToken: undefined,
      } as any);
      const status = await EmailConfigService.getStatus();
      expect(status).toEqual({ configured: true, connected: false, connectedEmail: null });
    });

    it('reports fully connected with email when refresh token exists', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue({
        clientId: 'id',
        clientSecret: 'enc',
        refreshToken: 'tok',
        connectedEmail: 'admin@gmail.com',
      } as any);
      const status = await EmailConfigService.getStatus();
      expect(status).toEqual({ configured: true, connected: true, connectedEmail: 'admin@gmail.com' });
    });
  });

  describe('getAuthUrl — OAuth redirect URL generation', () => {
    it('throws when no credentials are configured yet', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue(null);
      await expect(EmailConfigService.getAuthUrl()).rejects.toThrow();
    });

    it('returns a Google OAuth redirect URL when credentials are configured', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue({
        clientId: 'id',
        clientSecret: EmailConfigService.encrypt('secret'),
      } as any);
      const url = await EmailConfigService.getAuthUrl();
      expect(url).toContain('accounts.google.com');
    });
  });

  describe('handleCallback — tokens stored encrypted after Google code exchange', () => {
    it('stores refresh token in encrypted form (never plaintext) after code exchange', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue({
        clientId: 'id',
        clientSecret: EmailConfigService.encrypt('secret'),
      } as any);
      vi.mocked(EmailConfig.findOneAndUpdate).mockResolvedValue({} as any);

      await EmailConfigService.handleCallback('auth-code-xyz');

      const [, update] = vi.mocked(EmailConfig.findOneAndUpdate).mock.calls[0] as any[];
      expect(update['$set'].connectedEmail).toBe('admin@gmail.com');
      // Security: token must not be the raw Google token
      expect(update['$set'].refreshToken).not.toBe('mock-refresh-token');
      // Correctness: stored value is a string (encrypted)
      expect(typeof update['$set'].refreshToken).toBe('string');
    });
  });

  describe('disconnect — OAuth tokens are removed from storage', () => {
    it('clears all token fields so the account is no longer connected', async () => {
      vi.mocked(EmailConfig.findOneAndUpdate).mockResolvedValue({} as any);
      await EmailConfigService.disconnect();
      const [, update] = vi.mocked(EmailConfig.findOneAndUpdate).mock.calls[0] as any[];
      expect(update['$unset']).toMatchObject({
        refreshToken: '',
        accessToken: '',
        connectedEmail: '',
      });
    });
  });

  describe('getTransportConfig — nodemailer auth config for sending emails', () => {
    it('throws EmailNotConfiguredError when email is not configured', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue(null);
      await expect(EmailConfigService.getTransportConfig()).rejects.toThrow('Email is not configured');
    });

    it('throws EmailNotConfiguredError when credentials exist but no refresh token', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue({
        clientId: 'id',
        clientSecret: EmailConfigService.encrypt('secret'),
        refreshToken: undefined,
      } as any);
      await expect(EmailConfigService.getTransportConfig()).rejects.toThrow('Email is not configured');
    });

    it('returns decrypted OAuth2 transport config when fully connected', async () => {
      vi.mocked(EmailConfig.findOne).mockResolvedValue({
        clientId: 'my-client-id',
        clientSecret: EmailConfigService.encrypt('my-secret'),
        refreshToken: EmailConfigService.encrypt('my-refresh'),
        accessToken: EmailConfigService.encrypt('my-access'),
        tokenExpiry: new Date(Date.now() + 3600000),
        connectedEmail: 'admin@gmail.com',
      } as any);

      const config = await EmailConfigService.getTransportConfig();

      // Behavior: returned values are decrypted and ready for nodemailer
      expect(config.user).toBe('admin@gmail.com');
      expect(config.clientId).toBe('my-client-id');
      expect(config.clientSecret).toBe('my-secret');   // decrypted
      expect(config.refreshToken).toBe('my-refresh');  // decrypted
    });
  });
});
