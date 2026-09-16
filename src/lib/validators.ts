import { z } from 'zod';

// ── Course Generation ────────────────────────────────────────────
export const courseGenerateSchema = z.object({
  topic: z.string().trim().min(1, 'Topic is required').max(200, 'Topic too long'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  goal: z.enum(['Skill Development', 'Career Growth', 'Academic', 'Hobby', 'Certification']).default('Skill Development'),
  hoursPerDay: z.coerce.number().int().min(1).max(12).default(1),
  duration: z.string().trim().max(50).default('4 weeks'),
});

// ── AI Chat ──────────────────────────────────────────────────────
export const aiChatSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message too long'),
  moduleId: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  currentPage: z.string().optional().nullable(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .default([]),
});

// ── Auth Register ────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

// ── Flashcard Review ─────────────────────────────────────────────
export const flashcardReviewSchema = z.object({
  flashcardId: z.string().min(1, 'Flashcard ID is required'),
  quality: z.coerce.number().int().min(0).max(3),
});

// ── Search ───────────────────────────────────────────────────────
export const searchSchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export type ParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): ParseResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstIssue = result.error.issues?.[0];
    return { success: false, error: firstIssue?.message || 'Invalid input' };
  }
  return { success: true, data: result.data };
}
