export interface Question {
  id: string;
  description: string;
  imageId: string;
  priority: number;
  correctAnswerId: string;
  answers: Array<{
    id: string;
    description: string;
  }>;
}

export type ViewType = 'welcome' | 'test' | 'summary'; 