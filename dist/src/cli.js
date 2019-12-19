#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ora_1 = __importDefault(require("ora"));
const open_1 = __importDefault(require("open"));
const inquirer_1 = __importDefault(require("inquirer"));
const _9anime_1 = require("./9anime");
(() => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * Get shows
     */
    const { anime } = yield inquirer_1.default.prompt([
        {
            type: "input",
            name: "anime",
            message: "What anime are you looking for?"
        }
    ]);
    const spinner = ora_1.default(`Searching for ${anime}`).start();
    const shows = yield _9anime_1.searchShows(anime);
    if (!shows || shows.length < 1) {
        spinner.stop();
        console.log(`Could not find any seasons for "${anime}"`);
        process.exit();
    }
    spinner.stop();
    /**
     * Get episodes
     */
    const { show } = yield inquirer_1.default.prompt([
        {
            type: "list",
            name: "show",
            choices: shows,
            message: "Choose a season:"
        }
    ]);
    spinner.start("Getting episodes");
    const episodes = yield _9anime_1.getEpisodes(show.href);
    if (!episodes || episodes.length < 1) {
        spinner.stop();
        console.log(`Could not find any episodes for "${anime}"`);
        process.exit();
    }
    spinner.stop();
    /**
     * Play an episode
     */
    const { episode } = yield inquirer_1.default.prompt([
        {
            type: "list",
            name: "episode",
            choices: episodes,
            message: "Choose a episode:"
        }
    ]);
    spinner.start("Opening video");
    const videoFile = yield _9anime_1.getVideo(episode.href);
    spinner.stop();
    yield open_1.default(videoFile, { app: ["vlc", "--fullscreen", "--play-and-exit"] });
}))();
