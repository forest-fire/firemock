import type { auth } from "firebase-admin"
import { implemented } from "./implemented"
import { notImplemented } from "./not-implemented"

export type Auth = auth.Auth

export const adminAuthSdk = {
  ...implemented,
  ...notImplemented
} as Auth
