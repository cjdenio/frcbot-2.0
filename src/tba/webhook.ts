import { Request, Response, NextFunction } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { WebClient } from "@slack/web-api";

import * as data from "../data";
import { deFRC } from "../util";
import installer from "../installer/InstallProvider";

import { match_score } from "../block_kit";

import { CompLevel, Match, TBAClient } from "./index";

export interface WebhookPayload {
  message_type: "verification" | "upcoming_match" | "match_score";
  message_data: ValidationEvent | MatchScoreEvent;
}

export interface ValidationEvent {
  verification_key: string;
}

export interface MatchScoreEvent {
  event_name: string;
  match: {
    comp_level: CompLevel;
    match_number: number;
    videos: any[];
    time_string: string;
    set_number: number;
    key: string;
    time: number;
    score_breakdown: unknown;
    alliances: {
      red: MatchScoreAlliance;
      blue: MatchScoreAlliance;
    };
    event_key: string;
  };
}

interface MatchScoreAlliance {
  score: number;
  teams: string[];
}

export function verifyTBAWebhook(
  req: Request & { rawBody: Buffer },
  res: Response,
  next: NextFunction
) {
  const hash = createHmac("sha256", process.env.TBA_WEBHOOK_SECRET);
  hash.update(req.rawBody);
  const computed = hash.digest();

  if (
    !timingSafeEqual(computed, Buffer.from(req.header("X-TBA-HMAC"), "hex"))
  ) {
    res.status(400).send("Error");
    return;
  }
  next();
}

export async function handleTBAWebhook(req: Request, res: Response) {
  const slack = new WebClient();
  const tba = new TBAClient(process.env.TBA_API_KEY);

  res.end();

  const payload: WebhookPayload = req.body;
  let { message_type: type, message_data: eventData } = payload;

  switch (type) {
    case "verification":
      eventData = eventData as ValidationEvent;
      console.log(
        `TBA webhook verification code: ${eventData.verification_key}`
      );
      break;
    case "match_score":
      eventData = eventData as MatchScoreEvent;

      let subscriptions = await data.getSubscriptionsByQuery(
        eventData.match.event_key,
        "match_score"
      );

      const relevantTeams = [
        ...(eventData as MatchScoreEvent).match.alliances.red.teams.map(deFRC),
        ...(eventData as MatchScoreEvent).match.alliances.blue.teams.map(deFRC),
      ];

      subscriptions = subscriptions.filter((v) => {
        return (
          v.type == "all" ||
          v.additional_teams.some((i) => relevantTeams.includes(i))
        );
      });

      let match: Match;
      try {
        match = await tba.getMatch(eventData.match.key);
      } catch (e) {
        console.log(e);
      }

      subscriptions.forEach(async (subscription) => {
        let token = (
          await installer.authorize({ teamId: subscription.team_id })
        ).botToken;

        try {
          slack.chat.postMessage({
            text: "",
            channel: subscription.channel,
            blocks: match_score({
              event_name: subscription.event.name,
              ...match,
            }),
            token,
          });
        } catch (e) {
          console.log(e);
        }
      });
      break;
  }
}
