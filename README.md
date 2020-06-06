# FRCBot 2.0

A complete rewrite of [FRCBot](https://github.com/deniosoftware/frcbot), written in TypeScript using [Bolt](https://slack.dev/bolt-js).

This will eventually replace the current FRCBot, and Discord support will be added. Yay!

**Contributions welcome.** Shoot me an email at caleb@deniosoftware.com if you're interested in helping out.

## Getting set up for development

This is not a perfected process, but here goes:

1. Clone the repository with `git clone https://github.com/deniosoftware/frcbot-2.0`
2. Install [Docker](https://) and Docker Compose
3. In the `frcbot-2.0/` folder, run `yarn install`, then `docker-compose up`
4. Now FRCBot is available at `localhost:3000`. An ngrok tunnel will be automatically setup, and you can view the dashboard at `localhost:3001`.
5. Run `yarn docker-autosync`, which will continuously update the container when you make changes.

### Ports:

`http://localhost:3000` is your FRCBot instance.

`http://localhost:3001` is the ngrok dashboard.

`http://localhost:3002` is a Datastore viewer.
