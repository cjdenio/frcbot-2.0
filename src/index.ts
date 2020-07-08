import { App } from "@slack/bolt";

import { FRCBotReceiver } from "./FRCBotReceiver";

import installer from "./installer/InstallProvider";

import { initCommands, initEvents, initActions, initViews } from "./features";

const app = new App({
  receiver: new FRCBotReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  }),
  authorize: async ({ teamId }) => {
    return await installer.authorize({ teamId });
  },
});

initCommands(app);
initEvents(app);
initActions(app);
initViews(app);

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("FRCBot is running!");
})();
