export interface MicroPageBlockContent {
  heading?: string;
  body?: string;
  imageKey?: string;
  imageKeys?: string[];
  buttonText?: string;
  buttonLink?: string;
}

export type MicroPageContent = Record<string, MicroPageBlockContent>;
