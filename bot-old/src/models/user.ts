import { db } from '../config/firebase';
import { VenezuelaRegion, SupportedLanguage } from '../bot/types';
import { 
  DocumentData, 
  QueryDocumentSnapshot,
  DocumentSnapshot,
  CollectionReference,
  Query
} from 'firebase-admin/firestore';

export interface IUser {
  telegramId: string;
  language: SupportedLanguage;
  region: VenezuelaRegion;
  wallet?: {
    address: string;
    privateKey: string;
  };
  lastActive?: Date;
}

export class User {
  private static collection = db.collection('users');

  private static docToUser(doc: DocumentSnapshot<DocumentData>): IUser {
    const data = doc.data();
    if (!data) throw new Error('Document does not exist');
    
    return {
      telegramId: data?.telegramId || doc.id, // Primero intentamos el campo, luego el ID
      language: data?.language || 'es', // Aseguramos que siempre haya un idioma
      region: data.region,
      wallet: data.wallet,
      lastActive: data.lastActive ? new Date(data.lastActive._seconds * 1000) : undefined
    };
  }

  /**
   * Encuentra un usuario por cualquier filtro
   */
  static async findOne(filter: Partial<IUser>) {
    try {
      let query: Query<DocumentData> | CollectionReference<DocumentData> = this.collection;
      
      // Aplicar filtros dinámicamente
      Object.entries(filter).forEach(([key, value]) => {
        query = query.where(key, '==', value);
      });

      const snapshot = await query.limit(1).get();
      if (snapshot.empty) return null;

      return this.docToUser(snapshot.docs[0]);
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  /**
   * Encuentra múltiples usuarios por filtro
   */
  static async find(filter: Partial<IUser> = {}) {
    try {
      let query: Query<DocumentData> | CollectionReference<DocumentData> = this.collection;
      
      Object.entries(filter).forEach(([key, value]) => {
        query = query.where(key, '==', value);
      });

      const snapshot = await query.get();
      return snapshot.docs.map(doc => this.docToUser(doc));
    } catch (error) {
      console.error('Error in find:', error);
      throw error;
    }
  }

  /**
   * Crea o actualiza un usuario
   */
  static async upsert(telegramId: string, data: Partial<IUser>) {
    try {
      const ref = this.collection.doc(telegramId);
      const updateData = {
        telegramId,
        ...data,
        lastActive: new Date()
      };
  
      await ref.set(updateData, { merge: true });
      const doc = await ref.get();
      return this.docToUser(doc);
    } catch (error) {
      console.error('Error in upsert:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas agrupadas
   */
  static async getStats(groupBy: keyof IUser) {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const key = data[groupBy];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  }
}