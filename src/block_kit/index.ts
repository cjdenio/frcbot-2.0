import { Team } from "../tba";
import { Block, KnownBlock } from "@slack/types";

export function team(team: Team): (Block | KnownBlock)[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Team ${team.team_number} - *${team.nickname}*`,
      },
      accessory: {
        type: "image",
        image_url: `https://frcbot.deniosoftware.com/avatar/${team.team_number}`,
        alt_text: "Team avatar",
      },
      fields: [
        {
          type: "mrkdwn",
          text: `*Rookie Year*\n${team.rookie_year}`,
        },
        {
          type: "mrkdwn",
          text: `*Hometown*\n${team.city}, ${team.state_prov}, ${team.country}`,
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
        },
      ],
    },
  ];
}
