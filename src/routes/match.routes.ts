import { Router } from "express";
import { MatchController } from "../controllers/match.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const matchController = new MatchController();

router.get("/discovery", authorizedMiddleware, matchController.getDiscovery);
router.post("/swipe", authorizedMiddleware, matchController.swipe);

export default router;