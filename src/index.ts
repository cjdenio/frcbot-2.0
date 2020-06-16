import { App } from "@slack/bolt";
import { TBAClient, Team, Event } from "./tba";

import * as bk from "./block_kit";
import * as util from "./util";
import * as data from "./data";

import { Context } from "@slack/bolt";

import { FRCBotReceiver } from "./FRCBotReceiver";

import installer from "./installer/InstallProvider";

import { BlockAction, OverflowAction } from "@slack/bolt";
import { getNgrokURL } from "./ngrok";

const tba = new TBAClient(process.env.TBA_API_KEY);

const app = new App({
  receiver: new FRCBotReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  }),
  authorize: async ({ teamId }) => {
    return await installer.authorize({ teamId });
  },
});

// Slash command listeners
app.command("/frc", async ({ payload, ack, client }) => {
  const parsed = util.parseSlashCommand(payload.text);

  switch (parsed.command) {
    case "team":
      let team: Team;
      try {
        team = await tba.getTeam(parseInt(parsed.args[0]));
      } catch (e) {
        await ack("I couldn't find that team :cry:");
        return;
      }

      await ack({
        text: "",
        blocks: bk.team(
          team,
          process.env.NODE_ENV == "production" ? null : await getNgrokURL()
        ),
        response_type: "in_channel",
      });
      break;
    case "subscribe":
    case "watch":
      await ack();
      await client.views.open({
        trigger_id: payload.trigger_id,
        view: bk.subscribeModal({
          ...(payload.channel_id.toLowerCase().startsWith("c")
            ? { channel: payload.channel_id }
            : {}),
          ...(parsed.args[0] && parsed.args[0] != ""
            ? { event: parsed.args[0] }
            : {}),
        }),
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

app.event("link_shared", async ({ client, body, event }) => {
  const link = event.links[0];

  switch (link.domain) {
    case "thebluealliance.com":
      const path = new URL(link.url).pathname;

      const teamMatch = path.match(/^\/(?:team\/)?(\d+)(?:\/|$)/i);
      const eventMatch = path.match(/^\/(?:event\/)?(\d{4}\w+)(?:\/|$)/i);

      if (teamMatch) {
        let team: Team;
        try {
          team = await tba.getTeam(parseInt(teamMatch[1]));
        } catch (e) {
          return;
        }
        client.chat.unfurl({
          channel: event.channel,
          ts: event.message_ts,
          unfurls: {
            [link.url]: {
              blocks: bk.team(team),
            },
          },
        });
      } else if (eventMatch) {
        let frcEvent: Event;
        try {
          frcEvent = await tba.getEvent(eventMatch[1]);
        } catch (e) {
          return;
        }
        client.chat.unfurl({
          channel: event.channel,
          ts: event.message_ts,
          unfurls: {
            [link.url]: {
              blocks: bk.event(frcEvent),
            },
          },
        });
      }
      break;
  }
});

// Block action listeners
app.action("subscribe_event", async ({ ack, body, client }) => {
  await ack();
  await client.views.open({
    trigger_id: (<BlockAction>body).trigger_id,
    view: bk.subscribeModal(),
  });
});

app.action(/^subscribe_event:(\w+)$/, async ({ ack, body, client }) => {
  await ack();
  await client.views.open({
    trigger_id: (<BlockAction>body).trigger_id,
    view: bk.subscribeModal({
      event: (<BlockAction>body).actions[0].action_id.match(
        /^subscribe_event:(\w+)$/
      )[1],
    }),
  });
});

app.action(/^event_options:(\w+)$/, async ({ ack, body, client, context }) => {
  await ack();
  const key = (<BlockAction>body).actions[0].action_id.match(
    /^event_options:(\w+)$/
  )[1];

  switch (
    (<OverflowAction>(<BlockAction>body).actions[0]).selected_option.value
  ) {
    case "delete":
      await data.deleteSubscription(key);
      await updateAppHome(context, body.user.id, body.team.id);
      break;
    case "options":
      const subscription = await data.getSubscription(key);
      client.views.open({
        trigger_id: (<BlockAction>body).trigger_id,
        view: bk.subscribeModal({ subscription }),
      });
  }
});

app.action(/^view_on_tba:(.+)$/, async ({ ack }) => {
  // Gotta acknowledge those "View on TBA" button presses
  await ack();
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
app.view(
  "subscribe_event",
  async ({ view, ack, payload, context, body, client }) => {
    let event: Event;

    try {
      event = await tba.getEvent(view.state.values.event.event.value);
    } catch (e) {
      await ack({
        response_action: "errors",
        errors: {
          event: "I couldn't find that event.",
        },
      });
      return;
    }

    const subscription: data.SubscribedEvent = {
      channel: view.state.values.channel.channel.selected_channel,
      team_id: payload.team_id,
      event: {
        key: event.key,
        name: event.name,
      },
      additional_teams:
        view.state.values.additional_teams?.additional_teams?.value?.split(
          /\,\s*/g
        ) || [],
      type: view.state.values.type.type.selected_option.value,
      notification_types: view.state.values.notification_types.notification_types.selected_options.map(
        (i) => i.value
      ),
    };

    if (
      await data.subscriptionExists(
        subscription.team_id,
        subscription.event.key,
        subscription.channel
      )
    ) {
      await ack({
        response_action: "errors",
        errors: {
          event: "You're already subscribed to that event.",
        },
      });
      return;
    }

    await ack();

    await data.addSubscription(subscription);

    // TODO: dynamic app ID
    await client.chat.postMessage({
      channel: subscription.channel,
      blocks: bk.subscriptionAdded(
        { ...subscription, user: body.user.id },
        payload.team_id,
        "A014MDFDM7C"
      ),
      text: `This channel is now subscribed to ${subscription.event.name}!`,
    });
    await updateAppHome(context, body.user.id, body.team.id);
  }
);

app.view("event_options", async ({ ack }) => {
  await ack();
  console.log("Event options submitted");
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
