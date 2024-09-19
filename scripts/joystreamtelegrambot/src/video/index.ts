import {
  hydraLocation,
  waitFor,
  waitTimeUnit,
  createdAgo,
  createdAgoUnit,
  joystreamBlue,
} from "../../config";
import { readFileSync } from "fs";
import axios from "axios";
import { cleanup, lookup, durationFormat } from "./util";
import { IVideoResponse, LooseObject } from "./types";

import { humanFileSize } from "./sizeformat";
import { MessageEmbed, TextChannel } from "discord.js";
const moment = require("moment");
const momentFormat = require("moment-duration-format");
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

export const videoUpdates = async (channel: TextChannel) => {
  let ids: any[] = [];

  do {
    const createdAt = moment().utc().subtract(createdAgo, createdAgoUnit); // current time minus some configurable number of time units
    const formattedDate = createdAt.format("YYYY-DD-MMMTHH:mm:ssZ");
    console.debug(`Checking for videos since ${formattedDate}`);
    await axios
      .post(hydraLocation, JSON.parse(formatQuery(formattedDate)))
      .then((res: any) => {
        let response: IVideoResponse = <IVideoResponse>res.data;
        if (response.data.videosConnection) {
          const uploads = response.data.videosConnection.edges;
          if (uploads.length) console.log(`${uploads.length} new videos`);
          for (const edge of response.data.videosConnection.edges) {
            console.log(JSON.stringify(edge));
            const id = edge.node.id;
            const thumb = edge.node.thumbnailPhoto;
            if (!thumb) {
              console.debug(`Video ${id} has no metadata yet.`);
              continue;
            }
            if (lookup(ids, id)) {
              console.log(`Video ${id} already announced. `);
              continue;
            }
            const createdAt = Date.parse(edge.node.createdAt);
            const licenseKey = edge.node.license.code;
            const exampleEmbed = new MessageEmbed()
              .setColor(joystreamBlue)
              .setTitle(edge.node.title)
              .setURL(`https://play.joystream.org/video/${edge.node.id}`)
              .setDescription(edge.node.description.substring(0, 200)) // cut off lengthy descriptions
              .addFields(
                { name: "ID", value: id, inline: true },
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
            const avatar = avatarObj ? `${edge.node.channel.avatarPhoto?.storageBag.distributionBuckets[0].operators[0].metadata.nodeEndpoint}api/v1/assets/${avatarObj}` : '';
            const link = `https://play.joystream.org/channel/${edge.node.channel.id}`;
            exampleEmbed.setAuthor(uploaderTitle, avatar, link);
            exampleEmbed.setImage(`${thumb.storageBag.distributionBuckets[0].operators[0].metadata.nodeEndpoint}api/v1/assets/${thumb.id}`);
            console.log(exampleEmbed);
            channel.send({embeds: [exampleEmbed]});
            ids.push({ id, createdAt });
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
