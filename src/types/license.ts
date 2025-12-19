export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  variantsCount: number;
  salesCount: number;
  isAvailable: boolean;
  createdAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productDescription: string;
  productImage: string | null;
  variantId: string | null;
  variantName: string | null;
  variantPrice: number | null;
  variantSku: string | null;
  quantity: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  shippingAddress: string | null;
  paymentMethod: string;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseApplication {
  id: string;
  userId: string;
  ipId: string;
  licenseType: string;
  territory: string;
  duration: number;
  feeModel: string;
  amount: number;
  status: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  approvedAt: Date | null;
}

export interface RoyaltyReport {
  id: string;
  licenseId: string;
  period: string;
  salesAmount: number;
  royaltyAmount: number;
  paidAmount: number;
  status: string;
  generatedAt: Date;
}