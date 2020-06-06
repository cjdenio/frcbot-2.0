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
}

export interface EventBasic {
  name?: string;
  key: string;
}

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

    return resp.data;
  }
}
