import { App } from "@slack/bolt";
import * as dotenv from "dotenv";
import { TBAClient, Team } from "./tba";

import * as bk from "./block_kit";
import * as util from "./util";
import * as data from "./data";

import { BlockAction } from "@slack/bolt/dist/types/actions/block-action";

dotenv.config();

const tba = new TBAClient(process.env.TBA_API_KEY);

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command("/frc", async ({ payload, ack, client }) => {
  const parsed = util.parseSlashCommand(payload.text);

  switch (parsed.command) {
    case "team":
      let team = await tba.getTeam(parseInt(parsed.args[0]));

      ack({
        text: "",
        blocks: bk.team(team),
      });
      break;
    case "watch":
      ack();
      client.views.open({
        trigger_id: payload.trigger_id,
        view: bk.subscribeModal(),
      });
      break;
    case null:
    case "":
    default:
      ack({
        text: "",
        blocks: bk.help(),
      });
      break;
  }
});

app.event("app_home_opened", async ({ event, client, body }) => {
  const tbaEvent = await tba.getEvent("2019mabos");
  client.views.publish({
    user_id: event.user,
    view: bk.appHome(await data.getSubscriptions(body.team_id)),
  });
});

app.action("subscribe_event", async ({ ack, body, client }) => {
  ack();
  client.views.open({
    trigger_id: (<BlockAction>body).trigger_id,
    view: bk.subscribeModal(),
  });
});

app.shortcut("subscribe_event", async ({ shortcut, ack, client }) => {
  ack();
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: bk.subscribeModal(),
  });
});

app.view("subscribe_event", async ({ view, ack, payload }) => {
  ack();
  const event = await tba.getEvent(view.state.values.event.event.value);

  data.addSubscription(
    payload.team_id,
    view.state.values.channel.channel.selected_channel,
    event
  );
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("FRCBot is running!");
})();
