import { model } from 'mongoose';
import userSchema, { IUser, IUserModel } from './user';

export const User = model<IUser, IUserModel>('User', userSchema);
export type { IUser, IUserModel };

export const Models = {
  User
} as const;