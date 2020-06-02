import { View } from "@slack/types";
import { SubscribedEvent } from "../data";

export function appHome(events: SubscribedEvent[]): View {
  return {
    type: "home",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Subscribed Events*",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Subscribe to an event",
          },
          action_id: "subscribe_event",
        },
      },
      {
          type: "divider"
      },
      ...events.map((item) => {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<https://www.thebluealliance.com/event/${item.event.key}|*${item.event.name || item.event.key}*> in <#${item.channel}>`,
          },
          accessory: {
            type: "button",
            action_id: "event_options",
            value: item.key,
            text: {
              type: "plain_text",
              text: "Options"
            }
          }
        };
      }),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text:
              "Data from <https://www.thebluealliance.com|The Blue Alliance>",
          },
        ],
      },
    ],
  };
}
