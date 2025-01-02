import { Telegraf } from 'telegraf';
import { Group } from '../../models';
import { VENEZUELA_REGIONS } from '../../bot/regions';

export class GroupService {
  private bot: Telegraf;

  constructor(bot: Telegraf) {
    this.bot = bot;
  }

  async createGroups() {
    try {
      // Crear grupo general
      const generalGroup = await this.bot.telegram.createChatInviteLink(
        process.env.GENERAL_GROUP_ID!, // Necesitamos el ID del grupo ya creado
        {
          name: "VzlaDAO General",
          creates_join_request: false
        }
      );

      // Guardar en MongoDB
      await Group.create({
        groupId: process.env.GENERAL_GROUP_ID!,
        name: "General",
        type: "GENERAL",
        inviteLink: generalGroup.invite_link
      });

      // Crear grupos regionales
      for (const region of Object.keys(VENEZUELA_REGIONS)) {
        const group = await this.bot.telegram.createChatInviteLink(
          process.env.REGIONAL_GROUP_PREFIX! + region, // IDs de grupos ya creados
          {
            name: `VzlaDAO ${region}`,
            creates_join_request: false
          }
        );

        await Group.create({
          groupId: process.env.REGIONAL_GROUP_PREFIX! + region,
          name: region,
          type: "REGIONAL",
          inviteLink: group.invite_link
        });
      }

      return true;
    } catch (error) {
      console.error('Error creating groups:', error);
      throw error;
    }
  }

  async addUserToGroups(userId: number, region: string) {
    try {
      // Agregar al grupo general
      const generalGroup = await Group.findOne({ type: "GENERAL" });

      if (generalGroup) {
        // Desbanear = agregar al grupo
        await this.bot.telegram.unbanChatMember(
          generalGroup.groupId,
          userId,
          { only_if_banned: false }
        );
      }

      // Agregar al grupo regional
      const regionalGroup = await Group.findOne({ 
        type: "REGIONAL",
        name: region 
      });

      if (regionalGroup) {
        // Desbanear = agregar al grupo
        await this.bot.telegram.unbanChatMember(
          regionalGroup.groupId,
          userId,
          { only_if_banned: false }
        );
      }
    } catch (error) {
      console.error('Error adding user to groups:', error);
      throw error;
    }
  }
}