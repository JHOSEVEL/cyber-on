
export enum Difficulty {
  EASY = 'Iniciante',
  MEDIUM = 'Intermediário',
  HARD = 'Avançado',
  INSANE = 'Insano'
}

export enum LabType {
  WALKTHROUGH = 'Guiado',
  CTF = 'Capture The Flag'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  score: number;
  rank?: number; // Numerical global rank (e.g., 1, 2, 3)
  rankTitle?: string; // Named rank (e.g., "Script Kiddie")
  avatarUrl?: string;
  completedLabs: number[]; // Array of Lab IDs
}

export interface LabStep {
  id: number;
  title: string;
  content: string; // Markdown explanation
  question: string; // The question user needs to answer
  answer: string; // The correct answer
  hint?: string;
}

export interface Lab {
  id: number;
  slug: string;
  title: string;
  description: string;
  module: string; // New: Grouping for the track
  steps: LabStep[];
  points: number;
  difficulty: Difficulty;
  type: LabType;
  tags: string[];
  thumbnail: string;
}

export interface LabProgress {
  userId: number;
  labId: number;
  currentStep: number;
  completed: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  score: number;
  rank: number;
  rankTitle: string;
  avatarUrl: string;
}
