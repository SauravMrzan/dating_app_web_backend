import { Router } from "express";
import { MatchController } from "../controllers/match.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { profileCompletionMiddleware } from "../middleware/profile-completion.middleware";

const router = Router();
const matchController = new MatchController();

// ✅ Discovery feed (respects interestedIn and preferredCulture)
router.get(
  "/discovery",
  authorizedMiddleware,
  profileCompletionMiddleware,
  matchController.getDiscovery.bind(matchController),
);

// ✅ Fetch all mutual matches
router.get(
  "/matches",
  authorizedMiddleware,
  profileCompletionMiddleware,
  matchController.getMatches.bind(matchController),
);

// ✅ Swipe action (like/dislike, checks reciprocal likes)
router.post(
  "/swipe",
  authorizedMiddleware,
  profileCompletionMiddleware,
  matchController.swipe.bind(matchController),
);

export default router;