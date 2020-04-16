import {
  Auth,
  CreateRequest,
  UserRecord,
  UpdateRequest,
  ListUsersResult
} from "..";
import { addUser } from "../../state-mgmt";

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
      toJSON: () => properties,
      providerData: null as any
    };
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
