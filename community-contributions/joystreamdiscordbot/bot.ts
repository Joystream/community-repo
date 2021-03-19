const Discord = require("discord.js");
const client = new Discord.Client();
const { token } = require("./config.ts");

client.login(token);

client.on("ready", () => {
  console.log(`Logged in.`);
});

client.on("message", (msg) => {
  if (msg.content.includes("@joystream-bot"))
    msg.reply(`Hello, ${msg.author}!`);
});
