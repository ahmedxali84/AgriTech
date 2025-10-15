import type { ImagePlaceholder } from "./placeholder-images";

export type User = {
  id: string;
  name: string;
  role: 'farmer' | 'retailer';
  avatar: string;
  avatarFallback: string;
  location: string;
  verification: 'Verified' | 'Trusted' | 'New';
  reputation: number;
  companyName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type CropListing = {
  id: string;
  farmerId: string;
  cropType: string;
  quantity: number; // in metric tons
  price: number; // per ton
  location: string;
  city?: string;
  country?: string;
  images: ImagePlaceholder[];
  qualityNotes?: string;
  status: 'Listed' | 'Negotiating' | 'Sold' | 'Paid';
  aiVerified: boolean;
  listingDate: string; // Changed from Timestamp
};

export type Deal = {
  id: string;
  listingId: string;
  retailerId: string;
  farmerId: string;
  status: 'Negotiating' | 'Agreement' | 'Signed' | 'Paid' | 'Completed' | 'Cancelled';
  agreementSummary?: string;
};
