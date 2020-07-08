import express, { Router, Request } from "express";
import installer from "./installer/InstallProvider";
import { TBAClient, Team, Event } from "./tba";
import { handleTBAWebhook, verifyTBAWebhook } from "./tba/webhook";

import sharp from "sharp";

import * as data from "./data";
import * as ngrok from "./ngrok";

import * as path from "path";

const router = Router();
const tba = new TBAClient(process.env.TBA_API_KEY);

router.use(express.static(path.join(__dirname, "..", "assets")));

router.get("/", (req, res) => {
  res.send("<h1>FRCBot 2.0</h1>");
});

router.get("/slack/install", async (req, res) => {
  res.redirect(
    await installer.generateInstallUrl({
      scopes: [
        "chat:write",
        "chat:write.public",
        "commands",
        "links:read",
        "links:write",
        "im:history",
      ],
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
    res
      .contentType("png")
      .sendFile(path.join(__dirname, "..", "assets", "img", "first.png"));
  }
});

router.post(
  "/tba/webhook",
  express.json({
    verify: (req, res, buf) => {
      (req as Request & { rawBody: Buffer }).rawBody = buf;
    },
  }),
  verifyTBAWebhook,
  handleTBAWebhook
);

export default router;
