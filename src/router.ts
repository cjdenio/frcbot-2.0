import { Router } from "express";
import installer from "./installer/InstallProvider";
import * as data from "./data";
import * as ngrok from "./ngrok";

const router = Router();

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

router.get("/test", async (req, res) => {
  res.json(await data.getAllInstallations());
});

export default router;
