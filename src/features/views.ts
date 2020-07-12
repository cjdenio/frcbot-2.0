import { App, BlockAction, OverflowAction } from "@slack/bolt";
import * as bk from "../block_kit";
import * as data from "../data";
import { Event, TBAClient } from "../tba";
import { updateAppHome } from "../util/slackhelpers";

const tba = new TBAClient(process.env.TBA_API_KEY);

export function initViews(app: App) {
  // Modal submission listeners
  app.view("set_team_number", async ({ view, ack, body, context }) => {
    const value = view.state.values.team_number.team_number.value;

    if (!/^\d+$/.test(value)) {
      await ack({
        response_action: "errors",
        errors: {
          team_number: "Please enter a number",
        },
      });
      return;
    }

    await ack();
    await data.setTeamNumber(body.team.id, value);
    await updateAppHome(body.user.id, body.team.id);
  });

  app.view("subscribe_event", async (d) => {
    await upsertSubscription(d, "insert");
  });

  app.view(/^event_options:(.+)$/i, async (d) => {
    await upsertSubscription(d, "update");
  });

  async function upsertSubscription(
    { view, ack, payload, context, body, client },
    mode: "update" | "insert"
  ) {
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

    if (mode == "insert") {
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
    } else {
      await ack();
      await data.updateSubscription(
        subscription,
        view.callback_id.match(/^event_options:(.+)$/i)[1]
      );
    }

    await updateAppHome(body.user.id, body.team.id);
  }
}
