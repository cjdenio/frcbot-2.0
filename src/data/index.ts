import { Datastore } from "@google-cloud/datastore";
import { Event, EventBasic } from "../tba";
import { Installation, InstallationQuery } from "@slack/oauth";
import { parse } from "path";
import { eventNames } from "process";
import installer from "../installer/InstallProvider";

export type NotificationType =
  | "match_score"
  | "event_schedule"
  | "upcoming_match";

export interface SubscribedEvent {
  event: EventBasic;
  channel: string;
  team_id: string;
  additional_teams: string[];
  type: "team" | "all";
  key?: string;
  notification_types: NotificationType[];
  user?: string;
}

const data = new Datastore();

// Subscriptions
export async function addSubscription(
  subscription: SubscribedEvent
): Promise<void> {
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

  let [result] = await data.runQuery(query);

  result = result.map((i) => {
    return { ...i, key: i[data.KEY].id };
  });

  return result;
}

export async function deleteSubscription(key: string): Promise<any> {
  await data.delete(data.key(["subscriptions", parseInt(key)]));
}

export async function subscriptionExists(
  team_id: string,
  event_key: string,
  channel: string
): Promise<boolean> {
  const [resp] = await data.runQuery(
    data
      .createQuery("subscriptions")
      .filter("team_id", team_id)
      .filter("channel", channel)
      .filter("event.key", event_key)
  );

  return resp.length > 0;
}

export async function getSubscription(key: string): Promise<SubscribedEvent> {
  const [resp] = await data.get(data.key(["subscriptions", parseInt(key)]));

  return { ...resp, key: resp[data.KEY].id };
}

// Installations
export async function addInstallation(
  installation: Installation
): Promise<void> {
  await data.save({
    key: data.key(["users", installation.team.id]),
    data: installation,
  });
  return;
}

export async function getInstallation(
  query: InstallationQuery
): Promise<Installation & { team_number?: number }> {
  const [resp] = await data.get(data.key(["users", query.teamId]));
  return resp;
}

export async function getAllInstallations(): Promise<Installation[]> {
  const resp = await data.runQuery(data.createQuery("users"));

  return resp[0];
}

export async function updateSubscription(
  event: SubscribedEvent,
  key?: string
): Promise<void> {
  key = event.key || key;
  delete event.key;
  await data.update({
    key: data.key(["subscriptions", parseInt(key)]),
    data: event,
  });
}

export async function getSubscriptionsByQuery(
  event_key: string,
  notification_type: NotificationType
): Promise<SubscribedEvent[]> {
  let query = data
    .createQuery("subscriptions")
    .filter("event.key", "=", event_key)
    .filter("notification_types", "=", notification_type);
  let [entities] = await data.runQuery(query);
  return entities;
}

export async function setTeamNumber(
  team_id: string,
  team_number: number
): Promise<void> {
  let [installation] = await data.get(data.key(["users", team_id]));

  if (team_number) {
    installation.team_number = team_number;
  } else {
    delete installation.team_number;
  }
  await data.save(installation);
}

//export async function getTeamNumber(team_id: string): Promise<number> {}
