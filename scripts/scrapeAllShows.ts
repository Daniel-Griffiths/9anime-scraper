/**
 * Quick and dirty script for scraping all shows.
 */
import fs from "fs";
import { IShow } from "../src/types";
import { Anime, createPuppeteerInstance } from "../index";

const shows = JSON.parse(fs.readFileSync("../shows.json", "utf8"));

let cachedVideos = [];

const scrapeAllShows = async () => {
  console.log(cachedVideos);

  try {
    var puppeteerInstance = await createPuppeteerInstance();

    let i = 0;
    const anime = new Anime(puppeteerInstance);

    for await (const show of shows as IShow[]) {
      i++;

      const filename = `../shows/${i}-${show.name.replace(
        /[/\\?%*:|"<>]/g,
        ""
      )}.json`;

      if (fs.existsSync(filename)) {
        continue;
      }

      console.log(`${show.name}: ${i}/${shows.length}`);

      const details = await anime.getShowDetails(show.url);
      const episodes = await anime.getEpisodes(show.url);

      let j = 0;
      let video = "";

      for await (const episode of episodes) {
        if (cachedVideos.length <= j) {
          const { iframe } = await anime.getVideo(episode.url, {
            onlyGetIframeUrl: true
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
        details,
        episodes
      };

      fs.writeFileSync(filename, JSON.stringify(finalShow, null, 2));
    }

    anime.close();
  } catch (error) {
    console.warn(error);
    puppeteerInstance.browser.close();
    scrapeAllShows();
  }
};

scrapeAllShows();
