export interface Question {
  id: string;
  description: string;
  imageId: string;
  priority: number;
  answers: Array<{
    id: string;
    description: string;
  }>; 
}

export type ViewType = 'welcome' | 'test' | 'summary'; 