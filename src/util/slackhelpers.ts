import { WebClient } from "@slack/web-api";
import * as bk from "../block_kit";
import * as data from "../data";

export async function updateAppHome(
  user_id: string,
  team_id: string
): Promise<void> {
  let subscriptions = await data.getSubscriptions(team_id);
  let {
    team_number,
    bot: { token },
  } = await data.getInstallation({ teamId: team_id });
  const slack = new WebClient(token);

  await slack.views.publish({
    view: bk.appHome(subscriptions, team_number),
    user_id,
  });
}
