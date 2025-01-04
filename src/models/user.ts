import mongoose, { Document, Model } from 'mongoose';
import { VENEZUELA_REGIONS } from '../bot/regions';

// Interface para TypeScript
export interface IUser extends Document {
  telegramId: string;
  language: 'es' | 'en';
  region: keyof typeof VENEZUELA_REGIONS;
  wallet: {
    address: string;
    privateKey: string;
    createdAt: Date;
  };
  lastActive: Date;
  createdAt: Date;
}

interface IUserModel extends Model<IUser> {
  findByTelegramId(telegramId: string): Promise<IUser | null>;
  createUser(userData: {
    telegramId: string;
    region: string;
    language: 'es' | 'en';
    wallet: {
      address: string;
      privateKey: string;
    };
  }): Promise<IUser>;
  setUserLanguage(telegramId: string, language: 'es' | 'en'): Promise<IUser | null>;
  getUserLanguage(telegramId: string): Promise<string>;  // Cambiar el tipo de retorno
}

// Schema
const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  language: {
    type: String,
    enum: ['es', 'en'],
    default: 'es'
  },  
  region: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return Object.keys(VENEZUELA_REGIONS).includes(v);
      },
      message: (props: { value: string }) => `${props.value} no es una región válida de Venezuela`
    }
  },
  wallet: {
    address: {
      type: String,
      unique: true
    },
    privateKey: {
      type: String,
      select: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.statics.findByTelegramId = function(telegramId: string) {
  return this.findOne({ telegramId });
};

userSchema.statics.createUser = function(userData: {
  telegramId: string;
  region: string;
  language: 'es' | 'en';
  wallet: {
    address: string;
    privateKey: string;
  };
}) {
  // Usar findOneAndUpdate con upsert
  return this.findOneAndUpdate(
    { telegramId: userData.telegramId },
    {
      $set: {
        region: userData.region,
        language: userData.language,
        wallet: {
          address: userData.wallet.address,
          privateKey: userData.wallet.privateKey,
          createdAt: new Date()
        }
      }
    },
    { 
      new: true, // Retorna el documento actualizado
      upsert: true // Crea el documento si no existe
    }
  );
};

userSchema.statics.setUserLanguage = function(telegramId: string, language: 'es' | 'en') {
  return this.findOneAndUpdate(
    { telegramId },
    { language },
    { new: true, upsert: true }
  );
};

userSchema.statics.getUserLanguage = function(telegramId: string) {
  return this.findOne({ telegramId })
    .select('language')
    .then((user: IUser | null) => user?.language || null);
};

export default userSchema;
export { IUserModel };