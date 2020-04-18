import { implemented } from "./implemented";
import { notImplemented } from "./not-implemented";
import { Auth } from "../../@types/auth-types";

export const adminAuthSdk = {
  ...implemented,
  ...notImplemented
} as Auth;
