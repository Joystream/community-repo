// website
export const domain = "https://pioneer.joystreamstats.live";
export const apiUrl = "https://api.joystreamstats.live/api";

// websocket location
export const wsLocation = "wss://rome-rpc-endpoint.joystream.org:9944"; //"wss://joystreamstats.live:9945";
export const statusEndpoint = [
  "https://joystreamstats.live/static/status.json",
  "https://status.joystream.org/status",
];

// bot tokens
export const discordToken = "";
export const tgToken = "";

// telegram chat ID
export const chatid = "-1001438587296";

// time between heartbeat announcement in milliseconds
export const heartbeat = 60000 * 60 * 6;

export const councilStatusHeartbeat = 86400000;

// minutes between checking for proposal updates
export const proposalDelay = 15;

export const suppressedThreads = [180, 265, 275, 390]; // 180 tokens, 265 faucet, 275 pets, 390 bounty-24

// video bot
export const channelId = "938526399801729024";
export const hydraLocation = "https://orion.joystream.org/graphql";
export const waitFor = 60;
export const waitTimeUnit = 'seconds';
export const createdAgo = 30;
export const createdAgoUnit = 'minutes';
export const storageServer = 'https://storage-1.joystream.org/argus/api/v1/assets/'
