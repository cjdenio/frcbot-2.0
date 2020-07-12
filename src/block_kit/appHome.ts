import { View, SectionBlock, ImageElement } from "@slack/types";
import { SubscribedEvent } from "../data";

export function appHome(events: SubscribedEvent[], team_number: number): View {
  return {
    type: "home",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: team_number
            ? `:busts_in_silhouette: Your team number is *${team_number}*`
            : ":busts_in_silhouette: Hmm... you haven't set a team number yet.",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: team_number ? "Change" : "Set",
          },
          action_id: "set_team_number",
        },
      },
      {
        type: "divider",
      },
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
          style: "primary",
        },
      },
      ...(events.length == 0
        ? [
            <SectionBlock>{
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  "No event subscriptions yet :cry: Why not run `/frc watch` to subscribe to one?",
              },
              accessory: {
                type: "image",
                image_url: "http://frcbot.deniosoftware.com/img/logo.png",
                alt_text: "FRCBot Logo",
              },
            },
          ]
        : []),
      ...events.map((item) => {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<https://www.thebluealliance.com/event/${item.event.key}|*${
              item.event.name || item.event.key
            }*> in <#${item.channel}>`,
          },
          accessory: {
            type: "overflow",
            action_id: `event_options:${item.key}`,
            options: [
              {
                text: {
                  type: "plain_text",
                  emoji: true,
                  text: ":gear: Options",
                },
                value: "options",
              },
              {
                text: {
                  type: "plain_text",
                  emoji: true,
                  text: ":x: Delete",
                },
                value: "delete",
              },
            ],
          },
        };
      }),
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "image",
            image_url: "https://www.thebluealliance.com/favicon.ico",
            alt_text: "TBA Logo",
          },
          {
            type: "mrkdwn",
            text:
              "Powered by <https://www.thebluealliance.com|The Blue Alliance>",
          },
        ],
      },
    ],
  };
}
