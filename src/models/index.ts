import userModel, { IUserModel } from './user';
import groupModel, { IGroupModel } from './group';
import { IUser, IGroup } from './types';

export const User = userModel;
export const Group = groupModel;

export type { IUser, IUserModel, IGroup, IGroupModel };

export const Models = {
  User,
  Group
} as const;