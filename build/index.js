var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ora from "ora";
import open from "open";
import inquirer from "inquirer";
import puppeteer from "puppeteer";
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });
    const page = yield browser.newPage();
    const { anime } = yield inquirer.prompt([
        {
            type: "input",
            name: "anime",
            message: "What anime are you looking for?",
        },
    ]);
    const spinner = ora(`Searching for ${anime}`).start();
    yield page.goto(`https://9anime.to/search?keyword=${anime}`);
    const shows = yield page.evaluate(() => [...document.querySelectorAll(".film-list .item")].map((elem) => {
        const imageElem = elem.querySelector("img");
        const linkElem = elem.querySelector("a:last-child");
        return {
            key: linkElem.innerText,
            name: linkElem.innerText,
            value: {
                text: linkElem.innerText,
                href: linkElem.getAttribute("href"),
                image: imageElem.getAttribute("src"),
            },
        };
    }));
    spinner.stop();
    const { show } = yield inquirer.prompt([
        {
            type: "list",
            name: "show",
            choices: shows,
            message: "Choose a season:",
        },
    ]);
    spinner.start("Getting episodes");
    yield page.goto(show.href);
    const mp4UploadTab = '.tab[data-name="35"]';
    yield page.waitForSelector(mp4UploadTab);
    // sometimes this needs to be clicked multiple times to work due to ads opening
    yield page.click(mp4UploadTab);
    yield page.click(mp4UploadTab);
    const episodes = yield page.evaluate(() => [...document.querySelectorAll(".episodes a")].map((elem) => {
        return {
            key: elem.innerText,
            name: `Episode ${elem.innerText}`,
            value: {
                text: elem.innerText,
                href: elem.getAttribute("href"),
            },
        };
    }));
    spinner.stop();
    const { episode } = yield inquirer.prompt([
        {
            type: "list",
            name: "episode",
            choices: episodes,
            message: "Choose a episode:",
        },
    ]);
    spinner.start("Opening video");
    yield page.goto(`https://9anime.to${episode.href}`);
    yield page.click(`#player`);
    yield page.waitForSelector(`#player iframe`);
    const videoUrl = yield page.evaluate(() => document.querySelector("#player iframe").getAttribute("src"));
    yield page.goto(videoUrl);
    const videoFile = yield page.evaluate(() => document.querySelector("video").getAttribute("src"));
    spinner.stop();
    yield open(videoFile, { app: ["vlc", "--fullscreen", "--play-and-exit"] });
    yield browser.close();
}))();
