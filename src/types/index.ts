export interface IUser {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession {
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  steps: number;
  distance: number;
  avgPace: number;
  calories: number;
  movementData: IMovementData[];
  metadata?: Record<string, any>;
}

export interface IMovementData {
  timestamp: Date;
  stepCount: number;
  speed: number;
  cadence: number;
  elevation?: number;
  heartRate?: number;
}

export interface IAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  totalSteps: number;
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  avgPace: number;
  sessionsCount: number;
  startDate: Date;
  endDate: Date;
}

export interface IProgress {
  userId: string;
  date: Date;
  steps: number;
  distance: number;
  duration: number;
  calories: number;
  achievements: string[];
}

export interface IAIFeedback {
  sessionId: string;
  feedback: string;
  suggestions: string[];
  score: number;
  strengths: string[];
  improvements: string[];
}
