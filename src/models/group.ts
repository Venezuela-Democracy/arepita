import { db } from '../config/firebase';
import { IGroup } from './types';

export interface IGroupModel {
  findByGroupId(groupId: string): Promise<IGroup | null>;
  create(groupData: {
    groupId: string;
    name: string;
    type: 'GENERAL' | 'REGIONAL';
  }): Promise<IGroup>;
}

const groupModel: IGroupModel = {
  async findByGroupId(groupId: string) {
    const doc = await db.collection('groups').doc(groupId).get();
    return doc.exists ? (doc.data() as IGroup) : null;
  },

  async create(groupData) {
    const group: IGroup = {
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('groups').doc(groupData.groupId).set(group);
    return group;
  }
};

export default groupModel;