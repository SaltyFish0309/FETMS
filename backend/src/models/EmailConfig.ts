import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailConfig extends Document {
  clientId: string;
  clientSecret: string;      // AES-256-GCM encrypted
  refreshToken?: string;     // AES-256-GCM encrypted
  accessToken?: string;      // AES-256-GCM encrypted
  tokenExpiry?: Date;
  connectedEmail?: string;
  connectedAt?: Date;
  oauthState?: string;       // short-lived CSRF state, cleared after callback
}

const EmailConfigSchema: Schema = new Schema(
  {
    clientId: { type: String, required: true },
    clientSecret: { type: String, required: true },
    refreshToken: { type: String },
    accessToken: { type: String },
    tokenExpiry: { type: Date },
    connectedEmail: { type: String },
    connectedAt: { type: Date },
    oauthState: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IEmailConfig>('EmailConfig', EmailConfigSchema);
