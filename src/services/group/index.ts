import { Telegram } from 'telegraf';

export class GroupService {
  private telegram: Telegram;

  constructor(telegram: Telegram) {
    this.telegram = telegram;
  }

  async addUserToGroups(userId: number, region: string) {
    try {
      // Agregar al grupo general
      const generalGroupId = process.env.GENERAL_GROUP_ID!;
      await this.telegram.unbanChatMember(
        generalGroupId,
        userId
      );

      // Agregar al grupo regional
      const regionalGroupId = process.env[`${region.toUpperCase()}_GROUP_ID`];
      if (regionalGroupId) {
        await this.telegram.unbanChatMember(
          regionalGroupId,
          userId
        );
      }

      return true;
    } catch (error) {
      console.error('Error adding user to groups:', error);
      throw error;
    }
  }
}