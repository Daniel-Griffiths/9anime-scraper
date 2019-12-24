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
import { searchShows, getEpisodes, getVideo } from "9anime";

const [show] = await searchShows("jojo");
const [episode] = await getEpisodes(show.url);
const videoUrl = await getVideo(episode.url);
```
