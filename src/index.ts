import { App } from "@slack/bolt";
import { TBAClient, Team } from "./tba";

import * as bk from "./block_kit";
import * as util from "./util";
import * as data from "./data";

import { Context } from "@slack/bolt/dist/types/middleware";

import { FRCBotReceiver } from "./FRCBotReceiver";

import {
  BlockAction,
  ButtonAction,
} from "@slack/bolt/dist/types/actions/block-action";

const tba = new TBAClient(process.env.TBA_API_KEY);

const app = new App({
  token: process.env.SLACK_TOKEN,
  receiver: new FRCBotReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  }),
});

// Slash command listeners
app.command("/frc", async ({ payload, ack, client }) => {
  const parsed = util.parseSlashCommand(payload.text);

  switch (parsed.command) {
    case "team":
      let team = await tba.getTeam(parseInt(parsed.args[0]));

      await ack({
        text: "",
        blocks: bk.team(team),
        response_type: "in_channel",
      });
      break;
    case "subscribe":
    case "watch":
      await ack();
      await client.views.open({
        trigger_id: payload.trigger_id,
        view: bk.subscribeModal(),
      });
      break;
    case "help":
    case null:
    case "":
    default:
      await ack({
        text: "",
        blocks: bk.help(),
      });
      break;
  }
});

// Event listeners
app.event("app_home_opened", async ({ context, body, event }) => {
  await updateAppHome(context, event.user, body.team_id);
});

// Block action listeners
app.action("subscribe_event", async ({ ack, body, client }) => {
  await ack();
  await client.views.open({
    trigger_id: (<BlockAction>body).trigger_id,
    view: bk.subscribeModal(),
  });
});

app.action("event_options", async ({ ack, body, client, context }) => {
  await ack();
  await data.deleteSubscription(
    (<ButtonAction>(<BlockAction>body).actions[0]).value
  );
  await updateAppHome(context, body.user.id, body.team.id);
});

// Shortcut listeners
app.shortcut("subscribe_event", async ({ shortcut, ack, client }) => {
  await ack();
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: bk.subscribeModal(),
  });
});

// Modal submission listeners
app.view("subscribe_event", async ({ view, ack, payload, context, body }) => {
  await ack();
  const event = await tba.getEvent(view.state.values.event.event.value);

  await data.addSubscription(
    payload.team_id,
    view.state.values.channel.channel.selected_channel,
    event
  );
  await updateAppHome(context, body.user.id, body.team.id);
});

async function updateAppHome(
  context: Context,
  user_id: string,
  team_id: string
): Promise<any> {
  await app.client.views.publish({
    user_id: user_id,
    view: bk.appHome(await data.getSubscriptions(team_id)),
    token: context.botToken,
  });
}

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("FRCBot is running!");
})();
