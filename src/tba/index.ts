import axios from "axios";

export interface Team {
  team_number: number;
  nickname?: string;
  name: string;
  school_name?: string;
  city?: string;
  state_prov?: string;
  country?: string;
  rookie_year?: string;
}

export interface Event {
  key: string;
  name: string;
  event_code: string;
  event_type: number;
  start_date: string;
  end_date: string;
  year: number;
  event_type_string: string;
  district: District;
}

export interface Match {
  key: string;
  comp_level: CompLevel;
  set_number: number;
  match_number: number;
  alliances: {
    red: MatchAlliance;
    blue: MatchAlliance;
  };
  winning_alliance: "red" | "blue" | "";
  event_key: string;
  name: string;
}

export interface MatchAlliance {
  score: number;
  team_keys: string[];
}

export interface District {
  display_name: string;
}

export interface EventBasic {
  name?: string;
  key: string;
}

export type CompLevel = "f" | "qf" | "sf" | "qm" | "ef";

export class TBAClient {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  async getTeam(number: number): Promise<Team> {
    const resp = await axios(
      `https://www.thebluealliance.com/api/v3/team/frc${number}`,
      {
        headers: {
          "X-TBA-Auth-Key": this.key,
        },
      }
    );

    return resp.data;
  }

  async getEvent(code: string): Promise<Event> {
    const resp = await axios(
      `https://www.thebluealliance.com/api/v3/event/${code}`,
      {
        headers: {
          "X-TBA-Auth-Key": this.key,
        },
      }
    );

    return { ...resp.data, name: `${resp.data.name} ${resp.data.year}` };
  }

  async getMatch(key: string): Promise<Match> {
    const resp = await axios(
      `https://www.thebluealliance.com/api/v3/match/${key}`,
      {
        headers: {
          "X-TBA-Auth-Key": this.key,
        },
      }
    );

    let match = resp.data as Match;

    let match_name: string;
    switch (match.comp_level) {
      case "qm":
        match_name = `Qualification ${match.match_number}`;
        break;
      case "qf":
        match_name = `Quarterfinal ${match.set_number} Match ${match.match_number}`;
        break;
      case "sf":
        match_name = `Semifinal ${match.set_number} Match ${match.match_number}`;
        break;
      case "f":
        match_name = `Final ${match.set_number} Match ${match.match_number}`;
        break;
      case "ef":
        match_name = `Octofinal ${match.set_number} Match ${match.match_number}`;
        break;
      default:
        match_name = `Match ${match.match_number}`;
        break;
    }

    return { ...match, name: match_name };
  }

  async getAvatar(team: number): Promise<Buffer | null> {
    const resp = await axios.get(
      `https://www.thebluealliance.com/api/v3/team/frc${team}/media/${new Date().getFullYear()}`,
      {
        headers: {
          "X-TBA-Auth-Key": this.key,
        },
      }
    );

    const avatarObj = resp.data.find((i) => i.type == "avatar");

    if (avatarObj) {
      return Buffer.from(avatarObj.details.base64Image, "base64");
    } else {
      return null;
    }
  }
}
