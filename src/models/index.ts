import { model } from 'mongoose';
import userSchema, { IUser, IUserModel } from './user';
import groupSchema, { IGroup } from './group';

export const User = model<IUser, IUserModel>('User', userSchema);
export const Group = model<IGroup>('Group', groupSchema);

export type { IUser, IUserModel, IGroup };

export const Models = {
  User,
  Group
} as const;