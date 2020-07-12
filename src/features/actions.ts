import { App, BlockAction, OverflowAction } from "@slack/bolt";
import * as bk from "../block_kit";
import * as data from "../data";
import { updateAppHome } from "../util/slackhelpers";

export function initActions(app: App) {
  // Block action listeners
  app.action("subscribe_event", async ({ ack, body, client }) => {
    await ack();
    await client.views.open({
      trigger_id: (body as BlockAction).trigger_id,
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

  app.action(
    /^event_options:(\w+)$/,
    async ({ ack, body, client, context }) => {
      await ack();
      const key = (body as BlockAction).actions[0].action_id.match(
        /^event_options:(\w+)$/
      )[1];

      switch (
        ((body as BlockAction).actions[0] as OverflowAction).selected_option
          .value
      ) {
        case "delete":
          await data.deleteSubscription(key);
          await updateAppHome(body.user.id, body.team.id);
          break;
        case "options":
          const subscription = await data.getSubscription(key);
          client.views.open({
            trigger_id: (<BlockAction>body).trigger_id,
            view: bk.subscribeModal({ subscription }),
          });
      }
    }
  );

  app.action(
    "set_team_number",
    async ({ ack, client, body, action, payload }) => {
      await ack();
      client.views.open({
        view: bk.setTeamNumberModal(),
        trigger_id: (body as BlockAction).trigger_id,
      });
    }
  );

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
}
