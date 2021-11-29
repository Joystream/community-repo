# Event Email Service

The goal of [25.OP-2](https://blog.joystream.org/sumer-kpis/#25.OP-2) is to investigate options to set up an email notification system for various on chain events.

## Technical Feasibility

### 1. Hosted

There are several options to store user emails:
1. Create a public website connected to a hosted database, authentication and data security would be the biggest efforts.
2. Update the discord / telegram bot to save a selection of event methods, listen for events and spool emails to a local mailserver. This would leave the burden to authenticate users to the respective chat service.
3. Host a service with user management and plugin infrastructure could save time, either adding fields to the user table or saving subscriptions in a separate file.
4. Extend joystreamstats.live to store settings and let users authenticate with their wallet (by signing the request) or off chain by sending a confirmation email with a token / link. A mail server is already installed so the effort would be minimal.

### 2. Self-hosted

Giving users / node operators the power to Filter events is the easiest part, there is an example to listen to events [here](https://pioneer.joystreamstats.live/#/js), from there [nodemailer](https://www.w3schools.com/nodejs/nodejs_email.asp) or similar could take over.

The focus for this task is on documentation to account for unforeseen issues. Some resources should be allocated for maintenance and support to incorporate requests.

## Estimated Costs

- script to filter for block events: 2h

1. Hosted

- joysteamstats.live registration page with email integration: 4h
- bot interface to select event sections and methods: 4h

2. Self-hosted

- create a standalone site with user management and email integration: 8h
- write and maintain documentation how to run your own: 3h + X

### Notes

These estimates may be low. Time needed to set it up depends on the skill level. If non-developersa run a foreign script  it can work out or it can fail in many ways. Especially deploying a mail server can lead to frustration without prior knowledge (spam, blacklisting). However running a node or just a script connected to an endpoint (local or a redundant list of remote servers) and/or a chat bot on a home (micro) computer with a secured mailserver would be an elegant solution.

Author: [l1dev](https://pioneer.joystreamstats.live/#/members/l1dev)
