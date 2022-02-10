import {
  channelId,
  hydraLocation,
  waitFor,
  waitTimeUnit,
  createdAgo,
  createdAgoUnit,
  storageServer,
} from "../../config";
import { readFileSync } from "fs";
import axios from "axios";
import { cleanup, lookup, durationFormat } from "./util";
import { IVideoResponse, LooseObject } from "./types";

import { humanFileSize } from "./sizeformat";
const moment = require("moment");
const momentFormat = require("moment-duration-format");
const Discord = require("discord.js");
momentFormat(moment);

const delay = (ms: number | undefined) =>
  new Promise((res) => setTimeout(res, ms));

const path = "./src/video/";
const queryParams = readFileSync(path + "query_params.json", "utf-8");
const graphql = readFileSync(path + "videos_query.graphql", "utf-8").replaceAll(
  "\n",
  "\\n"
);
const httpRequestBody = readFileSync(path + "request.json", "utf-8")
  .replace("__PARAMS__", queryParams)
  .replace("__QUERY__", graphql);
const licenses: LooseObject = JSON.parse(
  readFileSync(path + "licenses.json", "utf-8")
);
const formatQuery = (date: string) =>
  httpRequestBody.replace("__DATE_AFTER__", date);

export const videoUpdates = async (channel: any) => {
  let ids: any[] = [];

  do {
    const createdAt = moment().utc().subtract(createdAgo, createdAgoUnit); // current time minus some configurable number of time units
    const formattedDate = createdAt.format("YYYY-DD-MMMTHH:mm:ssZ");
    console.log(`Checking for new videos uploaded since ${formattedDate}`);

    await axios
      .post(hydraLocation, JSON.parse(formatQuery(formattedDate)))
      .then((res: any) => {
        let response: IVideoResponse = <IVideoResponse>res.data;
        if (response.data.videosConnection) {
          console.log(
            `${response.data.videosConnection.edges.length} new videos uploaded`
          );
          for (let edge of response.data.videosConnection.edges) {
            if (!edge.node.thumbnailPhoto) {
              continue; // metadata for this video is not yet ready. Video will be announced in next iterations.
            }
            if (lookup(ids, edge.node.id)) {
              console.log(`Video ${edge.node.id} already announced. `);
            } else {
              const licenseKey = edge.node.license.code;
              const exampleEmbed = new Discord.MessageEmbed()
                .setColor("#4038FF") // official joystream blue, see https://www.joystream.org/brand/guides/
                .setTitle(edge.node.title)
                .setURL(`https://play.joystream.org/video/${edge.node.id}`)
                .setDescription(edge.node.description.substring(0, 200)) // cut off lengthy descriptions
                .addFields(
                  { name: "ID", value: edge.node.id, inline: true },
                  {
                    name: "Category",
                    value: edge.node.category.name,
                    inline: true,
                  },
                  {
                    name: "Duration",
                    value: durationFormat(edge.node.duration),
                    inline: true,
                  },
                  {
                    name: "Language",
                    value: edge.node.language.iso,
                    inline: true,
                  },
                  {
                    name: "Size",
                    value: humanFileSize(edge.node.media.size),
                    inline: true,
                  },
                  { name: "License", value: licenses[licenseKey], inline: true }
                )
                .setTimestamp();
              const uploaderTitle = `${edge.node.channel.title} (${edge.node.channel.ownerMember.controllerAccount})`;
              const avatarObj = edge.node.channel.avatarPhoto?.id;
              if (avatarObj) {
                const avatar = `${storageServer}/${avatarObj}`;
                exampleEmbed.setAuthor(
                  uploaderTitle,
                  avatar,
                  `https://play.joystream.org/channel/${edge.node.channel.id}`
                );
              } else {
                exampleEmbed.setAuthor(
                  uploaderTitle,
                  null,
                  `https://play.joystream.org/channel/${edge.node.channel.id}`
                );
              }
              exampleEmbed.setImage(
                `${storageServer}/${edge.node.thumbnailPhoto.id}`
              );
              channel.send(exampleEmbed);
              ids.push({
                id: edge.node.id,
                createdAt: Date.parse(edge.node.createdAt),
              });
            }
          }
          cleanup(ids, createdAt);
        }
      })
      .catch((error: any) => {
        console.log(error);
        const { response } = error;
        console.error(response.data);
      });

    // waiting...
    await delay(moment.duration(waitFor, waitTimeUnit).asMilliseconds());
  } while (true);
};
