import { Datastore } from "@google-cloud/datastore";
import { Event, EventBasic } from "../tba";
import { Installation, InstallationQuery } from "@slack/oauth";

export interface SubscribedEvent {
  event: EventBasic;
  channel: string;
  team_id: string;
  key?: string;
}

const data = new Datastore();

export async function addSubscription(
  subscription: SubscribedEvent
): Promise<any> {
  await data.save({
    key: data.key(["subscriptions"]),
    data: subscription,
  });
}

export async function getSubscriptions(
  team_id: string,
  channel?: string
): Promise<SubscribedEvent[]> {
  let query = data.createQuery("subscriptions").filter("team_id", team_id);
  if (channel) {
    query = query.filter("channel", channel);
  }

  let result = await data.runQuery(query);
  let newResult = result[0].map((i) => {
    return {
      event: {
        name: i["event_name"],
        key: i["event"],
      },
      channel: i["channel"],
      team_id: i["team_id"],
      key: i[data.KEY].id.toString(),
    };
  });
  return newResult;
}

export async function deleteSubscription(key: string): Promise<any> {
  await data.delete(data.key(["subscriptions", parseInt(key)]));
}

export async function addInstallation(
  installation: Installation
): Promise<null> {
  await data.save({
    key: data.key("users"),
    data: {
      team_id: installation.team.id,
      installation: JSON.stringify(installation),
    },
  });
  return;
}

export async function getInstallation(
  query: InstallationQuery
): Promise<Installation> {
  const resp = await data.runQuery(
    data.createQuery("users").filter("team_id", query.teamId)
  );

  return JSON.parse(resp[0][0].installation);
}

export async function getAllInstallations(): Promise<Installation[]> {
  const resp = await data.runQuery(data.createQuery("users"));

  return resp[0];
}
