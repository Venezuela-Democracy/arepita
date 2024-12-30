import mongoose, { Document } from 'mongoose';

// Interface para TypeScript
export interface IUser extends Document {
  telegramId: string;
  wallet: {
    address: string;
    privateKey: string;
    createdAt: Date;
  };
  lastActive: Date;
  createdAt: Date;
}

// Schema
const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true // Para búsquedas más rápidas
  },
  wallet: {
    address: {
      type: String,
      unique: true
    },
    privateKey: {
      type: String,
      select: false // Por seguridad, no se incluye en consultas normales
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

export default userSchema;