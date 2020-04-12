
# burst-balance-alert
Simple service, that notifies you (or others) via Mail, SMS, or Telegram, when a Burst account reaches a certain balance.

# Introduction

Sometimes it is important (or just interesting) when a certain Burst account reaches 
a specific value. This little service allows you to check for such a condition.
It is built as a tiny _serverless_ (lambda) function, that can be called via a simple Http request.
If the desired condition is met (see below), a message will be sent according the passed arguments, 
i.e. as SMS, Mail, or Telegram message. 

> In combination with a periodic check (e.g. every hour), you can monitor an account's balance, 
> e.g.to keep an eye on it. I use this service to monitor the [Burst Activator Account](https://explorer.burstcoin.network/?action=account&account=13736966403016142704) 
> using [Uptime Robot](https://uptimerobot.com/)

# Usage

Once the service is up (see chapter __Installation__) you can call it using
`Http GET` (e.g. possible to call in browser)

## Authentication

Some endpoints are protected to avoid spamming and though uncontrolled costs (mainly for AWS send services).
It uses [Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication), for which username and password are configured during setup (`API_USER` and `API_PASS`).
So, the `Authorization Header` must be set (or in Browser you'll be asked for credentials)

__Example__

This is how a request with `curl` may look like

```
curl --location --request GET 'localhost:3000/api/check-balance?account=13888633022253876551' \
--header 'Authorization: Basic U29tZVRlc3RVc2VyOlNvbWVUZXN0VXNlclBhc3M='
```

## Endpoints

### Health Check

> No Auth required

`/api/status` - returns 200 and a message 

### Balance Check 

> Needs Authentication

`/api/check-balance?<params>`

with following Params

| Argument | Description | Required |
|----------|-------------|----------|
| account  | The accounts id | required |
| compare  | The comparison operator: _lt_ or _gt_|optional|
| targetBurst | The balance target for comparison in BURST | required, if `compare` |
| msgRecipient  | A tuple in form `type:address` for notification. Type must be one of _sms_, _mail_, _discord_, or _telegram_ | required, if `compare` |

__Example__

1. Just returns an account's balance, without any notification

`/api/check-balance?account=13736966403016142704`

Returns:

```json
{
    "account": "13888633022253876551",
    "balanceBurst": "16928.87210584",
    "notified": false
}
```

2. Checks for an account's balance, and if less than 10 BURST sends an SMS to given phone number

`/api/check-balance?account=13736966403016142704&compare=lt&targetBurst=10&msgRecipient=sms:+5511912345678`

Returns something like this:

```json
{
    "account": "13736966403016142704",
    "balanceBurst": "8.34955",
    "targetBurst": "10",
    "comparator": "lt",
    "notified": true,
    "hasNotificationError": false
}
```

To send to multiple channels just add another `msgRecipient` parameter.

`/api/check-balance?account=13736966403016142704&compare=lt&targetBurst=10&msgRecipient=sms:+5511912345678&msgRecipient=telegram:2a3137d2-2d6a-4e4d-985a-df0d278426b0`


# Installation

To run the service, some preparations are necessary, as this service uses [AWS SNS](https://aws.amazon.com/sns/) and is built
for [Zeit Now](https://zeit.co) (although, should be possible to host on other PaaS, like Heroku or Netlify, but you'll probably need to some platform specific routing)

## Install Prerequisites

1. [Install NodeJS 13+](https://nodejs.org/en/download/)
2. [Create an AWS Account](https://aws.amazon.com/account/) (if you want to support SMS)
3. [Create a Zeit Now Account](https://zeit.co/signup)
4. Clone this repo (requires git): `git clone https://github.com/ohager/burst-balance-alert.git`
5. Run `npm i` (to install all dependencies)


## Setup Zeit Now

Once you have created an account you need to configure several access keys, i.e. for AWS, also the Basic Authentication for the service itself.
The keys will be provided as environment variables, such that they can be injected securely.

The following variables need to be set: 

```dotenv
API_USER=<Username for Basic Auth>
API_PASS=<Password for Basic Auth>
AWS_KEY_ID=<Amazon AWS key id>
AWS_SECRET_KEY=<Amazon AWS secret>
# Keep the peer address as it is, and change if you know what you are doing
BURST_PEER=https://wallet.burst-alliance.org:8125 
# The explorer used for linking in messages
BURST_EXPLORER=https://explorer.burstcoin.network
```

### Local Setup 
For local development it's sufficient to copy `.env.example` to `.env` and set the variables accordingly.

#### Run Locally

Once set you can run the service locally by just call `npm run start:dev` 
Your service should be available on `localhost:3000`. 
To check if service is up copy the following line into your browser:

`http://localhost:3000/api/status`

If all is fine, you will see a message like: _Burst Balance Alert is up_

### Production Setup

For deployment on Zeit you need to run the following commands to [securely configure your sensitive variable values](https://zeit.co/docs/v2/serverless-functions/env-and-secrets). 

`now secrets add burst-balance-alert-user <your username>`

`now secrets add burst-balance-alert-pass <your password>`

`now secrets add aws-key-id <your aws key id>` (see chapter "SMS Notification")

`now secrets add aws-secret-key <your aws secret>` (see chapter "SMS Notification")

#### Deploy

Once set you can deploy the service by calling `npm run deploy` 
Your service will be deployed to Zeit Now and will be available under the returned Urls, e.g. `burst-balance-alert.<username>.now.sh` 

To check if service is up copy the following line into your browser:

`http://<zeit-url>/api/status`

If all is fine, you will see a message like: _Burst Balance Alert is up_

## SMS Notification

To send SMS you'll need to have an Amazon AWS account (The free tier is more than sufficient). I recommend not to use your root keys, but create a specific user with limited permissions.
Therefore, you go to the [AWS IAM Console](https://console.aws.amazon.com/iam/home)
 
1. Create a Group and select the following permissions
    - `AmazonSESFullAccess` 
    - `AmazonSNSFullAccess` 
    
2. Create A User and add him to the created group
3. Select the User, go to the _Security Credentials_ setup, and create an Access Key
4. Write down the id and key; you'll need to inject these credentials as environment variables 
`AWS_ID` and `AWS_SECRET`

🚨 KEEP THIS KEYS SECRET 🚨

## Telegram Notification

To deliver messages on telegram the [Middleman-Bot](https://github.com/n1try/telegram-middleman-bot) is used.
You just need to [add the bot](https://t.me/MiddleManBot) in your Telegram messenger, and you'll receive an id (e.g. `2a3137d2-2d6a-4e4d-985a-df0d278426b0`).
This id should be used for the `msgAddress` parameter. 

🚨 KEEP THIS KEYS SECRET 🚨

## Discord Notification

To setup the notification on Discord you need to create a webhook. Select or create a channel and open the settings.
Within the settings (you need appropriate permissions), select the webhook section. Once you created a webhook you need 
the identifying parts of the url, i.e.

```
https://discordapp.com/api/webhooks/1234567890981733/cVoNiUCPmHZgqXa85tJBQf8vzyWiwrcR6S7xBHefHrYbiR9-6vPR9Uzgz3X5wkYNroT_ 
                                    |___________________________________________________________________________________|
                                                    Use this part as your msgAddress
```

🚨 KEEP THIS KEYS SECRET 🚨
