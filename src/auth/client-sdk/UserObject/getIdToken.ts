import { authAdminApi } from "../../state-mgmt/authAdminApi";
import { atRandom } from "../../../shared/atRandom";

export async function getIdToken() {
  const user = authAdminApi.getCurrentUser();
  const userConfig = authAdminApi
    .getAuthConfig()
    .validEmailUsers.find(i => i.email === user.email);

  if (!user) {
    throw new Error("not logged in");
  }
  if (userConfig.tokenIds) {
    return atRandom(userConfig.tokenIds);
  } else {
    return Math.random()
      .toString(36)
      .substr(2, 10);
  }
}
