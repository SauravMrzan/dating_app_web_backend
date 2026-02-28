import { MatchModel, IMatch } from "../models/match.model";
import { UserModel, IUser } from "../models/user.model";

export class MatchRepository {
  async getDiscoveryProfiles(
    userId: string,
    currentUser: IUser,
  ): Promise<IUser[]> {
    const swipedIds = await MatchModel.find({ fromUser: userId }).distinct(
      "toUser",
    );
    const excludeIds = [...swipedIds, userId];

    const query: any = {
      _id: { $nin: excludeIds },
      isDeleted: { $ne: true },
    };

    if (currentUser.interestedIn !== "Everyone") {
      query.gender = currentUser.interestedIn;
    }

    if (
      currentUser.preferredCulture &&
      currentUser.preferredCulture.length > 0
    ) {
      query.culture = { $in: currentUser.preferredCulture };
    }

    if (currentUser.minPreferredAge || currentUser.maxPreferredAge) {
      const today = new Date();
      const minDOB = new Date(
        today.getFullYear() - currentUser.maxPreferredAge,
        today.getMonth(),
        today.getDate(),
      );
      const maxDOB = new Date(
        today.getFullYear() - currentUser.minPreferredAge,
        today.getMonth(),
        today.getDate(),
      );
      query.dateOfBirth = { $gte: minDOB, $lte: maxDOB };
    }

    return await UserModel.find(query).select("-password").limit(20);
  }

  async createSwipe(userData: Partial<IMatch>): Promise<IMatch> {
    const swipe = new MatchModel(userData);
    return await swipe.save();
  }

  async findReciprocalLike(
    fromUser: string,
    toUser: string,
  ): Promise<IMatch | null> {
    return await MatchModel.findOne({
      fromUser: toUser,
      toUser: fromUser,
      status: "like",
    });
  }

  async updateToMutual(id: string): Promise<IMatch | null> {
    return await MatchModel.findByIdAndUpdate(
      id,
      { isMutual: true },
      { new: true },
    );
  }

  async getMatches(userId: string): Promise<IMatch[]> {
    return await MatchModel.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
      isMutual: true,
    })
      .populate("fromUser", "fullName photos")
      .populate("toUser", "fullName photos")
      .sort({ updatedAt: -1 });
  }
}
