import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '../types'; // Impor tipe

// Buat interface untuk Dokumen Mongoose
export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const UserSchema: Schema<IUserDocument> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

// Mencegah model di-compile ulang saat hot-reload
const User: Model<IUserDocument> = mongoose.models.User || 
                                 mongoose.model<IUserDocument>('User', UserSchema);
export default User;