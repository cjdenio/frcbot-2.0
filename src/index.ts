import { App } from "@slack/bolt";
import * as dotenv from "dotenv";
import { TBAClient, Team } from "./tba";

import * as bk from "./block_kit";

dotenv.config();

const tbaClient = new TBAClient(process.env.TBA_API_KEY);

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command("/frc", async ({ payload, ack, say }) => {
  let team: Team;
  try {
    team = await tbaClient.getTeam(parseInt(payload.text));
  } catch (e) {
    console.log(e);
    ack("Error :cry:");
    return;
  }
  ack({
    text: "",
    blocks: bk.team(team),
    response_type: "in_channel",
  });
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("FRCBot is running!");
})();
