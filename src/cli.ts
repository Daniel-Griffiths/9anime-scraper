#!/usr/bin/env node

import ora from "ora";
import open from "open";
import inquirer from "inquirer";
import { searchShows, getEpisodes, getVideo } from "./9anime";

(async () => {
  /**
   * Get shows
   */
  const { anime } = await inquirer.prompt([
    {
      type: "input",
      name: "anime",
      message: "What anime are you looking for?"
    }
  ]);

  const spinner = ora(`Searching for ${anime}`).start();

  const shows = await searchShows(anime);

  if (!shows || shows.length < 1) {
    spinner.stop();
    console.log(`Could not find any seasons for "${anime}"`);
    process.exit();
  }

  spinner.stop();

  /**
   * Get episodes
   */
  const { show } = await inquirer.prompt([
    {
      type: "list",
      name: "show",
      choices: shows,
      message: "Choose a season:"
    }
  ]);

  spinner.start("Getting episodes");

  const episodes = await getEpisodes(show.href);

  if (!episodes || episodes.length < 1) {
    spinner.stop();
    console.log(`Could not find any episodes for "${anime}"`);
    process.exit();
  }

  spinner.stop();

  /**
   * Play an episode
   */
  const { episode } = await inquirer.prompt([
    {
      type: "list",
      name: "episode",
      choices: episodes,
      message: "Choose a episode:"
    }
  ]);

  spinner.start("Opening video");

  const videoFile = await getVideo(episode.href);

  spinner.stop();

  await open(videoFile, { app: ["vlc", "--fullscreen", "--play-and-exit"] });
})();
