import {
  Auth,
  CreateRequest,
  UserRecord,
  UpdateRequest,
  ListUsersResult
} from "../../../@types/auth-types";
import {
  addUser,
  updateUser,
  getUserById,
  removeUser,
  getUserByEmail,
  allUsers
} from "../../state-mgmt";
import { networkDelay } from "../../../shared";

export const users: Partial<Auth> = {
  // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
  async createUser(properties: CreateRequest): Promise<UserRecord> {
    addUser({
      password: Math.random()
        .toString(36)
        .substr(2, 10),
      multiFactor: null as any,
      ...properties
    });
    return {
      ...(properties as Required<CreateRequest>),
      metadata: {
        lastSignInTime: null,
        creationTime: String(new Date()),
        toJSON() {
          return {};
        }
      },
      multiFactor: null as any,
      toJSON: () => null as any,
      providerData: null as any
    };
  },
  /** Updates an existing user. */
  async updateUser(
    uid: string,
    properties: UpdateRequest
  ): Promise<UserRecord> {
    updateUser(uid, properties);
    return getUserById(uid);
  },
  async deleteUser(uid: string): Promise<void> {
    await networkDelay();
    removeUser(uid);
  },
  async getUserByEmail(email: string): Promise<UserRecord> {
    await networkDelay();
    return getUserByEmail(email);
  },
  async getUserByPhoneNumber(phoneNumber: string): Promise<UserRecord> {
    return;
  },
  async listUsers(
    maxResults?: undefined | number,
    pageToken?: undefined | string
  ): Promise<ListUsersResult> {
    await networkDelay();
    return { users: maxResults ? allUsers().slice(0, maxResults) : allUsers() };
  }
};
