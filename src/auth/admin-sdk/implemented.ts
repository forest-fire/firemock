import { users, claims, tokens } from "./implemented/index";
import { Auth } from "../../@types/auth-types";

export const implemented: Partial<Auth> = {
  ...users,
  ...claims,
  ...tokens
};
