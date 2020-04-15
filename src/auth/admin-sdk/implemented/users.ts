import {
  Auth,
  CreateRequest,
  UserRecord,
  UpdateRequest,
  ListUsersResult
} from "..";

export const users: Partial<Auth> = {
  // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
  async createUser(properties: CreateRequest): Promise<UserRecord> {
    return;
  },
  /** Updates an existing user. */
  async updateUser(
    uid: string,
    properties: UpdateRequest
  ): Promise<UserRecord> {
    return;
  },
  async deleteUser(uid: string): Promise<void> {
    return;
  },
  async getUserByEmail(email: string): Promise<UserRecord> {
    return;
  },
  async getUserByPhoneNumber(phoneNumber: string): Promise<UserRecord> {
    return;
  },
  async listUsers(
    maxResults?: undefined | number,
    pageToken?: undefined | string
  ): Promise<ListUsersResult> {
    return;
  }
};
