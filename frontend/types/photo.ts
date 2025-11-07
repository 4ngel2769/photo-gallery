export interface Photo {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tags?: string[];
  isPublic: boolean;
}