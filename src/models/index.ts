import { model } from 'mongoose';
import userSchema, { IUser } from './user';

export const User = model<IUser>('User', userSchema);
export type { IUser };

export const Models = {
  User
} as const;