'use server';

/**
 * @fileOverview An AI agent that generates a realistic image of a crop.
 *
 * - generateCropImage - A function that handles the generation of a crop image.
 * - GenerateCropImageInput - The input type for the generateCropImage function.
 * - GenerateCropImageOutput - The return type for the generateCropImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCropImageInputSchema = z.object({
  cropType: z.string().describe('The type of crop to generate an image for (e.g., Wheat, Rice).'),
});
export type GenerateCropImageInput = z.infer<typeof GenerateCropImageInputSchema>;

const GenerateCropImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The data URI of the generated crop image.'),
});
export type GenerateCropImageOutput = z.infer<typeof GenerateCropImageOutputSchema>;

export async function generateCropImage(input: GenerateCropImageInput): Promise<GenerateCropImageOutput> {
  return generateCropImageFlow(input);
}

const generateCropImageFlow = ai.defineFlow(
  {
    name: 'generateCropImageFlow',
    inputSchema: GenerateCropImageInputSchema,
    outputSchema: GenerateCropImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a photorealistic image of harvested ${input.cropType}. The image should be high quality, well-lit, and suitable for a marketplace listing. Show the crop in a clean, appealing presentation, perhaps in a wooden bowl or on a simple surface.`,
    });
    
    if (!media.url) {
        throw new Error("Image generation failed to produce a URL.");
    }

    return {imageUrl: media.url};
  }
);
