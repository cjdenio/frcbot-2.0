import { Match } from "../tba";

import { Block, KnownBlock } from "@slack/types";
import { deFRC } from "../util";

type BlockList = (Block | KnownBlock)[];

export function match_score(
  match: Match & { event_name: string },
  teamToHighlight?: number
): BlockList {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `A match was just played in <https://www.thebluealliance.com/event/${match.event_key}|*${match.event_name}*>:\n<https://www.thebluealliance.com/match/${match.key}|*${match.name}*>`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        // prettier-ignore
        text: `:red_circle: *Teams*: ${match.alliances.red.team_keys.map(deFRC).join(", ")} | *Score*: ${match.alliances.red.score}${match.winning_alliance == "red" ? " :trophy:" : ""}\n:large_blue_circle: *Teams*: ${match.alliances.blue.team_keys.map(deFRC).join(", ")} | *Score*: ${match.alliances.blue.score}${match.winning_alliance == "blue" ? " :trophy:" : ""}`
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            'Click "FRCBot" in the Slack sidebar to manage your subscriptions or unsusbcribe from future notifications.',
        },
      ],
    },
  ];
}
