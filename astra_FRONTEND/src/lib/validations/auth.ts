import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export const brandProfileSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  brandOrigin: z.string().min(2, "Brand origin is required"),
  brandStory: z.string().min(10, "Brand story must be at least 10 characters"),
  brandLogo: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, "File size must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg"].includes(file.type),
      "Only JPG and JPEG formats are accepted"
    ),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type BrandProfileFormData = z.infer<typeof brandProfileSchema>;
