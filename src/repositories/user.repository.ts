import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  /**
   * Create a new user record
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  /**
   * Fetch user by email
   * Used during Login and Registration checks
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    // We use .select("+password") just in case your model
    // has the password field hidden by default.
    return await UserModel.findOne({ email: email }).select("+password +role");
  }

  /**
   * Fetch user by their MongoDB _id
   */
  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  /**
   * Fetch all users
   */
  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find();
  }

  /**
   * Update user details
   * Returns the updated document
   */
  async updateUser(
    id: string,
    updateData: Partial<IUser>,
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true, // Return the document AFTER update
      runValidators: true, // Ensure Zod/Mongoose rules still apply
    });
  }

  /**
   * Remove user from database
   */
  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }
}
