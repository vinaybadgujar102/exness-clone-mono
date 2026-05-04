import { z } from "zod";

export const binancePriceTickSchema = z.object({
  stream: z.string(),
  data: z.object({
    e: z.string(),
    E: z.number(),
    s: z.string(),
    a: z.number(),
    p: z.string(),
    q: z.string(),
    f: z.number(),
    l: z.number(),
    T: z.number(),
    m: z.boolean(),
    M: z.boolean(),
  }),
});

export const subscribeResponseSchema = z.object({
  result: z.null(),
  id: z.number(),
});

export const binanceSubscribeDataSchema = z.union([
  subscribeResponseSchema,
  binancePriceTickSchema,
]);
