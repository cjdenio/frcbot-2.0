import { InstallationStore } from "@slack/oauth";
import * as data from "../data";

const store: InstallationStore = {
  storeInstallation: async (installation) => {
    data.addInstallation(installation);
  },
  fetchInstallation: async (query) => {
    return data.getInstallation(query);
  },
};

export default store;
