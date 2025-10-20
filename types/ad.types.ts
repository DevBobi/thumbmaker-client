import { Product } from "@/contexts/ProductContext";

export type BrandTone =
  | "Friendly & Casual"
  | "Professional & Concise"
  | "Edgy & Humorous"
  | "Inspirational & Motivational"
  | "Sophisticated & Luxurious";

export type AdTemplate = {
  id: string;
  image: string;
  category: string;
  brand: string;
  niche: string;
  subNiche: string;
  tags: string[];
  isCustom?: boolean;
};

export type AdCopy = {
  templateId: string;
  headline: string;
  subtitle: string;
  bodyText: string;
  callToAction: string;
};

export type ChatMessage = {
  id: string;
  sender: "user" | "system";
  content: string;
  timestamp: Date;
};

export type ChatThread = {
  id: string;
  adId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
};

export type GeneratedAd = {
  id: string;
  templateId: string;
  imageUrl: string;
  finalImageUrl?: string; // URL to the final rendered image with text
  textlessImageUrl?: string; // URL to the image without text
  adCopy: AdCopy;
  chatThreads: ChatThread[];
  createdAt: Date;
  aspectRatio: string;
};

export type AdData = {
  product: Product | null;
  mediaFiles: File[];
  brandTone: BrandTone | null;
  additionalContext: string;
  callToAction: string;
  additionalInstructions: string;
  selectedTemplates: AdTemplate[];
  adCopy: AdCopy[];
  generatedAds: GeneratedAd[];
};
