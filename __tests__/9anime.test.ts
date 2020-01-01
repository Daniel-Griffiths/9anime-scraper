import { getVideo, searchShows, getEpisodes } from "./../src/9anime";

import { createPuppeteerInstance } from "./../src/puppeteer";

it(
  "can search for videos",
  async () => {
    const puppeteerInstance = await createPuppeteerInstance();

    const [show] = await searchShows(puppeteerInstance, "jojo");
    const [episode] = await getEpisodes(puppeteerInstance, show.url);
    const { video } = await getVideo(puppeteerInstance, episode.url);

    expect(video).toMatch(new RegExp("https://(.*)/video.mp4"));

    puppeteerInstance.browser.close();
  },
  1000 * 30
);
