import { View, SectionBlock, Option } from "@slack/types";
import { SubscribedEvent, NotificationType } from "../data";

export function subscribeModal(_?: {
  channel?: string;
  event?: string;
  subscription?: SubscribedEvent;
}): View {
  const isOptions = _?.subscription ? true : false;

  let notificationTypesInitialOptions = [
    {
      text: {
        type: "plain_text",
        text: "Match Score",
      },
      value: "match_score",
    },
  ];

  if (isOptions) {
    notificationTypesInitialOptions = [];
    notificationTypesInitialOptions = _.subscription.notification_types.map(
      (i: NotificationType) => {
        let text: string;
        switch (i) {
          case "event_schedule":
            text = "Event Schedule";
            break;
          case "match_score":
            text = "Match Score";
            break;
          case "upcoming_match":
            text = "Upcoming Match";
        }
        return {
          text: {
            type: "plain_text",
            text,
          },
          value: i,
        };
      }
    );
  }

  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: isOptions ? "Event Options" : "Subscribe to an event",
    },
    submit: {
      type: "plain_text",
      text: "Save",
    },
    callback_id: isOptions
      ? `event_options:${_.subscription.key}`
      : "subscribe_event",
    blocks: [
      {
        type: "input",
        block_id: "event",
        element: {
          type: "plain_text_input",
          action_id: "event",
          placeholder: {
            type: "plain_text",
            text: "e.g. 2020mabos",
          },
          ...(_?.event || _?.subscription?.event.key
            ? { initial_value: _.event || _.subscription.event.key }
            : {}),
        },
        label: {
          type: "plain_text",
          text: "Event Code",
        },
      },
      {
        type: "input",
        block_id: "channel",
        element: {
          type: "channels_select",
          action_id: "channel",
          placeholder: {
            type: "plain_text",
            text: "Select one...",
          },
          ...(_?.channel || _?.subscription?.channel
            ? { initial_channel: _.channel || _.subscription.channel }
            : {}),
        },
        label: {
          type: "plain_text",
          text: "Channel",
        },
      },
      {
        type: "input",
        block_id: "notification_types",
        element: {
          type: "multi_static_select",
          action_id: "notification_types",
          placeholder: {
            type: "plain_text",
            text: "Select some...",
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Match Score",
              },
              value: "match_score",
            },
            {
              text: {
                type: "plain_text",
                text: "Upcoming Match",
              },
              value: "upcoming_match",
            },
            {
              text: {
                type: "plain_text",
                text: "Event Schedule",
              },
              value: "event_schedule",
            },
          ],
          initial_options: notificationTypesInitialOptions as Option[],
        },
        label: {
          type: "plain_text",
          text: "Notification Types",
        },
      },
      {
        type: "input",
        block_id: "type",
        element: {
          type: "static_select",
          action_id: "type",
          options: [
            {
              text: {
                type: "plain_text",
                text: "All matches",
              },
              value: "all",
            },
            {
              text: {
                type: "plain_text",
                text: "Just your team + additional teams",
              },
              value: "team",
            },
          ],
          initial_option:
            !isOptions || _.subscription.type == "all"
              ? {
                  text: {
                    type: "plain_text",
                    text: "All matches",
                  },
                  value: "all",
                }
              : {
                  text: {
                    type: "plain_text",
                    text: "Just your team + additional teams",
                  },
                  value: "team",
                },
        },
        label: {
          type: "plain_text",
          text: "Matches",
        },
      },
      {
        type: "input",
        block_id: "additional_teams",
        element: {
          type: "plain_text_input",
          action_id: "additional_teams",
          placeholder: {
            type: "plain_text",
            text: "e.g. 6763, 1519, 254",
          },
          ...(isOptions
            ? { initial_value: _.subscription.additional_teams.join(", ") }
            : {}),
        },
        label: {
          type: "plain_text",
          text: "Additional Teams",
        },
        optional: true,
      },
      ...(isOptions
        ? []
        : [
            <SectionBlock>{
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  ":warning: *Heads up!* This will post a message into the channel you've selected, just to let people know that it's subscribed!",
              },
            },
          ]),
    ],
  };
}
