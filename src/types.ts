import { Page, Browser } from "puppeteer";

export interface IShow {
  url: string;
  name: string;
  image: string;
}

export interface IEpisode {
  url: string;
  name: string;
}

export interface ILink {
  url: string;
  name: string;
  image: string;
}

export interface IVideo {
  video: string;
  iframe: string;
}

export interface IPuppeteerInstance {
  page: Page;
  browser: Browser;
}
