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
}
