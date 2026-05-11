import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'citizen' | 'sme' | 'enterprise' | 'official';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  organization?: string;
  role: UserRole;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, select: false },
    phone:        { type: String, trim: true },
    organization: { type: String, trim: true },
    role:         { type: String, enum: ['citizen', 'sme', 'enterprise', 'official'], default: 'citizen' },
    isVerified:   { type: Boolean, default: false },
    lastLogin:    { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
