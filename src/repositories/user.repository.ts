import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  getPaginatedUsers(
    page: number,
    limit: number,
    sortField: string,
    sortOrder: "asc" | "desc",
    filters: Record<string, any>,
  ): Promise<{ users: IUser[]; total: number }>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email }).select("+password +role");
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find();
  }

  // Pagination + Sorting + Filtering
  async getPaginatedUsers(
    page: number,
    limit: number,
    sortField: string,
    sortOrder: "asc" | "desc",
    filters: Record<string, any>,
  ): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build query dynamically from filters
    const query: any = {};
    if (filters.role) query.role = filters.role;
    if (filters.culture) query.culture = filters.culture;
    if (filters.gender) query.gender = filters.gender;

    // Sorting
    const sort: any = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .select("-password"),
      UserModel.countDocuments(query),
    ]);

    return { users, total };
  }

  async updateUser(
    id: string,
    updateData: Partial<IUser>,
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }
}
