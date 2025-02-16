import { BotContext } from '../types';
import { ERROR_MESSAGES } from '../constants';
import OpenAI from "openai";

const GENERAL_GROUP_ID = process.env.GENERAL_GROUP_ID || '-1002360418661';

// Satirical simulation data with hidden narratives
const SIMULATION_DATA = {
  merida: {
    name: "Mérida",
    activeLocations: [
      { 
        name: "ULA",
        type: "Educational",
        dpGeneration: 100,
        adoption: 85,
        hiddenStory: "Students trade knowledge for electricity during blackouts"
      },
      { 
        name: "Pico Bolívar",
        type: "Tourist",
        dpGeneration: 80,
        adoption: 65,
        hiddenStory: "Cable car operators become expert meteorologists by necessity"
      },
      { 
        name: "La Venezuela",
        type: "Restaurant",
        dpGeneration: 60,
        adoption: 95,
        hiddenStory: "The last place where you can still find real cheese"
      }
    ],
    equippedNFTs: {
      "Heladería Coromoto": {
        adoption: 90,
        powerType: "Ice Cream Diplomacy",
        hiddenEffect: "Can trade ice cream flavors for diplomatic solutions"
      },
      "El Alquimista": {
        adoption: 75,
        powerType: "Coffee Wisdom",
        hiddenEffect: "Grants ability to predict power outages through coffee grounds"
      }
    },
    currentCrisis: "Eternal Winter",
    localMemes: ["No hay luz pero hay frío", "Se fue la luz pero llegaron los turistas"],
    undergroundEconomy: "Student-run arepera intelligence network"
  },
  zulia: {
    name: "Zulia",
    activeLocations: [
      {
        name: "Puente sobre el Lago",
        type: "Infrastructure",
        dpGeneration: 150,
        adoption: 70,
        hiddenStory: "Bridge lights now serve as the city's most reliable weather forecast"
      },
      {
        name: "Vereda del Lago",
        type: "Recreation",
        dpGeneration: 90,
        adoption: 85,
        hiddenStory: "Local maracuchos have developed heat-resistant superpowers"
      }
    ],
    equippedNFTs: {
      "Patacón Intergaláctico": {
        adoption: 99,
        powerType: "Gastronomic Defense",
        hiddenEffect: "Can solve any crisis with enough plantains"
      },
      "Santa Bárbara": {
        adoption: 80,
        powerType: "Lightning Mastery",
        hiddenEffect: "Converts lightning strikes into air conditioning"
      }
    },
    currentCrisis: "Eternal Summer",
    localMemes: ["A 40° pero con Patacón", "Se fue la luz pero el calor nunca"],
    undergroundEconomy: "Black market air conditioning repair network"
  },
  caracas: {
    name: "Distrito Capital",
    activeLocations: [
      {
        name: "Metro de Caracas",
        type: "Transport",
        dpGeneration: 120,
        adoption: 60,
        hiddenStory: "Metro drivers have developed telepathic communication with the trains"
      },
      {
        name: "Ávila",
        type: "Natural",
        dpGeneration: 100,
        adoption: 90,
        hiddenStory: "The mountain secretly judges everyone's hiking outfit"
      }
    ],
    equippedNFTs: {
      "Chipi Chipi": {
        adoption: 95,
        powerType: "Weather Control",
        hiddenEffect: "Can summon rain but only during traffic jams"
      },
      "Heroe de la Vega": {
        adoption: 85,
        powerType: "Urban Navigation",
        hiddenEffect: "Knows all the secret shortcuts, but won't tell you"
      }
    },
    currentCrisis: "Eternal Traffic",
    localMemes: ["Subiendo el Ávila en tacones", "Cola pero con vista"],
    undergroundEconomy: "Traffic jam empanada delivery network"
  }
};

const HIDDEN_EVENTS = [
  "La Guerra del Café: Andinos vs Llaneros",
  "La Resistencia del Queso de Mano",
  "El Culto Secreto del Tequeño",
  "La Sociedad de la Arepa Illuminati",
  "Los Guardianes del Guasacaca",
  "La Hermandad del Pabellón Criollo"
];

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || '',
    "X-Title": "VenezuelaNFT Bot",
  }
});

export const narrativeHandler = async (ctx: BotContext) => {
    try {
      const telegramId = ctx.from?.id.toString();
      if (!telegramId || telegramId !== "8144015016") {
        return;
      }
  
      const randomEvent = HIDDEN_EVENTS[Math.floor(Math.random() * HIDDEN_EVENTS.length)];
      
      await ctx.telegram.sendMessage(GENERAL_GROUP_ID, '📖 *Chronicles of Venezuela*\n_Tales from our lands..._\n', {
        parse_mode: 'Markdown'
      });

      // Helper function to split long messages
      const splitMessage = (text: string, maxLength: number = 4000): string[] => {
        const messages: string[] = [];
        
        if (text.length <= maxLength) {
          return [text];
        }

        let paragraphs = text.split('\n\n');
        let currentMessage = '';

        for (const paragraph of paragraphs) {
          if (paragraph.length > maxLength) {
            const sentences = paragraph.split('. ');
            for (const sentence of sentences) {
              if ((currentMessage + sentence + '.\n\n').length > maxLength) {
                messages.push(currentMessage.trim());
                currentMessage = '';
              }
              currentMessage += sentence + '. ';
            }
          } 
          else if ((currentMessage + paragraph + '\n\n').length > maxLength) {
            messages.push(currentMessage.trim());
            currentMessage = paragraph + '\n\n';
          } 
          else {
            currentMessage += paragraph + '\n\n';
          }
        }

        if (currentMessage.trim()) {
          messages.push(currentMessage.trim());
        }

        return messages;
      };

      // Generate and send narrative for each region separately
      for (const region of Object.values(SIMULATION_DATA)) {
        const systemPrompt = `Create a satirical but informative report about ${region.name}. 

        Focus on:
        1. The current crisis ("${region.currentCrisis}") and how people are dealing with it
        2. The actual situation in key locations:
           - ${region.activeLocations.map(l => `${l.name}: ${l.hiddenStory}`).join('\n   - ')}
        3. How people are using their resources:
           - ${Object.entries(region.equippedNFTs).map(([name, nft]) => `${name}: ${nft.hiddenEffect}`).join('\n   - ')}
        4. Common local phrases: ${region.localMemes.join(', ')}
        5. The underground economy: ${region.undergroundEconomy}
        
        Style:
        - Write in clear, direct English
        - Use humor and satire to highlight absurd situations
        - Keep it informative while being entertaining
        - Focus on how people adapt to challenges
        - Include specific examples and situations
        
        Think of it as a satirical news report that reveals the truth through humor.`;

        const completion = await openai.chat.completions.create({
          model: "qwen/qwen-2-7b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `Tell me a story about current life in ${region.name}, mixing reality and fantasy.`
            }
          ],
          temperature: 0.9,
          max_tokens: 1000
        });
  
        const regionNarrative = completion.choices[0]?.message?.content || 'Failed to generate narrative.';
        
        // Split and send the narrative in parts
        const messages = splitMessage(`🌟 *${region.name}*\n\n${regionNarrative}`);
        
        for (const message of messages) {
          await ctx.telegram.sendMessage(
            GENERAL_GROUP_ID, 
            message, 
            { parse_mode: 'Markdown' }
          );
          // Small pause between messages
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Pause between regions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      // Generate a more narrative conclusion
      const generalPrompt = `As a chronicler of Venezuela, create a poetic epilogue that:
      - Weaves together the stories of all regions
      - Reflects on the country's diversity and unity
      - Captures the essence of the Venezuelan spirit
      - Includes elements of folklore and popular culture
      - Ends with a hopeful and emotional note
      
      The tone should be lyrical and moving, like the ending of a great family saga.`;
  
      const generalCompletion = await openai.chat.completions.create({
        model: "qwen/qwen-2-7b-instruct:free",
        messages: [
          { role: "system", content: generalPrompt },
          { 
            role: "user", 
            content: "Write a memorable epilogue for these Venezuelan chronicles."
          }
        ],
        temperature: 0.9,
        max_tokens: 500
      });
  
      const generalConclusion = generalCompletion.choices[0]?.message?.content || 'Failed to generate conclusion.';
      
      // Split and send the conclusion
      const conclusionMessages = splitMessage(`\n✨ *Epilogue*\n${generalConclusion}`);
      
      for (const message of conclusionMessages) {
        await ctx.telegram.sendMessage(
          GENERAL_GROUP_ID, 
          message, 
          { parse_mode: 'Markdown' }
        );
        await new Promise(resolve => setTimeout(resolve, 500));
      }
  
    } catch (error) {
      console.error('Error in narrative command:', error);
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
    }
};