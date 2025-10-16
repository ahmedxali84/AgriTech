import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-quality-notes.ts';
import '@/ai/flows/summarize-agreements.ts';
import '@/ai_flows/suggest-counter-offers.ts';
import '@/ai/flows/generate-crop-image.ts';
