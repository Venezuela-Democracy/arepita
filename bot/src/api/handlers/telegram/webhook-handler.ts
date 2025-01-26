import { Request, Response } from 'express';
import { TelegramBot } from '../../../bot/bot';

export const handleWebhook = (bot: TelegramBot) => 
  async (req: Request, res: Response) => {
    try {
      const update = req.body;
      console.log('📥 Webhook recibido:', {
        updateId: update.update_id,
        type: getUpdateType(update),
        chatId: update.message?.chat?.id,
        chatTitle: update.message?.chat?.title
      });

      // Manejar diferentes tipos de actualizaciones
      if (update.message?.new_chat_members) {
        const { chat, new_chat_members } = update.message;
        
        for (const member of new_chat_members) {
          console.log(`🔍 Verificando nuevo miembro:`, {
            userId: member.id,
            username: member.username,
            chatId: chat.id,
            chatTitle: chat.title
          });
          
          await bot.getGroupManager().verifyMember(chat.id, member.id);
        }
      } else if (update.message?.left_chat_member) {
        console.log('👋 Miembro salió del grupo:', {
          userId: update.message.left_chat_member.id,
          username: update.message.left_chat_member.username,
          chatId: update.message.chat.id,
          chatTitle: update.message.chat.title
        });
      } else {
        // Para todos los demás tipos de actualizaciones, usar el handleUpdate de Telegraf
        console.log('🔄 Procesando otro tipo de actualización con Telegraf');
        await bot.handleUpdate(update);
      }

      res.sendStatus(200);
    } catch (error) {
      console.error('❌ Error en webhook:', error);
      res.sendStatus(500);
    }
  };
// Función auxiliar para determinar el tipo de actualización
function getUpdateType(update: any): string {
  if (update.message?.new_chat_members) return 'new_members';
  if (update.message?.left_chat_member) return 'left_member';
  if (update.message?.text) return 'message';
  if (update.callback_query) return 'callback_query';
  return 'other';
}

// Función para manejar nuevos miembros
async function handleNewMembers(bot: TelegramBot, message: any) {
  try {
    const chatId = message.chat.id;
    const newMembers = message.new_chat_members;

    console.log('👥 Nuevos miembros detectados:', {
      chatId,
      chatTitle: message.chat.title,
      members: newMembers.map((m: any) => ({
        id: m.id,
        username: m.username,
        isBot: m.is_bot
      }))
    });

    // Aplicar restricciones a cada nuevo miembro que no sea bot
    for (const member of newMembers) {
      if (!member.is_bot) {
        try {
          await bot.getGroupManager().restrictNewMember(chatId, member.id);
          console.log(`✅ Restricciones aplicadas a miembro ${member.id} en chat ${chatId}`);
        } catch (error) {
          console.error(`❌ Error al restringir miembro ${member.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error manejando nuevos miembros:', error);
    throw error;
  }
}