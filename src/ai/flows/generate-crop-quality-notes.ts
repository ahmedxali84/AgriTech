'use server';

/**
 * @fileOverview An AI agent that generates quality notes for crop listings based on image analysis.
 *
 * - generateCropQualityNotes - A function that handles the generation of crop quality notes.
 * - GenerateCropQualityNotesInput - The input type for the generateCropQualityNotes function.
 * - GenerateCropQualityNotesOutput - The return type for the generateCropQualityNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCropQualityNotesInputSchema = z.object({
  cropPhotoDataUri: z
    .string()
    .describe(
      "A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  cropType: z.string().describe('The type of crop (e.g., rice, wheat, corn).'),
});
export type GenerateCropQualityNotesInput = z.infer<typeof GenerateCropQualityNotesInputSchema>;

const GenerateCropQualityNotesOutputSchema = z.object({
  qualityNotes: z
    .string()
    .describe('AI-generated quality notes for the crop (e.g., Excellent grain uniformity).'),
});
export type GenerateCropQualityNotesOutput = z.infer<typeof GenerateCropQualityNotesOutputSchema>;

export async function generateCropQualityNotes(
  input: GenerateCropQualityNotesInput
): Promise<GenerateCropQualityNotesOutput> {
  return generateCropQualityNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCropQualityNotesPrompt',
  input: {schema: GenerateCropQualityNotesInputSchema},
  output: {schema: GenerateCropQualityNotesOutputSchema},
  prompt: `You are an AI assistant that generates quality notes for crop listings based on image analysis.

  Analyze the provided crop photo and generate concise, informative quality notes that highlight key characteristics.
  The notes should be suitable for display on a crop listing to inform potential buyers.

  Crop Type: {{{cropType}}}
  Crop Photo: {{media url=cropPhotoDataUri}}
  \n`,
});

const generateCropQualityNotesFlow = ai.defineFlow(
  {
    name: 'generateCropQualityNotesFlow',
    inputSchema: GenerateCropQualityNotesInputSchema,
    outputSchema: GenerateCropQualityNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
