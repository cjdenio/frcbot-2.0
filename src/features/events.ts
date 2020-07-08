import { App } from "@slack/bolt";
import { TBAClient, Team, Event } from "../tba";
import * as bk from "../block_kit";
import * as data from "../data";

const tba = new TBAClient(process.env.TBA_API_KEY);

export function initEvents(app: App) {
  // Event listeners
  app.event("app_home_opened", async ({ client, body, event }) => {
    await client.views.publish({
      user_id: event.user,
      view: bk.appHome(await data.getSubscriptions(body.team_id)),
    });
  });

  app.event("link_shared", async ({ client, body, event }) => {
    const link = event.links[0];

    switch (link.domain) {
      case "thebluealliance.com":
        const path = new URL(link.url).pathname;

        const teamMatch = path.match(/^\/(?:team\/)?(\d+)(?:\/|$)/i);
        const eventMatch = path.match(/^\/(?:event\/)?(\d{4}\w+)(?:\/|$)/i);

        if (teamMatch) {
          let team: Team;
          try {
            team = await tba.getTeam(parseInt(teamMatch[1]));
          } catch (e) {
            return;
          }
          client.chat.unfurl({
            channel: event.channel,
            ts: event.message_ts,
            unfurls: {
              [link.url]: {
                blocks: bk.team(team),
              },
            },
          });
        } else if (eventMatch) {
          let frcEvent: Event;
          try {
            frcEvent = await tba.getEvent(eventMatch[1]);
          } catch (e) {
            return;
          }
          client.chat.unfurl({
            channel: event.channel,
            ts: event.message_ts,
            unfurls: {
              [link.url]: {
                blocks: bk.event(frcEvent),
              },
            },
          });
        }
        break;
    }
  });
}
