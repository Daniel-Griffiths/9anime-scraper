import { IShow, IVideo, IEpisode, ILink, IPuppeteerInstance } from "./types";

/**
 * Returns a list of shows based on the search query
 *
 * @param {string} show The name of the anime we want to search for
 * @returns {Promise<IShow[]>}
 */
export const searchShows = async (
  { page }: IPuppeteerInstance,
  show: string
): Promise<IShow[]> => {
  await page.goto(`https://9anime.to/search?keyword=${show}`);

  return await page.$$eval(".film-list .item", elements =>
    elements.map((elem: HTMLElement) => {
      const imageElem: HTMLElement = elem.querySelector("img");
      const linkElem: HTMLElement = elem.querySelector("a:last-child");
      return {
        name: linkElem.innerText,
        url: linkElem.getAttribute("href"),
        image: imageElem.getAttribute("src")
      };
    })
  );
};

/**
 * Returns a list of episodes for the specified show/season.
 *
 * @param {string} showUrl
 * @returns {Promise<IEpisode[]>}
 */
export const getEpisodes = async (
  { page }: IPuppeteerInstance,
  showUrl: string
): Promise<IEpisode[]> => {
  const mp4UploadTab = '.tab[data-name="35"]';

  await page.goto(showUrl);
  await page.waitForSelector(mp4UploadTab);

  // sometimes this needs to be clicked multiple times to work due to ads opening
  await page.click(mp4UploadTab, {
    clickCount: 5
  });

  return await page.$$eval('.server[data-name="35"] .episodes a', elements =>
    elements.map((elem: HTMLElement) => {
      return {
        name: `Episode ${elem.innerText}`,
        url: `https://9anime.to${elem.getAttribute("href")}`
      };
    })
  );
};

/**
 * Returns a video url for the specified episode.
 *
 * @param {string} episodeUrl
 * @returns {Promise<IVideo>}
 */
export const getVideo = async (
  { page }: IPuppeteerInstance,
  episodeUrl: string
): Promise<IVideo> => {
  await page.goto(episodeUrl);
  await page.click(`#player`);
  await page.waitForSelector(`#player iframe`);

  const videoIframeUrl = await page.$eval("#player iframe", element =>
    element.getAttribute("src")
  );

  await page.goto(videoIframeUrl);

  const videoUrl = await page.$eval("video", element =>
    element.getAttribute("src")
  );

  return {
    video: videoUrl,
    iframe: videoIframeUrl
  };
};

export const scrapeAllShows = async (puppeteerInstance: IPuppeteerInstance) =>
  await scrapeAllShowsRecursive(puppeteerInstance);

/**
 * Scrape all the shows on the a-z page.
 * This will take a long time to finish!
 *
 * This method is intended for private use so
 * the api could change at any time!
 *
 * @param {number} pageNumber
 * @param {Array} initialLinks
 */
export const scrapeAllShowsRecursive = async (
  { page, browser }: IPuppeteerInstance,
  pageNumber: number = 1,
  initialLinks: ILink[] = []
) => {
  await page.goto(`https://9anime.to/az-list?page=${pageNumber}`);

  const links = await page.$$eval(".items .item", elements =>
    elements.map((elem: HTMLElement) => {
      const imageElem: HTMLElement = elem.querySelector("img");
      const linkElem: HTMLElement = elem.querySelector(".info a");
      return {
        name: linkElem.innerHTML,
        url: linkElem.getAttribute("href"),
        image: imageElem.getAttribute("src")
      };
    })
  );

  const maxPageNumber = await page.$eval("form .total", element => {
    return Number(element.innerHTML);
  });

  console.log(`Scanned ${pageNumber}/${maxPageNumber} pages`);

  if (pageNumber < maxPageNumber) {
    return await scrapeAllShowsRecursive({ page, browser }, pageNumber + 1, [
      ...initialLinks,
      ...links
    ]);
  }

  return initialLinks;
};
