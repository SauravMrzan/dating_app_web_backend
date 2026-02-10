import { MatchModel, IMatch } from "../models/match.model";
import { UserModel, IUser } from "../models/user.model";

export class MatchRepository {
  /**
   * Fetch profiles for swiping based on user preferences in user.model.ts
   */
  async getDiscoveryProfiles(userId: string, currentUser: IUser): Promise<IUser[]> {
    // Get IDs of users already swiped on
    const swipedIds = await MatchModel.find({ fromUser: userId }).distinct("toUser");
    
    // Exclude current user and already swiped users
    const excludeIds = [...swipedIds, userId];

    // Build query using 'interestedIn' and 'preferredCulture' from your model
    const query: any = {
      _id: { $nin: excludeIds },
    };

    if (currentUser.interestedIn !== "Everyone") {
      query.gender = currentUser.interestedIn;
    }

    if (currentUser.preferredCulture && currentUser.preferredCulture.length > 0) {
      query.culture = { $in: currentUser.preferredCulture };
    }

    return await UserModel.find(query).select("-password").limit(20);
  }

  async createSwipe(userData: Partial<IMatch>): Promise<IMatch> {
    const swipe = new MatchModel(userData);
    return await swipe.save();
  }

  async findReciprocalLike(fromUser: string, toUser: string): Promise<IMatch | null> {
    return await MatchModel.findOne({
      fromUser: toUser,
      toUser: fromUser,
      status: 'like'
    });
  }

  async updateToMutual(id: string): Promise<void> {
    await MatchModel.findByIdAndUpdate(id, { isMutual: true });
  }
}