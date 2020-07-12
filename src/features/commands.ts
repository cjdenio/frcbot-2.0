import { App } from "@slack/bolt";
import { getNgrokURL } from "../ngrok";
import * as util from "../util";
import { Team, TBAClient } from "../tba";
import * as bk from "../block_kit";

import * as data from "../data";

const tba = new TBAClient(process.env.TBA_API_KEY);

export function initCommands(app: App) {
  // Slash command listeners
  app.command("/frc", async ({ payload, ack, client }) => {
    const parsed = util.parseSlashCommand(payload.text);

    switch (parsed.command) {
      case "team":
        let team: Team;
        try {
          team = await tba.getTeam(parseInt(parsed.args[0]));
        } catch (e) {
          await ack("I couldn't find that team :cry:");
          return;
        }

        await ack({
          text: "",
          blocks: bk.team(
            team,
            process.env.NODE_ENV == "production" ? null : await getNgrokURL()
          ),
          response_type: "in_channel",
        });
        break;
      case "subscribe":
      case "watch":
        await ack();
        await client.views.open({
          trigger_id: payload.trigger_id,
          view: bk.subscribeModal({
            ...(payload.channel_id.toLowerCase().startsWith("c")
              ? { channel: payload.channel_id }
              : {}),
            ...(parsed.args[0] && parsed.args[0] != ""
              ? { event: parsed.args[0] }
              : {}),
          }),
        });
        break;
      case "setteam":
        if (
          parsed.args[0] == "" ||
          !parsed.args[0] ||
          !/^\d+$/.test(parsed.args[0])
        ) {
          await ack("Hmm... please run this command like `/frc setteam 254`.");
        }
        await data.setTeamNumber(payload.team_id, parseInt(parsed.args[0]));
        await ack(
          `I've successfully set your team number to *${parsed.args[0]}*!`
        );
        break;
      case "unsetteam":
        await data.setTeamNumber(payload.team_id, null);
        await ack("Yep");
        break;
      case "help":
      case null:
      case "":
      default:
        await ack({
          text: "",
          blocks: bk.help(),
        });
        break;
    }
  });
}
