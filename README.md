# FRCBot 2.0

![Build](https://github.com/deniosoftware/frcbot-2.0/workflows/Build/badge.svg)
![Format](https://github.com/deniosoftware/frcbot-2.0/workflows/Format/badge.svg)

A complete rewrite of [FRCBot](https://github.com/deniosoftware/frcbot), written in TypeScript using [Bolt](https://slack.dev/bolt-js).

This will eventually replace the current FRCBot, and Discord support will be added. Yay!

**Contributions welcome.** Shoot me an email at caleb@deniosoftware.com if you're interested in helping out.

## [To-Do List](https://github.com/deniosoftware/frcbot-2.0/projects/1)

## Getting set up for development

This is not a perfected process, but here goes:

1. Clone the repository with `git clone https://github.com/deniosoftware/frcbot-2.0`
2. Install [Yarn](https://yarnpkg.com), [Docker](https://docker.com) and [Docker Compose](https://docs.docker.com/compose/install)
3. In the `frcbot-2.0/` folder, run `yarn install`, then `docker-compose up`
4. Now FRCBot is available at `localhost:3000`. An [ngrok](https://ngrok.com) tunnel will be automatically setup, and you can view the dashboard at `localhost:3001`.
5. **FRCBot should now automatically sync your local changes into the Docker container.**

### Config

Create a `.env` file to hold various config vars. This file follows [Docker Compose's environment file specification.](https://docs.docker.com/compose/compose-file/#env_file) Here's an example:

```
SLACK_SIGNING_SECRET=super_secret_code
SLACK_CLIENT_ID=not_so_secret_code
SLACK_CLIENT_SECRET=pretty_secret_code
SLACK_STATE_SECRET=random_string_for_security
TBA_API_KEY=moderately_secret_code
TBA_WEBHOOK_SECRET=
DISCORD_CLIENT_ID=
DISCORD_TOKEN=
```

To configure the [ngrok](https://ngrok.com) tunnel (e.g. get a custom subdomain), create a `.ngrok.env` file with config like so:

Check out all the possible ngrok config vars [here](https://github.com/wernight/docker-ngrok#environment-variables).

```
NGROK_AUTH=your_auth_key

# Requires paid account 🔽
NGROK_SUBDOMAIN=subdomain
```

### Ports

| URL                     | Description                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `http://localhost:3000` | Your FRCBot instance                                                                                              |
| `http://localhost:3001` | The [ngrok](https://ngrok.com) dashboard                                                                          |
| `http://localhost:3002` | The Datastore viewer (powered by [dsui](https://github.com/streamrail/dsui))                                      |
| `http://localhost:3003` | The raw Datastore API is exposed here. [[Reference](https://cloud.google.com/datastore/docs/reference/data/rest)] |
