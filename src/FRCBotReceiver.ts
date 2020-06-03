import { Receiver, App } from "@slack/bolt";
import express, { Application, Response, NextFunction } from "express";
import { createServer, Server } from "http";
import crypto from "crypto";

import router from "./router";

type Request = express.Request & { rawBody: Buffer };

export class FRCBotReceiver implements Receiver {
  app: Application;
  bolt: App;
  server: Server;

  signingSecret: string;

  constructor({ signingSecret }: { signingSecret: string }) {
    this.signingSecret = signingSecret;

    this.app = express();
    this.server = createServer(this.app);

    this.app.use(
      express.json({
        verify: (req: Request, res: Response, buf: Buffer) => {
          req.rawBody = buf;
        },
      })
    );
    this.app.use(
      express.urlencoded({
        extended: true,
        verify: (req: Request, res: Response, buf: Buffer) => {
          req.rawBody = buf;
        },
      }),
      (req, res, next) => {
        if (req.body.payload) {
          req.body = JSON.parse(req.body.payload);
        }
        next();
      }
    );
    this.app.use(router);

    this.app.post(
      "/slack/events",
      this.verifyEventsUrl.bind(this),
      this.verifySlackRequest.bind(this),
      this.requestHandler.bind(this)
    );
  }

  init(app: App) {
    this.bolt = app;
  }

  async start(port: number) {
    this.server.listen(port);
  }

  async stop() {
    this.server.close((err) => {
      if (err) {
        throw err;
      }
    });
  }

  private requestHandler(req: Request, res: Response) {
    let acknowledged = false;

    this.bolt.processEvent({
      body: req.body,
      ack: async (response) => {
        if (acknowledged) {
          return;
        }
        if (response instanceof Error) {
          res.status(500).send();
        } else if (!response) {
          res.send("");
        } else {
          res.send(response);
        }
        acknowledged = true;
      },
    });
  }

  private verifySlackRequest(req: Request, res: Response, next: NextFunction) {
    try {
      // Make sure the timestamp checks out
      if (
        Math.abs(
          new Date().getTime() / 1000 -
            parseInt(req.get("X-Slack-Request-Timestamp"))
        ) >
        60 * 5
      ) {
        throw new Error();
      }

      const basestring = `v0:${req.get(
        "X-Slack-Request-Timestamp"
      )}:${req.rawBody.toString()}`;

      let hash = crypto.createHmac("sha256", this.signingSecret);
      hash.update(basestring);

      if (
        crypto.timingSafeEqual(
          Buffer.from(`v0=${hash.digest("hex")}`),
          Buffer.from(req.get("X-Slack-Signature"))
        )
      ) {
        next();
      } else {
        throw new Error();
      }
    } catch (e) {
      res.status(401).json({
        inThe: "jungle",
        theMighty: "jungle",
        theRequestFails: "tonight",
      });
    }
  }

  private verifyEventsUrl(req, res, next) {
    if (req.body && req.body.type && req.body.type == "url_verification") {
      res.send(req.body.challenge);
      return;
    }
    next();
  }
}
