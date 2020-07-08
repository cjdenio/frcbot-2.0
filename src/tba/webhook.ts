import { Request, Response, NextFunction } from "express";
import { createHmac, timingSafeEqual } from "crypto";

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
    comp_level: "f" | "qf" | "sf" | "qm";
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

export function handleTBAWebhook(req: Request, res: Response) {
  res.end();

  const payload: WebhookPayload = req.body;
  let { message_type: type, message_data: data } = payload;

  switch (type) {
    case "verification":
      data = data as ValidationEvent;
      console.log(`TBA webhook verification code: ${data.verification_key}`);
      break;
    case "match_score":
      data = data as MatchScoreEvent;
      console.log("Match score: " + data.match.event_key);
      break;
  }
}
