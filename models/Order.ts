import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IOrder, IOrderItem, IShippingInfo } from '../types'; // Impor tipe

// Interface untuk Order Document
export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}

// Skema untuk sub-document IOrderItem
// Tidak perlu diekspor
const OrderItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
});

// Skema untuk sub-document IShippingInfo
// Tidak perlu diekspor
const ShippingInfoSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
});

const OrderSchema: Schema<IOrderDocument> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [OrderItemSchema],
  shippingInfo: ShippingInfoSchema,
  paymentMethod: { type: String, enum: ['Cash', 'Transfer'], required: true },
  totalPrice: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'processed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveredAt: { type: Date },
}, { timestamps: true });

const Order: Model<IOrderDocument> = mongoose.models.Order || 
                                   mongoose.model<IOrderDocument>('Order', OrderSchema);
export default Order;