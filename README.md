# burst-balance-alert
Simple service, that notifies you (or others) when a Burst account reaches a certain balance.

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
| msgType | The type of message for notification: _sms_, _mail_, or _telegram_ | required, if `compare` |
| msgAddress | The address identifier for notification, i.e. phone number, email address or telegram id | required, if `compare` |

__Example__

1. Checks for an account's balance, and if less than 10 BURST sends an SMS to given phone number

`/api/check-balance?account=13736966403016142704&compare=lt&targetBurst=10&msgType=sms&msgAddress=+5511912345678`

Returns something like this:

```json
{
    "account": "13888633022253876551",
    "balanceBurst": "6.123456",
    "notified": true
}
```

2. Just returns an account's balance, without any notification

`/api/check-balance?account=13736966403016142704&compare=lt&targetBurst=10&msgType=sms&msgAddress=+5511912345678`

Returns:

```json
{
    "account": "13888633022253876551",
    "balanceBurst": "16928.87210584",
    "notified": false // for check will be always 'false'
}
```

# Installation

To run the service, some preparations are necessary, as this service uses [AWS SNS](https://aws.amazon.com/sns/) and is built
for [Zeit Now](https://zeit.co) (although, should be possible to host on other PaaS, like Heroku or Netlify)

## Install Prerequisites

1. [Install NodeJS 13+](https://nodejs.org/en/download/)
2. [Create an AWS Account](https://aws.amazon.com/account/) 
3. [Create a Zeit Now Account](https://zeit.co/signup)
4. Clone this repo (requires git): `git clone https://github.com/ohager/burst-balance-alert.git`
5. Run `npm i` (to install all dependencies)

## Setup AWS SNS

TO DO

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

`now secrets add aws-key-id <your aws key id>`

`now secrets add aws-secret-key <your aws secret>`

#### Deploy

Once set you can deploy the service by calling `npm run deploy` 
Your service will be deployed to Zeit Now and will be available under the returned Urls, e.g. `burst-balance-alert.<username>.now.sh` 

To check if service is up copy the following line into your browser:

`http://<zeit-url>/api/status`

If all is fine, you will see a message like: _Burst Balance Alert is up_
