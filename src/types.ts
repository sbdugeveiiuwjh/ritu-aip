export type AssistantMode = 'general' | 'writer' | 'image' | 'edit' | 'study' | 'coding';

export type LanguageMode = 'auto' | 'en' | 'hi' | 'hinglish';

export interface ImageAttachment {
  mimeType: string;
  data: string; // Base64 without data URI prefix for API
  previewUrl: string; // Full data URL for <img> src
  name?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  mode?: AssistantMode;
  language?: LanguageMode;
  image?: ImageAttachment;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: AssistantMode;
  language: LanguageMode;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultLanguage: LanguageMode;
  defaultMode: AssistantMode;
  temperature: number; // 0.1 to 1.0
  speechEnabled: boolean;
  disclaimerDismissed: boolean;
}

export interface HealthStatus {
  status: string;
  service: string;
  model: string;
  apiKeyConfigured: boolean;
  uptime: number;
  timestamp: string;
}

export interface GeneratedImageRecord {
  id: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  imageUrl: string;
  timestamp: number;
}

export interface EditedImageRecord {
  id: string;
  originalUrl: string;
  instruction: string;
  editedUrl: string;
  timestamp: number;
}
