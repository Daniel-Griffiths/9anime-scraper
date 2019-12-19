import puppeteer, { Page, Browser, LaunchOptions } from "puppeteer";

interface Show {
  key: string;
  name: string;
  value: {
    text: string;
    href: string;
    image: string;
  };
}

interface Episode {
  key: string;
  name: string;
  value: {
    text: string;
    href: string;
  };
}

interface PuppeteerInstance {
  page: Page;
  browser: Browser;
}

/**
 * Returns a list of shows based on the search query
 *
 * @param {string} show The name of the anime we want to search for
 * @returns {Promise<Show[]>}
 */
export const searchShows = async (show: string): Promise<Show[]> =>
  await _createBrowserInstance<Show[]>(async ({ page }) => {
    await page.goto(`https://9anime.to/search?keyword=${show}`);

    return await page.$$eval(".film-list .item", elements =>
      elements.map((elem: HTMLElement) => {
        const imageElem: HTMLElement = elem.querySelector("img");
        const linkElem: HTMLElement = elem.querySelector("a:last-child");
        return {
          key: linkElem.innerText,
          name: linkElem.innerText,
          value: {
            text: linkElem.innerText,
            href: linkElem.getAttribute("href"),
            image: imageElem.getAttribute("src")
          }
        };
      })
    );
  });

/**
 * Returns a list of episodes for the specified show/season.
 *
 * @param {string} showUrl
 * @returns {Promise<Episode[]>}
 */
export const getEpisodes = async (showUrl: string): Promise<Episode[]> =>
  await _createBrowserInstance<Episode[]>(async ({ page }) => {
    await page.goto(showUrl);

    const mp4UploadTab = '.tab[data-name="35"]';

    await page.waitForSelector(mp4UploadTab);

    // sometimes this needs to be clicked multiple times to work due to ads opening
    await page.click(mp4UploadTab, {
      clickCount: 5
    });

    return await page.$$eval('.server[data-name="35"] .episodes a', elements =>
      elements.map((elem: HTMLElement) => {
        return {
          key: elem.innerText,
          name: `Episode ${elem.innerText}`,
          value: {
            text: elem.innerText,
            href: `https://9anime.to${elem.getAttribute("href")}`
          }
        };
      })
    );
  });

/**
 * Returns a video url for the specified episode.
 *
 * @param {string} episodeUrl
 * @returns {Promise<string>}
 */
export const getVideo = async (episodeUrl: string): Promise<string> =>
  await _createBrowserInstance<string>(async ({ page }) => {
    await page.goto(episodeUrl);

    await page.click(`#player`);

    await page.waitForSelector(`#player iframe`);

    const videoIframeUrl = await page.$eval("#player iframe", element =>
      element.getAttribute("src")
    );

    await page.goto(videoIframeUrl);

    return await page.$eval("video", element => element.getAttribute("src"));
  });

/**
 * Creates a new puppeteer instance
 *
 * @param {({ page, browser }: PuppeteerInstance) => Promise<T>} callback
 * @param {LaunchOptions} options
 * @returns {Promise<T>}}
 */
const _createBrowserInstance = async <T>(
  callback: ({ page, browser }: PuppeteerInstance) => Promise<T>,
  options?: LaunchOptions
): Promise<T> => {
  const browser = await puppeteer.launch({
    ...{
      headless: true,
      defaultViewport: null
    },
    ...options
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  await page.on("request", request => {
    if (["image", "font"].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });

  const returnValue = await callback({ page, browser });

  browser.close();

  return returnValue;
};
