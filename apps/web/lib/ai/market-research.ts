import { z } from "zod";
import { aiGenerateObject } from "./client";

const RegionalSalarySchema = z.object({
  min: z.number().positive(),
  max: z.number().positive(),
  currency: z.string().length(3),
  period: z.literal("year"),
  source: z.string(),
});

const MarketDataSchema = z.object({
  regionalSalary: z.record(
    z.enum(["US", "EU", "AE", "SA"]),
    RegionalSalarySchema
  ),
  hiringContext: z.string().min(20).max(500),
});

export type MarketData = z.infer<typeof MarketDataSchema>;

export async function researchMarketData(
  trackValue: string,
  trackLabel: string
): Promise<MarketData> {
  const result = await aiGenerateObject({
    speed: "fast",
    schema: MarketDataSchema,
    system: `You are a market research analyst specializing in tech talent. Provide accurate, current salary data for software engineers by region. Use your knowledge of 2026 market conditions.`,
    prompt: `Research current job market conditions for "${trackLabel}" engineers. Provide:

1. Regional salary ranges (min-max per year):
   - US (USD): Based on SF/NYC/remote tech market
   - EU (EUR): Based on Berlin/London/Amsterdam tech hubs
   - AE (AED): Based on Dubai/Abu Dhabi market (tax-free benefits)
   - SA (SAR): Based on Riyadh/Saudi tech sector growth

2. A 1-2 sentence hiring context about market demand/growth for this role.

Format as JSON with regionalSalary object and hiringContext string.`,
    feature: "market_research",
  });

  return result;
}
