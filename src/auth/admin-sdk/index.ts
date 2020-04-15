export type Auth = import("firebase-admin").auth.Auth;
export type CreateRequest = import("firebase-admin").auth.CreateRequest;
export type UserRecord = import("firebase-admin").auth.UserRecord;
export type UpdateRequest = import("firebase-admin").auth.UpdateRequest;
export type DecodedIdToken = import("firebase-admin").auth.DecodedIdToken;
export type ListUsersResult = import("firebase-admin").auth.ListUsersResult;
export type ActionCodeSettings = import("firebase-admin").auth.ActionCodeSettings;

import { implemented } from "./implemented";
import { notImplemented } from "./not-implemented";

export const adminAuthSdk = {
  ...implemented,
  ...notImplemented
} as Auth;
