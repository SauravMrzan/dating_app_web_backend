import { z } from "zod";

/**
 * DTO for validating a Swipe action
 * Matches the pattern used in auth.dto.ts
 */
export const SwipeDTO = z.object({
  // The ID of the user being swiped on
  toUserId: z.string(),
  
  // The action taken (must be 'like' or 'dislike')
  status: z.enum(["like", "dislike"]),
});

// Export the type to be used in the Controller and Service
export type SwipeDTO = z.infer<typeof SwipeDTO>;