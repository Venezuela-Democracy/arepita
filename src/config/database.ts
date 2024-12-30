import mongoose from 'mongoose';
import { config } from 'dotenv';

config(); 

const MONGODB_URL = process.env.MONGO_URL; 

if (!MONGODB_URL) {
  throw new Error('❌ MONGO_URL no está definida en las variables de entorno');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('📦 Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
};