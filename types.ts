export type WebsiteCategory = 'Game' | 'MBTI';

export interface Website {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: WebsiteCategory;
}
