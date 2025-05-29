export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  highlights: string[];
  targetAudience: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
