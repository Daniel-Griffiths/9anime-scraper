import { Page, Browser } from "puppeteer-core";

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

export interface IShowDetails {
  name: string;
  type: string;
  image: string;
  genres: string[];
  duration: string;
  premiered: string;
  completed: boolean;
  description: string;
}
