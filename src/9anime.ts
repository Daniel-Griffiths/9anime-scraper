import { Scraper } from "./scraper";
import { ClickOptions } from "puppeteer";
import { IShow, IVideo, IEpisode, ILink, IShowDetails } from "./types";

export class Anime extends Scraper {
  /**
   * Returns a list of shows based on the search query
   *
   * @param {string} show The name of the anime we want to search for
   * @returns {Promise<IShow[]>}
   */
  public search = async (show: string): Promise<IShow[]> => {
    await this.goto(`https://9anime.to/search?keyword=${show}`);

    return await this.puppeteer.page.$$eval(".film-list .item", elements =>
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
   * Returns all the details for the specified show
   *
   * @param {string} showUrl
   * @returns {Promise<IShowDetails>}
   */
  public getShowDetails = async (showUrl: string): Promise<IShowDetails> => {
    await this.goto(showUrl);

    const name = await this.$eval(
      ".title",
      (element: HTMLElement) => element.innerText
    );

    const description = await this.$eval(
      ".long",
      (element: HTMLElement) => element.innerText
    );

    const type = await this.$eval(
      "dl.meta:nth-child(1) dd:nth-of-type(1)",
      (element: HTMLElement) => element.innerText
    );

    const completed = await this.$eval(
      "dl.meta:nth-child(1) dd:nth-of-type(4)",
      (element: HTMLElement) => element.innerText === "Completed"
    );

    const genres = await this.$eval(
      "dl.meta:nth-child(1) dd:nth-of-type(5)",
      (element: HTMLElement) => element.innerText.split(", ")
    );

    const duration = await this.$eval(
      "dl.meta:nth-child(2) dd:nth-of-type(4)",
      (element: HTMLElement) => element.innerText
    );

    const premiered = await this.$eval(
      "dl.meta:nth-child(2) dd:nth-of-type(3)",
      (element: HTMLElement) => element.innerText
    );

    return {
      name,
      type,
      genres,
      duration,
      premiered,
      completed,
      description
    };
  };

  /**
   * Returns a list of episodes for the specified show/season.
   *
   * @param {string} showUrl
   * @returns {Promise<IEpisode[]>}
   */
  public getEpisodes = async (showUrl: string): Promise<IEpisode[]> => {
    const mp4UploadTab = '.tab[data-name="35"]';

    await this.goto(showUrl);
    await this.puppeteer.page.waitForSelector(mp4UploadTab);

    // sometimes this needs to be clicked multiple times to work due to ads opening
    await this.puppeteer.page.click(mp4UploadTab, {
      clickCount: 5
    });

    return await this.puppeteer.page.$$eval(
      '.server[data-name="35"] .episodes a',
      elements =>
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
   * @param {object} options
   * @returns {Promise<IVideo>}
   */
  public getVideo = async (
    episodeUrl: string,
    options?: { onlyGetIframeUrl: boolean }
  ): Promise<IVideo> => {
    await this.goto(episodeUrl);

    const clickOptions: ClickOptions = {
      clickCount: 5
    };

    await this.puppeteer.page.waitFor(1000);

    await this.puppeteer.page.waitForSelector(`.episodes .active`);
    await this.puppeteer.page.click(`.episodes .active`, clickOptions);

    await this.puppeteer.page.waitForSelector(`#player`);
    await this.puppeteer.page.click(`#player`, clickOptions);

    await this.puppeteer.page.waitForSelector(`#player iframe`);

    const videoIframeUrl = await this.puppeteer.page.$eval(
      "#player iframe",
      element => element.getAttribute("src")
    );

    /**
     * It is much faster to only get the iframe url if that's all we need
     */
    if (options?.onlyGetIframeUrl) {
      return {
        video: "",
        iframe: videoIframeUrl
      };
    }

    await this.goto(videoIframeUrl);

    const videoUrl = await this.puppeteer.page.$eval("video", element =>
      element.getAttribute("src")
    );

    return {
      video: videoUrl,
      iframe: videoIframeUrl
    };
  };

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
  public scrapeAllShows = async (
    pageNumber: number = 1,
    initialLinks: ILink[] = []
  ) => {
    await this.goto(`https://9anime.to/az-list?page=${pageNumber}`);

    const links = await this.puppeteer.page.$$eval(".items .item", elements =>
      elements.map((elem: HTMLElement) => {
        const imageElem: HTMLElement = elem.querySelector("img");
        const linkElem: HTMLElement = elem.querySelector(".info a");
        return {
          name: linkElem.innerText,
          url: linkElem.getAttribute("href"),
          image: imageElem.getAttribute("src")
        };
      })
    );

    const maxPageNumber = await this.puppeteer.page.$eval(
      "form .total",
      (element: HTMLElement) => {
        return Number(element.innerText);
      }
    );

    console.log(`Scanned ${pageNumber}/${maxPageNumber} pages`);

    if (pageNumber < maxPageNumber) {
      return await this.scrapeAllShows(pageNumber + 1, [
        ...initialLinks,
        ...links
      ]);
    }

    return initialLinks;
  };
}
