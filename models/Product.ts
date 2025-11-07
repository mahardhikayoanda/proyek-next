import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IProduct, IReview } from '../types'; // Impor tipe

// Interface untuk Review Sub-document
// Kita tidak mengekspor ini karena hanya relevan di dalam Product
interface IReviewDocument extends IReview, Document {
  _id: Types.ObjectId;
}

// Interface untuk Product Document
export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}

const ReviewSchema: Schema<IReviewDocument> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const ProductSchema: Schema<IProductDocument> = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [ReviewSchema], // Gunakan sub-document schema
}, { timestamps: true });

const Product: Model<IProductDocument> = mongoose.models.Product || 
                                       mongoose.model<IProductDocument>('Product', ProductSchema);
export default Product;