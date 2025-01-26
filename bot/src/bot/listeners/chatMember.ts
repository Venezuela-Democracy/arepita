import { Context } from 'telegraf';
import { Update, Message, Chat, User } from 'telegraf/types';
import { TelegramGroupManager } from '../managers/group';

interface NewMemberMessage {
    message_id: number;
    date: number;
    chat: Chat;
    new_chat_members?: Array<{
        id: number;
        username?: string;
        is_bot: boolean;
    }>;
}

export const setupChatMemberListener = (groupManager: TelegramGroupManager) => {
    console.log('🎯 Configurando listener para nuevos miembros');
    
    return async (ctx: Context<Update>) => {
        // Manejar eventos de new_chat_members
        if ('message' in ctx.update && 
            'new_chat_members' in ctx.update.message) {
            
            console.log('👥 Evento new_chat_members detectado');
            const message = ctx.update.message as NewMemberMessage;
            
            if (message.new_chat_members) {
                for (const member of message.new_chat_members) {
                    console.log(`🔍 Verificando nuevo miembro:`, {
                        chatId: message.chat.id,
                        userId: member.id,
                        username: member.username
                    });
                    
                    await groupManager.verifyMember(message.chat.id, member.id);
                }
            }
            return;
        }

        // Manejar eventos de chat_member
        if (ctx.chatMember) {
            console.log('👥 Evento chat_member detectado');
            const { chat, new_chat_member } = ctx.chatMember;
            
            if (new_chat_member.status === 'member') {
                console.log(`🔍 Verificando miembro actualizado:`, {
                    chatId: chat.id,
                    userId: new_chat_member.user.id
                });
                
                await groupManager.verifyMember(chat.id, new_chat_member.user.id);
            }
        }
    };
};