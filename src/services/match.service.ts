import { MatchRepository } from "../repositories/match.repository";
import { IMatch } from "../models/match.model";
import { UserRepository } from "../repositories/user.repository";
import { sendEmail } from "../utils/email";
import { logError, logInfo } from "../utils/logger";
import { NotificationModel } from "../models/notification.model";

export class MatchService {
  private matchRepository = new MatchRepository();
  private userRepository = new UserRepository();

  private buildMatchEmailHtml(recipientName: string, matchedWithName: string) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">It's a Match 🎉</h2>
        <p>Hi ${recipientName},</p>
        <p>You and <strong>${matchedWithName}</strong> liked each other.</p>
        <p>Open the app to start chatting now.</p>
        <p style="margin-top: 20px;">- Dating App Team</p>
      </div>
    `;
  }

  private async sendMatchNotificationEmails(fromUserId: string, toUserId: string) {
    try {
      const [fromUser, toUser] = await Promise.all([
        this.userRepository.getUserById(fromUserId),
        this.userRepository.getUserById(toUserId),
      ]);

      if (!fromUser || !toUser) {
        logError("Unable to send match email: one or both users not found", {
          fromUserId,
          toUserId,
        });
        return;
      }

      const fromUserName = fromUser.fullName || "there";
      const toUserName = toUser.fullName || "there";

      const emailResults = await Promise.allSettled([
        sendEmail(
          fromUser.email,
          "You have a new match!",
          this.buildMatchEmailHtml(fromUserName, toUserName),
        ),
        sendEmail(
          toUser.email,
          "You have a new match!",
          this.buildMatchEmailHtml(toUserName, fromUserName),
        ),
      ]);

      const failedEmails = emailResults
        .map((result, index) => ({ result, target: index === 0 ? fromUser.email : toUser.email }))
        .filter((item) => item.result.status === "rejected");

      if (failedEmails.length > 0) {
        logError("Some match email notifications failed", {
          fromUserId,
          toUserId,
          failedTargets: failedEmails.map((item) => item.target),
          reasons: failedEmails.map((item) =>
            item.result.status === "rejected" ? item.result.reason : null,
          ),
        });
      } else {
        logInfo("Match email notifications sent", { fromUserId, toUserId });
      }
    } catch (error) {
      logError("Failed to send match notification emails", error);
    }
  }

  private async createInAppMatchNotifications(fromUserId: string, toUserId: string) {
    try {
      const [fromUser, toUser] = await Promise.all([
        this.userRepository.getUserById(fromUserId),
        this.userRepository.getUserById(toUserId),
      ]);

      if (!fromUser || !toUser) {
        logError("Unable to create match notifications: one or both users not found", {
          fromUserId,
          toUserId,
        });
        return;
      }

      await NotificationModel.insertMany([
        {
          user: fromUser._id,
          type: "new_match",
          message: `It's a match with ${toUser.fullName}! Start chatting now.`,
          isRead: false,
        },
        {
          user: toUser._id,
          type: "new_match",
          message: `It's a match with ${fromUser.fullName}! Start chatting now.`,
          isRead: false,
        },
      ]);

      logInfo("In-app match notifications created", { fromUserId, toUserId });
    } catch (error) {
      logError("Failed to create in-app match notifications", error);
    }
  }

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

        await Promise.allSettled([
          this.sendMatchNotificationEmails(fromUserId, toUserId),
          this.createInAppMatchNotifications(fromUserId, toUserId),
        ]);

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
