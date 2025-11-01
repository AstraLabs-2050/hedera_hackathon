export interface Design {
  id: string;
  title: string;
  collectionName: string | null;
  quantity: number | null;
  price: number | null;
  description: string | null;
  creationFeePaid: boolean;
  status?: string;
  media: Array<{
    id: string;
    link: string;
    mediaType: string;
  }>;
  createdAt: string;
  updatedAt: string;
  userId: string;
  deliveryTime: string | null;
  deliveryRegion: string | null;
  designId: string | null;
  image: string;
  designer: string;
  shipFrom: string;
  fabricDetails: string;
  leadTime: string;
}
