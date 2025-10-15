'use server';

/**
 * @fileOverview A flow to suggest counteroffers during deal negotiations between retailers and farmers.
 *
 * - suggestCounterOffer - A function that suggests a counteroffer based on the negotiation history.
 * - SuggestCounterOfferInput - The input type for the suggestCounterOffer function.
 * - SuggestCounterOfferOutput - The return type for the suggestCounterOffer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCounterOfferInputSchema = z.object({
  negotiationHistory: z
    .string()
    .describe('The history of the negotiation between the retailer and the farmer.'),
  currentRetailerOffer: z.number().describe('The current offer made by the retailer.'),
  farmerListingPrice: z.number().describe('The original listing price set by the farmer.'),
});
export type SuggestCounterOfferInput = z.infer<typeof SuggestCounterOfferInputSchema>;

const SuggestCounterOfferOutputSchema = z.object({
  suggestedCounterOffer: z
    .number()
    .describe('The AI-suggested counteroffer for the retailer.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested counteroffer.'),
});
export type SuggestCounterOfferOutput = z.infer<typeof SuggestCounterOfferOutputSchema>;

export async function suggestCounterOffer(input: SuggestCounterOfferInput): Promise<SuggestCounterOfferOutput> {
  return suggestCounterOfferFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCounterOfferPrompt',
  input: {schema: SuggestCounterOfferInputSchema},
  output: {schema: SuggestCounterOfferOutputSchema},
  prompt: `You are an AI assistant helping a retailer negotiate with a farmer for crop prices.

  Given the negotiation history, the retailer's current offer, and the farmer's original listing price, suggest a counteroffer that is likely to be accepted by the farmer.

  Negotiation History: {{{negotiationHistory}}}
  Current Retailer Offer: {{{currentRetailerOffer}}}
  Farmer Listing Price: {{{farmerListingPrice}}}

  Consider factors such as market prices, crop quality (if mentioned in the history), and the urgency of the deal.

  Provide a suggested counteroffer and explain your reasoning. The suggested offer should be a number.
  Ensure the counteroffer is no lower than the current offer, and no higher than the farmer's listing price.

  Format your response as follows:
  {
    "suggestedCounterOffer": <suggested_price>,
    "reasoning": "<reasoning_for_the_suggested_price>"
  }`,
});

const suggestCounterOfferFlow = ai.defineFlow(
  {
    name: 'suggestCounterOfferFlow',
    inputSchema: SuggestCounterOfferInputSchema,
    outputSchema: SuggestCounterOfferOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
