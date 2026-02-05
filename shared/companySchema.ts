import { z } from "zod";

export const yearlyDataSchema = z.object({
  year: z.number(),
  sales: z.number(),
  operatingProfit: z.number(),
  cash: z.number(),
  employees: z.number(),
});

export const companySchema = z.object({
  name: z.string(),
  data: z.array(yearlyDataSchema),
});

export const companiesSchema = z.array(companySchema);

export const structuredCompaniesSchema = z.object({
  companies: companiesSchema,
});

export type YearlyData = z.infer<typeof yearlyDataSchema>;
export type Company = z.infer<typeof companySchema>;
