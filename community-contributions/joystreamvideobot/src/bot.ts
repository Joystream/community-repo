import { channelId, hydraLocation, waitFor, waitTimeUnit, createdAgo, createdAgoUnit } from "../config";
import { readFileSync } from 'fs';
import axios from 'axios';
import {IVideoResponse, LooseObject}  from './types';

const moment = require('moment')
const momentFormat = require("moment-duration-format");
const Discord = require("discord.js");
momentFormat(moment);

const delay = (ms: number | undefined) => new Promise(res => setTimeout(res, ms));

const queryParams = readFileSync('./query_params.json', 'utf-8');
const graphql = readFileSync('./videos_query.graphql', 'utf-8').replaceAll("\n", "\\n");
const httpRequestBody = readFileSync('./request.json', 'utf-8').replace('__PARAMS__', queryParams).replace('__QUERY__', graphql);
const licenses: LooseObject = JSON.parse(readFileSync('./licenses.json', 'utf-8'));

const client = new Discord.Client();

const main = async () => {

  await client.login(process.env.TOKEN); // environment variable TOKEN must be set

  await client.on("ready", async () => {
    console.log(`Logged in.`);
    await client.channels.fetch(channelId);
  });
  
  let ids = new Set()

  do {
    const createdAt = moment().utc().subtract(createdAgo, createdAgoUnit); // current time minus some configurable number of time units
    const formattedDate = createdAt.format('YYYY-DD-MMMTHH:mm:ssZ');
    console.log(`Checking for new videos uploaded since ${formattedDate}`);

    await axios
      .post(hydraLocation, httpRequestBody.replace('__DATE_AFTER__', formattedDate), {headers: {'Content-Type': 'application/json'}})
      .then((res: any) => {
        let response: IVideoResponse = <IVideoResponse>res.data;
        if(response.data.videosConnection) {
          console.log(`${response.data.videosConnection.edges.length} new videos uploaded`)
          for (let edge of response.data.videosConnection.edges) {            
            if(ids.has(edge.node.id)) {
              console.log(`Video ${edge.node.id} already announced. `);
            } else {
              const channel = client.channels.cache.get(channelId);
              const licenseKey = edge.node.license.code;
              const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#4038FF') // official joystream blue, see https://www.joystream.org/brand/guides/
                .setTitle(edge.node.title)
                .setURL(`https://play.joystream.org/video/${edge.node.id}`)
                .setAuthor(edge.node.channel.title, 
                  `${edge.node.channel.avatarPhotoDataObject.liaison.metadata}asset/v0/${edge.node.channel.avatarPhotoDataObject.joystreamContentId}`, 
                  `https://play.joystream.org/channel/${edge.node.channel.id}`
                )
                .setDescription(edge.node.description.substring(1, 200)) // cut off lengthy descriptions 
                .addFields(
                  { name: 'ID', value: edge.node.id, inline: true },
                  { name: 'Category', value: edge.node.category.name, inline: true},
                  { name: 'Duration', value: durationFormat(edge.node.duration), inline: true },
                  { name: 'Language', value: edge.node.language.iso, inline: true },
                  { name: 'License', value: licenses[licenseKey], inline: true },
                )
                .setImage(`${edge.node.thumbnailPhotoDataObject.liaison.metadata}asset/v0/${edge.node.thumbnailPhotoDataObject.joystreamContentId}`)
                .setTimestamp();
              channel.send(exampleEmbed);
              ids.add(edge.node.id);
            }
          }  
        }
      })
      .catch((error: any) => {
        console.error(error);
      });

      // waiting... 
      await delay(moment.duration(waitFor, waitTimeUnit).asMilliseconds());

  } while (true);

}

const durationFormat = (duration: number) => {
  if (duration < 60) {
    return `${duration}s.`
  } else {
     return moment.duration(duration, 'seconds').format("hh:mm:ss")
  }
}

main().catch(console.error).finally(() => process.exit());;
