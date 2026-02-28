import { MatchRepository } from "../repositories/match.repository";
import { IMatch } from "../models/match.model";

export class MatchService {
  private matchRepository = new MatchRepository();

  async getDiscovery(userId: string, currentUser: any) {
    return await this.matchRepository.getDiscoveryProfiles(userId, currentUser);
  }

  async swipe(
    fromUserId: string,
    toUserId: string,
    status: "like" | "dislike",
  ): Promise<{ isMatch: boolean; match?: IMatch }> {
    // Create swipe record
    const swipe = await this.matchRepository.createSwipe({
      fromUser: fromUserId as any,
      toUser: toUserId as any,
      status,
      isMutual: false, // default
    });

    // Only check reciprocal if this swipe is a "like"
    if (status === "like") {
      const partnerLike = await this.matchRepository.findReciprocalLike(
        fromUserId,
        toUserId,
      );

      if (partnerLike) {
        // ✅ Update both swipes to mutual
        const updatedSwipe = await this.matchRepository.updateToMutual(
          (swipe._id as any).toString(),
        );
        const updatedPartner = await this.matchRepository.updateToMutual(
          (partnerLike._id as any).toString(),
        );

        // Return the updated match object so controller can send matchId
        return { isMatch: true, match: updatedPartner || updatedSwipe! };
      }
    }

    return { isMatch: false };
  }

  async getMatches(userId: string): Promise<IMatch[]> {
    const matches = await this.matchRepository.getMatches(userId);
    return matches || [];
  }
}
