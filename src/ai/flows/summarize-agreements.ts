'use server';

/**
 * @fileOverview This file defines a Genkit flow to summarize key terms and conditions of agreements reached during negotiations.
 *
 * The flow takes an agreement text as input and returns a summarized version of the agreement.
 * This allows users (farmers or retailers) to quickly review and confirm the details.
 *
 * @interface SummarizeAgreementsInput - Input schema for the summarizeAgreements flow.
 * @interface SummarizeAgreementsOutput - Output schema for the summarizeAgreements flow.
 * @function summarizeAgreements - The main function to summarize agreements.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the summarizeAgreements flow
const SummarizeAgreementsInputSchema = z.object({
  agreementText: z.string().describe('The full text of the agreement to summarize.'),
});

export type SummarizeAgreementsInput = z.infer<typeof SummarizeAgreementsInputSchema>;

// Output schema for the summarizeAgreements flow
const SummarizeAgreementsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key terms and conditions of the agreement.'),
});

export type SummarizeAgreementsOutput = z.infer<typeof SummarizeAgreementsOutputSchema>;

// Main function to summarize agreements
export async function summarizeAgreements(input: SummarizeAgreementsInput): Promise<SummarizeAgreementsOutput> {
  return summarizeAgreementsFlow(input);
}

// Define the prompt for summarizing agreements
const summarizeAgreementsPrompt = ai.definePrompt({
  name: 'summarizeAgreementsPrompt',
  input: {schema: SummarizeAgreementsInputSchema},
  output: {schema: SummarizeAgreementsOutputSchema},
  prompt: `You are an AI assistant helping users quickly understand agreements.
  Summarize the following agreement, highlighting the key terms and conditions, including price, quantity, delivery details, and payment terms. Keep the summary concise and easy to understand.

  Agreement:
  {{agreementText}}`,
});

// Define the Genkit flow for summarizing agreements
const summarizeAgreementsFlow = ai.defineFlow(
  {
    name: 'summarizeAgreementsFlow',
    inputSchema: SummarizeAgreementsInputSchema,
    outputSchema: SummarizeAgreementsOutputSchema,
  },
  async input => {
    const {output} = await summarizeAgreementsPrompt(input);
    return output!;
  }
);
