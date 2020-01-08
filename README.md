# 9anime Scraper

A node package/cli tool for scraping and viewing episodes hosted on 9anime

<p align="center">
  <img src="example.gif"/>
</p>

## Install CLI

Install globally with npm

```
npm install -g 9anime
```

Or with Yarn

```
yarn global add 9anime
```

Then just run the command `9anime` from your terminal to get started! It will ask you a few questions and then the episode will start playing directly within VLC. If you don't have VLC installed you can get it here: https://www.videolan.org/vlc/index.en-GB.html

## Install as a package

Install with npm

```
npm install 9anime
```

Or with Yarn

```
yarn add 9anime
```

**Example Usage**

```ts
import { Anime, createPuppeteerInstance } from "9anime";

// Create a new instance of puppeteer,
// You can replace this with a custom instance if required
const puppeteerInstance = await createPuppeteerInstance();

const anime = new Anime(puppeteerInstance);

// Destructure and get the first show in the search results
const [show] = await anime.search("jojo");

// Destructure and get the first episode of that show
const [episode] = await anime.getEpisodes(show.url);

// Get the video url for the selected episode
const { video } = await anime.getVideo(episode.url);

// Close puppeteer and free resources
anime.close();
```
