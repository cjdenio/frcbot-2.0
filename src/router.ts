import { Router } from "express";
import installer from "./installer/InstallProvider";
import { TBAClient, Team, Event } from "./tba";

import sharp from "sharp";

import * as data from "./data";
import * as ngrok from "./ngrok";

const router = Router();
const tba = new TBAClient(process.env.TBA_API_KEY);

router.get("/", (req, res) => {
  res.send("<h1>FRCBot 2.0</h1>");
});

router.get("/slack/install", async (req, res) => {
  res.redirect(
    await installer.generateInstallUrl({
      scopes: ["chat:write", "chat:write.public", "commands"],
      redirectUri:
        process.env.NODE_ENV == "production"
          ? "https://frcbot.deniosoftware.com/slack/oauth"
          : `${await ngrok.getNgrokURL()}/slack/oauth`,
    })
  );
});

router.get("/slack/oauth", async (req, res) => {
  installer.handleCallback(req, res);
});

router.get("/avatar/:number(\\d+)", async (req, res) => {
  try {
    const avatar = await tba.getAvatar(parseInt(req.params.number));
    if (avatar) {
      res.contentType("png").send(
        await sharp(avatar)
          .flatten({
            background: {
              r: 72,
              g: 127,
              b: 204,
            },
          })
          .resize(200, 200, {
            kernel: sharp.kernel.nearest,
          })
          .toBuffer()
      );
    } else {
      throw new Error();
    }
  } catch (e) {
    res.send("Not found.");
  }
});

export default router;
