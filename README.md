

# Deployment

In order to deploy, you will need:
* A Cloudflare account with a paid plan (~$5.00 p/month with overages for usage)
* A Telegram Bot account
* A local development environment with:
    - Python
    - Typescript

# Personal Note

This bot was created in a very compressed timeline.
As such, you will see a lot of complication and hardcoding where something simpler would have worked.
(I took bits of code from other projects to put it together quickly)
While the code works and is reliable, it is quite ugly.
Please don't take the ugliness of this codebase as a reflection of my other work!

## Setup

A complete local development environment requires:
  * This repo checked out locally
  * A "dev" telegram bot account (this is what you will interact with for local dev testing)
  * A "prod" telegram bot account for the prod environment (this is what users will interact with)    
  * The telegram-bot-api github repo checked out and compiled / installed
  * The local development dependencies including node, npm, npx, typescript, python.
  * These are covered in detail under "Dev Dependencies"

For hosting, you will need:
  * A Cloudflare account with the "paid" plan activated

## Secrets

The local development and deployment of the bot rely on the presence of "secrets" file 
that are .gitignored.

These files contain API keys and other information.  The two secret files needed are:
* `.dev.vars.dev`
* `.dev.vars.prod`

They should be placed in the root of the directory.

## Setting Up Telegram Bot Accounts

You will need to configure Telegram bot accounts if one hasn't been transferred to you already.
There are two Telegram bot accounts: one for development and one for prod.

You don't want to re-use the same account for dev and prod because then development messages will get pushed to your prod users.

Basic bot configuration can be done directly in Telegram by interacting with the "Bot Father" bot.
The beginning of this article shows you how to create bots using the "Bot Father" telegram :
* https://www.directual.com/lesson-library/how-to-create-a-telegram-bot

You will want to set a description, pics, and other information.

The one bit of information you will need from this process is the api token.
That can be found in "API Token" under your bot settings in the Bot Father.

**IMPORTANT**: You will also need to turn off the "Join Groups" feature to prevent your bot from being added to a channel.

Place the "dev" bot's API token in `.dev.vars.dev` like this:
`SECRET__TELEGRAM_BOT_TOKEN = "dev-bot-token-goes-here"`
(The double underscore after `SECRET` is deliberate)

And place the "prod" bot's API token in `.dev.vars.prod` like this:
`SECRET__TELEGRAM_BOT_TOKEN = "prod-bot-token-goes-here"`

## Installing And Configuring telegram-bot-api

In order to test locally, you will need to download, compile and install the telegram-bot-api, hosted here:
https://github.com/tdlib/telegram-bot-api

You can find instructions for compilation and installation in their README.md.

This may help as well: https://tdlib.github.io/telegram-bot-api/build.html?os=macOS

The idea is that in order to have the dev telegram bot run locally, there's a middleman API that needs to run
on your local machine that coordinates your dev bot account, your local machine, and the telegram client and associated infrastructure.  This is what the telegram-bot-api is.  

You will need a few bits of information from telegram-bot-api, the `api_id` and `api_hash`.
See here for getting these: https://core.telegram.org/api/obtaining_api_id

Once you have these, create two new lines in `.dev.vars.dev` and `.dev.vars.prod`:

SECRET__TELEGRAM_API_ID = "telegram-bot-api-api-id-goes-here"

SECRET__TELEGRAM_API_HASH = "telegram-bot-api-api-hash-goes-here"

These will have the same value for both dev and prod.

## Finishing the secrets files
Add one more line to each file:

`SECRET__EMAIL = "admin-email-goes-here"`

You final secrets files should look like this:
```
SECRET__TELEGRAM_BOT_TOKEN = "..."
SECRET__TELEGRAM_BOT_WEBHOOK_SECRET_TOKEN = "..."
SECRET__TELEGRAM_API_ID = "..."
SECRET__TELEGRAM_API_HASH = "..."
SECRET__EMAIL = "..."
```

## wrangler.toml

This file contains configuration for the Cloudflare worker.
When the worker is pushed to Cloudflare, it automatically uses the contents of
both `wrangler.toml` and `.dev.vars.prod` and configures these are Cloudflare 'environment variables' in the hosting environment.

You may find settings in `wrangler.toml` that you can adjust if you desire.

## Setting up Typescript/Wrangler/Npm/Npx/Etc

* Install node.js
* Install python
* Install npx:
    - `npm i -g npx`
* Then, in the root directory of this project, install the dependencies:
    - `npm install .`

## Local Development Environment

You'll have to run this command once manually to answer an annoying 'first-time' question from wrangler:

`npx wrangler dev --env=dev --port=8443 --test-scheduled --ip 127.0.0.1 --var TELEGRAM_BOT_SERVER_URL:"http://127.0.0.1:80"`

You can always start local development through a series of individual commands,
but I scripted these commands together for ease of use:

`python scripts/start_dev_box.py`

This script:
* Starts the Cloudflare environment simulator (port 8443)
* Starts the local telegram-bot-api (port 80)
* Configures the bot for local development and migrates it to the local bot server

If you terminate the script (through some combination of pressing 'x' and forcing the process dead through manic killer keystrokes), it does its best to clean up any forked processes it creates.

However, sometimes you may need to kill the process running on port 80 manually:

`lsof -i :80`

`sudo kill <pid-from-above-command>`

## Debugging

After the dev box has started, you can set breakpoints and attach a vscode debugger by picking the "Wrangler" debugger option from the debugger dropdown in VSCode, and hitting the green arrow.

Please note that there is a bug with Wrangler that breaks debugging sessions if the codebase is in excess of about
10,000 lines of code. This will not apply to this project.  If you hit that limit, downgrade to 3.18 (or check to see if workers-sdk finally fixed it and then upgrade wrangler to their fixed version).

## Key Areas of Codebase

Here are some areas that you will find relevant to content editing:
- The method `handleCommandInternal` in `worker/handler.ts`, which is 1-to-1 with: `scripts/commands.py`. These are the "menu options" displayed in the bot.
- The `questions_and_answers.ts` file, which contains the configuration for the FAQ questions.
- The various menus in the `menus` directory


## Python Scripting Dependencies:
* tomli
* tqdm
* requests
* psutil
* mitmproxy
* solana (that's the name of the pypi project)

These can be installed by running `pip install [packagename]`

If you run into a scripting error saying "[] module not found", then I made a mistake and missed something.

Most of the time, this is very easy to correct by identifying the module in question, finding the package name, and running: `pip install <the-package>`

## Deployment

To deploy, run:

 `python scripts/deploy.py --env prod`.

Please be aware that running this script updates the bot in the production environment, and changes will be visible more or less immediately to your users.

The deployment script will guide you through double checking your environment variables, validating your Cloudflare login, and so on.

You can answer "n" to any question and that portion of deployment will be halted.

Make sure you have configured the bot tagline and
display name before pushing description / short description, if you choose to do so.



## Other
You may wish to disable VSCode's hardware acceleration on macs to avoid annoying typing/rendering issues.
Add:
    "disable-hardware-acceleration": true
To:
    ~/.vscode/argv.json

