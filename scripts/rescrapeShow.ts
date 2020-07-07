/**
 * Quick and dirty script for scraping all shows.
 */
import fs from "fs";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { IShowWithEpisodes } from "../src/types";
import { Anime, createPuppeteerInstance } from "../index";

const adapter = new FileSync("./db.json");
const db = low(adapter);

const id = Number(process.argv.slice(2)[0]);

if (!id) {
  console.log("Please specify a video id");
  process.exit();
}

const showStore = db.get("shows");

(async () => {
  const puppeteerInstance = await createPuppeteerInstance();

  const anime = new Anime(puppeteerInstance);

  // @ts-ignore
  const show = showStore.find({ id }).value() as IShowWithEpisodes;

  const episodes = await anime.getEpisodes(show.episodes[0].url);

  const newEpisodes = [];

  let i = 0;

  for await (const episode of episodes) {
    i++;

    console.log(`- scraping episode ${i}/${episodes.length}`);

    const { iframe } = await anime.getVideo(episode.url, {
      onlyGetIframeUrl: true,
    });

    (episode as any).video = iframe;

    newEpisodes.push(episode);
  }

  console.log(newEpisodes);

  // @ts-ignore
  showStore.find({ id }).assign({ episodes: newEpisodes }).write();

  anime.close();
})();
