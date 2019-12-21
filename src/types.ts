import { Page, Browser } from "puppeteer";

export interface IShow {
    key: string;
    name: string;
    value: {
      text: string;
      href: string;
      image: string;
    };
  }
  
export interface IEpisode {
    key: string;
    name: string;
    value: {
        text: string;
        href: string;
    };
}

export interface IPuppeteerInstance {
    page: Page;
    browser: Browser;
}