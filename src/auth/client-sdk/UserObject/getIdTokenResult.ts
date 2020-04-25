import {IdTokenResult} from "../../../@types";
import {getIdToken} from "./getIdToken";

export async function getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult> {
  return {
    authTime: "",
    claims: {},
    expirationTime: "",
    issuedAtTime: "",
    signInProvider: "",
    signInSecondFactor: "",
    token: await getIdToken()
  };
}
