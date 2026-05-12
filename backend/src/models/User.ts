import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'citizen' | 'sme' | 'enterprise' | 'official' | 'super_admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  organization?: string;
  organizationId?: string;
  role: UserRole;
  isVerified: boolean;
  isAnonymized: boolean;
  lastLogin?: Date;
  totpSecret?: string;
  totpEnabled: boolean;
  totpVerifiedSession?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name:                 { type: String, required: true, trim: true },
    email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:             { type: String, required: true, select: false },
    phone:                { type: String, trim: true },
    organization:         { type: String, trim: true },
    organizationId:       { type: String },
    role:                 { type: String, enum: ['citizen', 'sme', 'enterprise', 'official', 'super_admin'], default: 'citizen' },
    isVerified:           { type: Boolean, default: false },
    isAnonymized:         { type: Boolean, default: false },
    lastLogin:            { type: Date },
    totpSecret:           { type: String, select: false },
    totpEnabled:          { type: Boolean, default: false },
    totpVerifiedSession:  { type: String, select: false },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
