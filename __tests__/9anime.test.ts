import { Anime } from "./../src/9anime";

import { createPuppeteerInstance } from "./../src/puppeteer";

it(
  "can search for videos",
  async () => {
    const puppeteerInstance = await createPuppeteerInstance();

    const anime = new Anime(puppeteerInstance);

    const [show] = await anime.search("jojo");
    const [episode] = await anime.getEpisodes(show.url);
    const { video } = await anime.getVideo(episode.url);

    expect(video).toMatch(new RegExp("https://(.*)/video.mp4"));

    anime.close();
  },
  1000 * 30
);
