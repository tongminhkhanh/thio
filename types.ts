

export interface PromptContent {
  guidelines: string[];
  role: string;
  task: string;
}

export interface InputField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'file';
  placeholder?: string;
  options?: string[]; // Used if type is 'select'
  defaultValue?: string;
  height?: string; // tailwind class for height e.g. 'h-32'
  accept?: string; // Used if type is 'file', e.g., '.pdf'
}

export interface PromptDefinition {
  id: string;
  title: string;
  description: string;
  content: PromptContent;
  tags: string[];
  inputs: InputField[]; // Dynamic inputs definition
  isImageTool?: boolean; // Flag to identify image generation tools
  isAudioTool?: boolean; // Flag to identify audio generation tools (TTS)
  useSearch?: boolean; // Flag to use Google Search Grounding
  useThinking?: boolean; // Flag to enable Thinking Config (Gemini 2.5)
}

export interface AppData {
  meta: {
    generated_at: string;
    level: string;
    model: string;
  };
  prompts: PromptDefinition[];
}

export enum AppView {
  WELCOME = 'WELCOME',
  DASHBOARD = 'DASHBOARD',
  TOOL = 'TOOL',
  GUIDE = 'GUIDE',
  CHAT = 'CHAT'
}