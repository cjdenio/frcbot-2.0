import discord from "discord.js";
import { parseSlashCommand } from "./../util";
import { TBAClient, Team } from "./../tba";

import * as embeds from "./embeds";

const client = new discord.Client();
const tba = new TBAClient(process.env.TBA_API_KEY);

client.on("message", async (msg) => {
  if (msg.content.startsWith("!frc")) {
    const { command, args } = parseSlashCommand(
      msg.content.trim().replace(/^\!frc\s+/, "")
    );

    switch (command) {
      case "team":
        let team: Team;
        try {
          team = await tba.getTeam(parseInt(args[0]));
        } catch (e) {
          return;
        }

        msg.channel.send({
          embed: embeds.team(team),
        });
        break;
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

export default client;
