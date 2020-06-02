import { App } from "@slack/bolt";
import * as dotenv from "dotenv";
import { TBAClient, Team } from "./tba";

import * as bk from "./block_kit";

import * as util from "./util";

dotenv.config();

const tba = new TBAClient(process.env.TBA_API_KEY);

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command("/frc", async ({ payload, ack }) => {
  const parsed = util.parseSlashCommand(payload.text);

  switch (parsed.command) {
    case "team":
      let team = await tba.getTeam(parseInt(parsed.args[0]));

      ack({
        text: "",
        blocks: bk.team(team),
      });
      break;
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("FRCBot is running!");
})();
