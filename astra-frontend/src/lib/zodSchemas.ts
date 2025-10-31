import { z } from "zod";

export const joinMakerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Phone number is required"),
  craft: z.string().min(3, "Describe what you make"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  city: z.string().min(2, "Location is required"),
});

export type JoinMakerInput = z.infer<typeof joinMakerSchema>;
