import mongoose, { Schema, Document } from 'mongoose';

interface IContainerEntry extends Document {
  containerNumber: string;
  formENumbers: string[];
  company: string;
  imageUrl?: string;
  submitted: boolean;
  date: string;
}

const ContainerEntrySchema: Schema = new Schema({
  containerNumber: { type: String, required: true },
  formENumbers: { type: [String], required: true },
  company: { type: String, required: true },
  imageUrl: { type: String },
  submitted: { type: Boolean, default: false },
  date: { type: String, required: true },
});

export default mongoose.models.ContainerEntry ||
  mongoose.model<IContainerEntry>('ContainerEntry', ContainerEntrySchema);
