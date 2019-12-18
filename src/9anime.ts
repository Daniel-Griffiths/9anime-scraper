import puppeteer from "puppeteer";

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

/**
 * @param {string} show The name of the anime we want to search
 * @returns {Show[]}
 */
export const searchShow = async (show: string): Promise<Show[]> => {
  const { page } = await _createBrowserInstance();

  await page.goto(`https://9anime.to/search?keyword=${show}`);

  return await page.evaluate(() =>
    [...document.querySelectorAll(".film-list .item")].map(
      (elem: HTMLElement) => {
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
      }
    )
  );
};

/**
 * Returns a list of episodes for the specified season.
 *
 * @param {string} showUrl
 * @returns {Promise<Episode[]>}
 */
export const getEpisodes = async (showUrl: string): Promise<Episode[]> => {
  const { page } = await _createBrowserInstance();

  await page.goto(showUrl);

  await _clickVideoTab(page);

  return await page.evaluate(() =>
    [...document.querySelectorAll(".episodes a")].map((elem: HTMLElement) => {
      return {
        key: elem.innerText,
        name: `Episode ${elem.innerText}`,
        value: {
          text: elem.innerText,
          href: elem.getAttribute("href")
        }
      };
    })
  );
};

/**
 * Returns a video url for the specified episode.
 *
 * @param {string} episodeUrl
 * @returns {Promise<string>}
 */
export const getVideo = async (episodeUrl: string): Promise<string> => {
  const { page } = await _createBrowserInstance({ headless: false });

  await page.goto(`https://9anime.to${episodeUrl}`);

  await page.click(`#player`);

  await page.waitForSelector(`#player iframe`);

  const videoUrl = await page.evaluate(() =>
    document.querySelector("#player iframe").getAttribute("src")
  );

  await page.goto(videoUrl);

  const test = await page.evaluate(() =>
    document.querySelector("video").getAttribute("src")
  );

  console.log(test);

  return test;
};

const _clickVideoTab = async (page: puppeteer.Page): Promise<void> => {
  const mp4UploadTab = '.tab[data-name="35"]';

  await page.waitForSelector(mp4UploadTab);

  // sometimes this needs to be clicked multiple times to work due to ads opening
  await page.click(mp4UploadTab);
  await page.click(mp4UploadTab);
};

/**
 * Creates a new puppeteer instance
 *
 * @param {puppeteer.LaunchOptions} options
 * @returns {Promise<{page: puppeteer.Page, browser: puppeteer.Browser}>}}
 */
const _createBrowserInstance = async (
  options?: puppeteer.LaunchOptions
): Promise<{ page: puppeteer.Page; browser: puppeteer.Browser }> => {
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

  return { page, browser };
};
