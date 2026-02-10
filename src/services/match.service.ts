import { MatchRepository } from "../repositories/match.repository";

export class MatchService {
  private matchRepository = new MatchRepository();

  async getDiscovery(userId: string, currentUser: any) {
    return await this.matchRepository.getDiscoveryProfiles(userId, currentUser);
  }

  async swipe(fromUserId: string, toUserId: string, status: 'like' | 'dislike') {
    const swipe = await this.matchRepository.createSwipe({
      fromUser: fromUserId as any,
      toUser: toUserId as any,
      status
    });

    if (status === 'like') {
      const partnerLike = await this.matchRepository.findReciprocalLike(fromUserId, toUserId);
      
      if (partnerLike) {
        // Correctly converting ObjectIds to strings to avoid TS errors shown in your screenshot
        await this.matchRepository.updateToMutual((swipe._id as any).toString());
        await this.matchRepository.updateToMutual((partnerLike._id as any).toString());
        return { isMatch: true };
      }
    }
    return { isMatch: false };
  }
}