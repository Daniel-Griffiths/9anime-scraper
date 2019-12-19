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
const puppeteer_1 = __importDefault(require("puppeteer"));
/**
 * Returns a list of shows based on the search query
 *
 * @param {string} show The name of the anime we want to search for
 * @returns {Promise<Show[]>}
 */
exports.searchShows = (show) => __awaiter(void 0, void 0, void 0, function* () {
    return yield _createBrowserInstance(({ page }) => __awaiter(void 0, void 0, void 0, function* () {
        yield page.goto(`https://9anime.to/search?keyword=${show}`);
        return yield page.$$eval(".film-list .item", elements => elements.map((elem) => {
            const imageElem = elem.querySelector("img");
            const linkElem = elem.querySelector("a:last-child");
            return {
                key: linkElem.innerText,
                name: linkElem.innerText,
                value: {
                    text: linkElem.innerText,
                    href: linkElem.getAttribute("href"),
                    image: imageElem.getAttribute("src")
                }
            };
        }));
    }));
});
/**
 * Returns a list of episodes for the specified show/season.
 *
 * @param {string} showUrl
 * @returns {Promise<Episode[]>}
 */
exports.getEpisodes = (showUrl) => __awaiter(void 0, void 0, void 0, function* () {
    return yield _createBrowserInstance(({ page }) => __awaiter(void 0, void 0, void 0, function* () {
        yield page.goto(showUrl);
        const mp4UploadTab = '.tab[data-name="35"]';
        yield page.waitForSelector(mp4UploadTab);
        // sometimes this needs to be clicked multiple times to work due to ads opening
        yield page.click(mp4UploadTab, {
            clickCount: 5
        });
        return yield page.$$eval('.server[data-name="35"] .episodes a', elements => elements.map((elem) => {
            return {
                key: elem.innerText,
                name: `Episode ${elem.innerText}`,
                value: {
                    text: elem.innerText,
                    href: `https://9anime.to${elem.getAttribute("href")}`
                }
            };
        }));
    }));
});
/**
 * Returns a video url for the specified episode.
 *
 * @param {string} episodeUrl
 * @returns {Promise<string>}
 */
exports.getVideo = (episodeUrl) => __awaiter(void 0, void 0, void 0, function* () {
    return yield _createBrowserInstance(({ page }) => __awaiter(void 0, void 0, void 0, function* () {
        yield page.goto(episodeUrl);
        yield page.click(`#player`);
        yield page.waitForSelector(`#player iframe`);
        const videoIframeUrl = yield page.$eval("#player iframe", element => element.getAttribute("src"));
        yield page.goto(videoIframeUrl);
        return yield page.$eval("video", element => element.getAttribute("src"));
    }));
});
/**
 * Creates a new puppeteer instance
 *
 * @param {puppeteer.LaunchOptions} options
 * @returns {Promise<{page: puppeteer.Page, browser: puppeteer.Browser}>}}
 */
const _createBrowserInstance = (callback, options) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch(Object.assign({
        headless: true,
        defaultViewport: null
    }, options));
    const page = yield browser.newPage();
    yield page.setRequestInterception(true);
    yield page.on("request", request => {
        if (["image", "font"].indexOf(request.resourceType()) !== -1) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    const returnValue = yield callback({ page, browser });
    browser.close();
    return returnValue;
});
