import { db } from '../config/firebase';
import { 
  DocumentData, 
  DocumentSnapshot,
  CollectionReference,
  Query
} from 'firebase-admin/firestore';

export interface IGroup {
  groupId: string;
  name: string;
  type: 'GENERAL' | 'REGIONAL';
  createdAt: Date;
  updatedAt: Date;
}

export class Group {
  private static collection = db.collection('groups');

  private static docToGroup(doc: DocumentSnapshot<DocumentData>): IGroup {
    const data = doc.data();
    if (!data) throw new Error('Document does not exist');
    
    return {
      groupId: data.groupId,
      name: data.name,
      type: data.type,
      createdAt: data.createdAt ? new Date(data.createdAt._seconds * 1000) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt._seconds * 1000) : new Date()
    };
  }

  /**
   * Encuentra un grupo por cualquier filtro
   */
  static async findOne(filter: Partial<IGroup>) {
    try {
      let query: Query<DocumentData> | CollectionReference<DocumentData> = this.collection;
      
      Object.entries(filter).forEach(([key, value]) => {
        query = query.where(key, '==', value);
      });

      const snapshot = await query.limit(1).get();
      if (snapshot.empty) return null;

      return this.docToGroup(snapshot.docs[0]);
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  /**
   * Encuentra un grupo por su ID
   */
  static async findByGroupId(groupId: string) {
    return this.findOne({ groupId });
  }

  /**
   * Crea un nuevo grupo
   */
  static async create(groupData: Pick<IGroup, 'groupId' | 'name' | 'type'>) {
    try {
      const now = new Date();
      const group: IGroup = {
        ...groupData,
        createdAt: now,
        updatedAt: now
      };

      const ref = this.collection.doc(groupData.groupId);
      await ref.set(group);
      
      const doc = await ref.get();
      return this.docToGroup(doc);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Actualiza un grupo existente
   */
  static async update(groupId: string, data: Partial<Omit<IGroup, 'groupId' | 'createdAt'>>) {
    try {
      const ref = this.collection.doc(groupId);
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      await ref.update(updateData);
      const doc = await ref.get();
      return this.docToGroup(doc);
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los grupos de un tipo específico
   */
  static async findByType(type: IGroup['type']) {
    try {
      const snapshot = await this.collection.where('type', '==', type).get();
      return snapshot.docs.map(doc => this.docToGroup(doc));
    } catch (error) {
      console.error('Error finding groups by type:', error);
      throw error;
    }
  }
}