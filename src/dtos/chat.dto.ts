import { z } from "zod";

/**
 * DTO for validating a Chat message
 */
export const ChatDTO = z.object({
  // The ID of the user you want to send a message to
  toUserId: z.string().min(1, "Recipient userId is required"),

  // The actual message text
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
});

// Export the type for use in controllers/services
export type ChatDTO = z.infer<typeof ChatDTO>;
