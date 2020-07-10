import { Team } from "../tba";

export function team(team: Team) {
  return {
    title: `Team ${team.team_number} - ${team.nickname}`,
    url: `https://www.thebluealliance.com/team/${team.team_number}`,
    thumbnail: {
      url: `https://frcbot.deniosoftware.com/avatar/${team.team_number}`,
    },
    fields: [
      {
        name: "Rookie Year",
        value: team.rookie_year,
        inline: true,
      },
    ],
    provider: {
      name: "The Blue Alliance",
      url: "https://www.thebluealliance.com",
    },
  };
}
