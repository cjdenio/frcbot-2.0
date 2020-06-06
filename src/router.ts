import { Router } from "express";
import installer from "./installer/InstallProvider";
import * as data from "./data";

const router = Router();

router.get("/", (req, res) => {
  res.send("<h1>FRCBot 2.0</h1>");
});

router.get("/slack/install", async (req, res) => {
  res.redirect(
    await installer.generateInstallUrl({
      scopes: ["chat:write", "chat:write.public", "commands"],
      redirectUri: "https://b3b08d83c80e.ngrok.io/slack/oauth",
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
