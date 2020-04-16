import { Auth } from ".";
import { users, claims, tokens } from "./implemented/index";

export const implemented: Partial<Auth> = {
  ...users,
  ...claims,
  ...tokens
};
