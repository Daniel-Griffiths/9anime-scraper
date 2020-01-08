import { IPuppeteerInstance } from "./types";

export class Scraper {
  protected puppeteer: IPuppeteerInstance;

  public constructor(puppeteer: IPuppeteerInstance) {
    this.puppeteer = puppeteer;
  }

  public close = () => {
    this.puppeteer.browser.close();
  };
}
