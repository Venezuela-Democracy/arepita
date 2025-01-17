import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin con el projectId
const app = initializeApp({
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

// Obtener instancia de Firestore
export const db = getFirestore(app);

export const connectDB = async () => {
  try {
    await db.collection('test').doc('test').set({ 
      test: true,
      lastConnection: new Date() 
    }, { merge: true });
    
    console.log('📦 Conectado a Firestore');
    return db;
  } catch (error) {
    console.error('❌ Error conectando a Firestore:', error);
    throw error;
  }
};