import { Team } from "../tba";
import { Block, KnownBlock, View } from "@slack/types";
import { SubscribedEvent } from "../data";

export * from "./subscribeModal";
export * from "./appHome";

type BlockList = (Block | KnownBlock)[];

export function team(team: Team, overrideImageHost?: string): BlockList {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Team ${team.team_number} - *${team.nickname}*`,
      },
      accessory: {
        type: "image",
        image_url: `${
          overrideImageHost || "https://frcbot.deniosoftware.com"
        }/avatar/${team.team_number}`,
        alt_text: "Team avatar",
      },
      fields: [
        {
          type: "mrkdwn",
          text: `*Rookie Year* :calendar:\n${team.rookie_year}`,
        },
        {
          type: "mrkdwn",
          text: `*Hometown* :house:\n${team.city}, ${team.state_prov}, ${team.country}`,
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "View on TBA :arrow_upper_right:",
          },
          url: `https://www.thebluealliance.com/team/${team.team_number}`,
          action_id: `view_on_tba:${team.team_number}`,
        },
      ],
    },
  ];
}

export function help(): BlockList {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Help Text",
      },
    },
  ];
}

export function subscriptionAdded(subscription: SubscribedEvent): BlockList {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `I've just subscribed <#${subscription.channel}> to the event <https://www.thebluealliance.com/event/${subscription.event.key}|${subscription.event.name}>! :tada:`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Set up by <@${subscription.user}>`,
        },
      ],
    },
  ];
}
