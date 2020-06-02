import { Datastore } from "@google-cloud/datastore";
import { Event, EventBasic } from "../tba";

export interface SubscribedEvent {
  event: EventBasic;
  channel: string;
  team_id: string;
  key: string;
}

const data = new Datastore();

export async function addSubscription(
  team_id: string,
  channel: string,
  event: EventBasic
): Promise<any> {
  data.save({
    key: data.key(["subscriptions"]),
    data: {
      channel,
      team_id,
      event: event.key,
      event_name: event.name,
    },
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
