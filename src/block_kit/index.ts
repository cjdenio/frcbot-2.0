import { Team, Event } from "../tba";
import { Block, KnownBlock, View } from "@slack/types";
import { SubscribedEvent } from "../data";

import { DateTime } from "luxon";

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

export function event(event: Event): BlockList {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${event.name}*`,
      },
      accessory: {
        type: "image",
        image_url: "http://frcbot.deniosoftware.com/img/first.png",
        alt_text: "FIRST Logo",
      },
      fields: [
        {
          type: "mrkdwn",
          text: `*Date :calendar:*\n${DateTime.fromISO(
            event.start_date
          ).toLocaleString(DateTime.DATE_FULL)}`,
        },
        {
          type: "mrkdwn",
          text: `*District :pushpin:*\n${event.district.display_name}`,
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
            text: "View on TBA :arrow_upper_right:",
            emoji: true,
          },
          url: `https://www.thebluealliance.com/event/${event.key}`,
          action_id: `view_on_tba:${event.key}`,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Subscribe to event :eyes:",
          },
          action_id: `subscribe_event:${event.key}`,
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

export function subscriptionAdded(
  subscription: SubscribedEvent,
  team_id: string,
  app_id: string
): BlockList {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `I've just subscribed <#${subscription.channel}> to the event *<https://www.thebluealliance.com/event/${subscription.event.key}|${subscription.event.name}>*! :tada:`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Set up by <@${subscription.user}> \u00B7 Manage your subscriptions <slack://app?team=${team_id}&id=${app_id}|here>`,
        },
      ],
    },
  ];
}
