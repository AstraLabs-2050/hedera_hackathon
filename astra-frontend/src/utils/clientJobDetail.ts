export interface ClientJobDetail {
  id: string;
  description: string;
  requirements?: string[];
  attachments?: string[]; // images, files, etc.
  clientName?: string;
  clientAvatar?: string;
  clientRating?: number;
  deadline?: string;
  budget?: number;
}
