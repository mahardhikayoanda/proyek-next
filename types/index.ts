import { Types } from 'mongoose';

export interface IReview {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface IProduct {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  numReviews: number;
  reviews: IReview[];
}

export interface IOrderItem {
  _id?: Types.ObjectId;
  name: string;
  qty: number;
  image: string;
  price: number;
  product: Types.ObjectId; // Referensi ke IProduct
}

export interface IShippingInfo {
  fullName: string;
  address: string;
  phone: string;
}

export interface IOrder {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // Referensi ke IUser
  orderItems: IOrderItem[];
  shippingInfo: IShippingInfo;
  paymentMethod: 'Cash' | 'Transfer';
  totalPrice: number;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';
  deliveredAt?: Date;
  createdAt?: Date;
}

export interface IUser {
   _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Dibuat opsional karena tidak selalu di-query
  role: 'customer' | 'admin';
}
