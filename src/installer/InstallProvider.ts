import { InstallProvider } from "@slack/oauth";
import InstallationStore from "./InstallationStore";

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  authVersion: "v2",
  stateSecret: process.env.SLACK_STATE_SECRET,
  installationStore: InstallationStore,
});

export default installer;
