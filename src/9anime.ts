import cheerio from "cheerio";

import { Scraper } from "./scraper";
import { WEBSITE_URL } from "./constants/9anime";
import { IShow, IVideo, IEpisode, ILink, IShowDetails } from "./types";

export class Anime extends Scraper {
  /**
   * Returns a list of shows based on the search query
   *
   * @param {string} show The name of the anime we want to search for
   * @returns {Promise<IShow[]>}
   */
  public search = async (show: string): Promise<IShow[]> => {
    await this.goto(`${WEBSITE_URL}/search?keyword=${show}`);

    return await this.puppeteer.page.$$eval(".film-list .item", (elements) =>
      elements.map((elem: HTMLElement) => {
        const imageElem: HTMLElement = elem.querySelector("img");
        const linkElem: HTMLElement = elem.querySelector("a:last-child");
        return {
          name: linkElem.innerText,
          url: linkElem.getAttribute("href"),
          image: imageElem.getAttribute("src"),
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

    const image = await this.$eval(
      ".thumb.col-md-5.hidden-sm.hidden-xs > img",
      (element: HTMLElement) => element.getAttribute("src")
    );

    return {
      name,
      type,
      image,
      genres,
      duration,
      premiered,
      completed,
      description,
    };
  };

  /**
   * Returns a list of episodes for the specified show/season.
   *
   * @param {string} showUrl
   * @returns {Promise<IEpisode[]>}
   */
  public getEpisodes = async (showUrl: string): Promise<IEpisode[]> => {
    await this.goto(showUrl);

    const html = await this._getEpisodeHTMLFromUrl(showUrl);

    const $ = cheerio.load(html);

    return $('.server[data-name="35"] .episodes a')
      .toArray()
      .map((el) => {
        return {
          url: `${WEBSITE_URL}${el.attribs.href}`,
          name: `Episode ${el.children[0].data}`,
        };
      });
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

    const html = await this._getEpisodeHTMLFromUrl(episodeUrl);

    const $ = cheerio.load(html);

    const episodeId = this._getEpisodeIdFromUrl(episodeUrl);
    const videoId = $('.server[data-name="35"] .episodes a')
      .toArray()
      .map((el) => {
        return {
          id: el.attribs["data-id"],
          url: `${WEBSITE_URL}${el.attribs.href}`,
        };
      })
      .find((episode) => {
        return episode.url.includes(episodeId);
      }).id;

    const data = await this.puppeteer.page.evaluate(async (videoId) => {
      const sleep = async (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      };

      const fetchRetry = async (url: string, limit: number = 0) => {
        if (limit > 5) {
          throw new Error(
            `Tried fetching the episode details ${limit} times but failed.`
          );
        }

        try {
          const response = await fetch(
            `/ajax/episode/info?id=${videoId}&server=35`
          );

          return await response.json();
        } catch (error) {
          await sleep(1000);
          return await fetchRetry(url, limit + 1);
        }
      };

      return fetchRetry(`/ajax/episode/info?id=${videoId}&server=35`);
    }, videoId);

    const videoIframeUrl = data.target;

    /**
     * It is much faster to only get the iframe url if that's all we need
     */
    if (options?.onlyGetIframeUrl) {
      return {
        video: "",
        iframe: videoIframeUrl,
      };
    }

    await this.goto(videoIframeUrl);

    const videoUrl = await this.puppeteer.page.$eval(
      "video source",
      (element) => element.getAttribute("src")
    );

    return {
      video: videoUrl,
      iframe: videoIframeUrl,
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
    await this.goto(`${WEBSITE_URL}/az-list?page=${pageNumber}`);

    const links = await this.puppeteer.page.$$eval(".items .item", (elements) =>
      elements.map((elem: HTMLElement) => {
        const imageElem: HTMLElement = elem.querySelector("img");
        const linkElem: HTMLElement = elem.querySelector(".info a");
        return {
          name: linkElem.innerText,
          url: linkElem.getAttribute("href"),
          image: imageElem.getAttribute("src"),
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
        ...links,
      ]);
    }

    return initialLinks;
  };

  private _getShowIdFromUrl = (url: string): string => {
    return url.split("/")[4].split(".")[1];
  };

  private _getEpisodeIdFromUrl = (url: string): string => {
    return url.split("/")[5];
  };

  private _getEpisodeHTMLFromUrl = async (showUrl: string) => {
    return await this.puppeteer.page.evaluate(async (showId) => {
      const response = await fetch(`/ajax/film/servers?id=${showId}`);
      const { html } = await response.json();
      return html;
    }, this._getShowIdFromUrl(showUrl));
  };
}
