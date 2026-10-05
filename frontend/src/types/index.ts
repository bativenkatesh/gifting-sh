export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  category: 'Heirloom Boxes' | 'Tea & Rituals' | 'Scent & Sanctuary' | 'Epicurean Reserve' | 'Bar & Leather';
  occasion: 'Milestone Celebrations' | 'Executive Gratitude' | 'Weddings & Betrothals' | 'Solace & Sanctuary';
  image: string;
  badge?: string;
  description: string;
  provenance: string;
  contents: string[];
  dimensions?: string;
  isCustomBox?: boolean;
}

export interface CartItem {
  id: string; // unique cart line ID
  productId: string;
  product: Product;
  quantity: number;
  customizations?: {
    boxStyle?: string;
    ribbonColor?: string;
    waxSeal?: string;
    calligraphyNote?: string;
    senderName?: string;
    recipientName?: string;
    itemsIncluded?: string[];
    boxOptionId?: string;
    addonIds?: string[];
    customBox?: { boxId: string; addonIds: string[] };
  };
}

export interface GiftOptions {
  calligraphyNote: string;
  senderName: string;
  recipientName: string;
  ribbonColor: string;
  waxSeal: string;
  packagingPreference: string;
  deliveryDate?: string;
}
