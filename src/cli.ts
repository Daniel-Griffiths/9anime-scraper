#!/usr/bin/env node

import ora from "ora";
import open from "open";
import inquirer from "inquirer";
import { searchShows, getEpisodes, getVideo } from "./9anime";

/**
 * Convert objects to be
 * used in inquirer prompts
 *
 * @param {T[]} items
 * @returns {{value: T, name: string}[]}
 */
function _toInquirerQuestions<T extends { name: string }>(
  items: T[]
): { value: T; name: string }[] {
  return items.map(item => {
    return {
      value: item,
      name: item.name
    };
  });
}

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
      message: "Choose a season:",
      choices: _toInquirerQuestions(shows)
    }
  ]);

  spinner.start("Getting episodes");

  const episodes = await getEpisodes(show.url);

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
      message: "Choose a episode:",
      choices: _toInquirerQuestions(episodes)
    }
  ]);

  spinner.start("Opening video");

  const { video } = await getVideo(episode.url);

  spinner.stop();

  await open(video, { app: ["vlc", "--fullscreen", "--play-and-exit"] });
})();
