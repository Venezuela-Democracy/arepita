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
    wallet: {
      address: string;
      privateKey: string;
    };
  }): Promise<IUser>;
  setUserLanguage(telegramId: string, language: 'es' | 'en'): Promise<IUser | null>;
  getUserLanguage(telegramId: string): Promise<IUser | null>;
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
  wallet: {
    address: string;
    privateKey: string;
  };
}) {
  return this.create({
    telegramId: userData.telegramId,
    region: userData.region,
    wallet: {
      address: userData.wallet.address,
      privateKey: userData.wallet.privateKey,
    }
  });
};

userSchema.statics.setUserLanguage = function(telegramId: string, language: 'es' | 'en') {
  return this.findOneAndUpdate(
    { telegramId },
    { language },
    { new: true }
  );
};

userSchema.statics.getUserLanguage = function(telegramId: string) {
  return this.findOne({ telegramId }).select('language');
};

export default userSchema;
export { IUserModel };