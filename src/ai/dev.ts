import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-quality-notes.ts';
import '@/ai/flows/summarize-agreements.ts';
import '@/ai/flows/suggest-counter-offers.ts';
