import { Telegraf } from "telegraf";
import { Chat, ChatPermissions } from "telegraf/types";
import { config } from "dotenv";
import { UserService } from "../../services";

config();

export class TelegramGroupManager {
    private bot: Telegraf;
    private migratedGroupIds: Map<string, number> = new Map();

    constructor(bot: Telegraf) {
        this.bot = bot;
        console.log("🤖 TelegramGroupManager: Inicializado");
    }


    async restrictNewMember(chatId: number, userId: number) {
        try {
            console.log(`🔒 Aplicando restricciones al miembro ${userId} en chat ${chatId}`);
            
            const permissions: ChatPermissions = {
                can_send_messages: true,
                can_send_photos: true,
                can_send_documents: true,
                can_send_videos: true,
                can_send_polls: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
                can_change_info: false,
                can_invite_users: false,
                can_pin_messages: false,
            };

            await this.bot.telegram.restrictChatMember(chatId, userId, {
                permissions: permissions
            });
            
            console.log(`✅ Restricciones aplicadas exitosamente al miembro ${userId}`);
        } catch (error) {
            console.error(`❌ Error al restringir miembro ${userId} en chat ${chatId}:`, error);
            throw error;
        }
    }

    async addUserToGroups(userId: number, state: string) {
        try {
            console.log(`🎉 Iniciando proceso de invitación para usuario ${userId} en estado ${state}`);

            const formattedRegion = this.formatRegionForLink(state);
            const userLanguage = await UserService.getUserLanguage(userId.toString()) || 'es';

            // Mensaje de bienvenida con enlaces fijos según el idioma
            const welcomeMessages = {
                es: `🎉 ¡Bienvenido a VzlaDAO!\n\n` +
                    `Aquí tienes los enlaces para unirte a nuestros grupos:\n\n` +
                    `• Grupo General: t.me/VzlaDAOGeneral\n` +
                    `• Grupo ${formattedRegion}: t.me/VzlaDAO${formattedRegion}\n\n` +
                    `⚠️ Importante:\n` +
                    `• Debes estar registrado para permanecer en los grupos\n` +
                    `• Solo podrás estar en el grupo de tu región\n` +
                    `• El bot verificará tu registro al entrar\n\n` +
                    `Si tienes alguna duda, escribe /help 💡`,
                en: `🎉 Welcome to VzlaDAO!\n\n` +
                    `Here are the links to join our groups:\n\n` +
                    `• General Group: t.me/VzlaDAOGeneral\n` +
                    `• ${formattedRegion} Group: t.me/VzlaDAO${formattedRegion}\n\n` +
                    `⚠️ Important:\n` +
                    `• You must be registered to stay in the groups\n` +
                    `• You can only be in your region's group\n` +
                    `• The bot will verify your registration upon entry\n\n` +
                    `If you have any questions, type /help 💡`
            };

            await this.bot.telegram.sendMessage(userId, welcomeMessages[userLanguage]);
            console.log(`✅ Enlaces enviados al usuario ${userId}`);

        } catch (error) {
            console.error('❌ Error en proceso de invitación:', error);
            throw error;
        }
    }

    async verifyMember(chatId: number, userId: number) {
        try {
            console.log(`🔍 Verificando miembro ${userId} en chat ${chatId}`);
            const userLanguage = await UserService.getUserLanguage(userId.toString()) || 'es';
            
            // 1. Verificar si el usuario está registrado
            const isRegistered = await UserService.isRegistered(userId.toString());
            
            if (!isRegistered) {
                console.log(`❌ Usuario ${userId} no registrado, expulsando...`);
                await this.bot.telegram.banChatMember(chatId, userId);
                await this.bot.telegram.unbanChatMember(chatId, userId);
                
                const notRegisteredMessages = {
                    es: `⚠️ Has sido removido del grupo porque no estás registrado.\n` +
                        `Por favor, usa /register para registrarte primero.`,
                    en: `⚠️ You have been removed from the group because you are not registered.\n` +
                        `Please use /register to register first.`
                };
                
                await this.bot.telegram.sendMessage(userId, notRegisteredMessages[userLanguage]);
                return false;
            }
    
            // 2. Si es un grupo regional, verificar que corresponda a su región
            if (chatId.toString() !== process.env.GENERAL_GROUP_ID) {
                const userRegion = await UserService.getRegion(userId.toString());
                const chat = await this.bot.telegram.getChat(chatId) as Chat.GroupChat | Chat.SupergroupChat;
                
                const normalizedTitle = this.normalizeRegionName(chat.title);
                const normalizedRegion = this.normalizeRegionName(userRegion || '');
                
                if (!normalizedTitle.includes(normalizedRegion)) {
                    console.log(`❌ Usuario ${userId} en grupo regional incorrecto, expulsando...`);
                    await this.bot.telegram.banChatMember(chatId, userId);
                    await this.bot.telegram.unbanChatMember(chatId, userId);
                    
                    const wrongRegionMessages = {
                        es: `⚠️ Has sido removido porque este no es el grupo de tu región.\n` +
                            `Tu región registrada es: ${userRegion}`,
                        en: `⚠️ You have been removed because this is not your region's group.\n` +
                            `Your registered region is: ${userRegion}`
                    };
                    
                    await this.bot.telegram.sendMessage(userId, wrongRegionMessages[userLanguage]);
                    return false;
                }
            }
    
            await this.restrictNewMember(chatId, userId);
            return true;
    
        } catch (error) {
            console.error(`❌ Error verificando miembro ${userId}:`, error);
            throw error;
        }
    }

    private normalizeRegionName(name: string): string {
        console.log('Normalizando nombre:', name);
        
        // Si viene del título del grupo, quitamos el prefijo
        const cleanName = name.replace('🇻🇪 VzlaDAO - ', '');
        console.log('Nombre sin prefijo:', cleanName);
        
        const normalized = cleanName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')   // Quitar acentos
            .replace(/\s/g, '_')               // Espacios a guiones bajos
            .toUpperCase()                     // Todo a mayúsculas
            .trim();
        
        console.log('Nombre normalizado final:', normalized);
        return normalized;
    }

    private formatRegionForLink(region: string): string {
        console.log('Formateando región para link:', region);
        
        // Si viene de la BD, ya está en formato LA_GUAIRA
        const words = region
            .replace(/_/g, ' ')    // Convertir guiones bajos a espacios
            .toLowerCase()
            .split(' ');
        
        const formattedWords = words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        );
        
        const result = formattedWords.join('');
        console.log('Región formateada para link:', result);
        return result;
    }

    private getStateGroupId(state: string): string | null {
        const stateKey = `${state.toUpperCase()}_GROUP_ID`;
        const groupId = process.env[stateKey];
        console.log(`🔍 Buscando ID de grupo para estado ${state}: ${groupId}`);
        return groupId || null;
    }
}