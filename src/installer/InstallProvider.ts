import { InstallProvider } from "@slack/oauth";
import InstallationStore from "./InstallationStore";

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  authVersion: "v2",
  stateSecret: "MOO",
  installationStore: InstallationStore,
});

export default installer;
