/**
 * Quick and dirty script for scraping all shows.
 */
import fs from "fs";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { IShow } from "../src/types";
import { Anime, createPuppeteerInstance } from "../index";

const shows = JSON.parse(fs.readFileSync("./shows.json", "utf8"));

const adapter = new FileSync("./db.json");
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ shows: [] }).write();

let cachedVideos = [];

const scrapeAllShows = async () => {
  try {
    var puppeteerInstance = await createPuppeteerInstance();

    let i = 0;
    const anime = new Anime(puppeteerInstance);

    const existingShows = db.get("shows").value();

    for await (const show of shows as IShow[]) {
      i++;

      if (
        existingShows.find(
          (existingShow) => existingShow.details.name === show.name
        )
      ) {
        console.log(`${show.name} already exists, skipping...`);
        continue;
      }

      console.log(`${show.name}: ${i}/${shows.length}`);

      const details = await anime.getShowDetails(show.url);
      const episodes = await anime.getEpisodes(show.url);

      let j = 0;
      let video = "";

      for await (const episode of episodes) {
        console.log(`- scraping episode ${j + 1}/${episodes.length}`);
        if (cachedVideos.length <= j) {
          const { iframe } = await anime.getVideo(episode.url, {
            onlyGetIframeUrl: true,
          });

          cachedVideos.push(iframe);

          video = iframe;
        } else {
          video = cachedVideos[j];
        }
        (episode as any).video = video;
        j++;
      }

      cachedVideos = [];

      const finalShow = {
        id: i,
        details,
        episodes,
      };

      // @ts-ignore
      db.get("shows").push(finalShow).write();
    }

    anime.close();
  } catch (error) {
    console.warn(error);
    puppeteerInstance.browser.close();
    scrapeAllShows();
  }
};

scrapeAllShows();
