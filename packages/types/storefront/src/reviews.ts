export interface ReviewsResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: Review[];
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface Review {
  id: string;
  comment: string;
  rating: number;
  images: string[];
  createdAt: string;
  verifiedPurchase: boolean;
  sellerResponse: string | null;
  sellerRespondedAt: string | null;
  platform: string;
  user: ReviewUser;
}

export interface ReviewUser {
  id: string;
  fullName: string;
  email: string;
}
