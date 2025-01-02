import { Schema, model, Document, Model } from 'mongoose';

export interface IGroup extends Document {
  groupId: string;
  name: string;
  type: 'GENERAL' | 'REGIONAL';
  createdAt: Date;
  updatedAt: Date;
}

interface IGroupModel extends Model<IGroup> {
  // Métodos estáticos si los necesitas
}

const groupSchema = new Schema<IGroup>({
  groupId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['GENERAL', 'REGIONAL'] },
}, { timestamps: true });

export default groupSchema;