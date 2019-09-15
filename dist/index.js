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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ora_1 = __importDefault(require("ora"));
var open_1 = __importDefault(require("open"));
var inquirer_1 = __importDefault(require("inquirer"));
var puppeteer_1 = __importDefault(require("puppeteer"));
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, anime, spinner, shows, show, mp4UploadTab, episodes, episode, videoUrl, videoFile;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                    headless: true,
                    defaultViewport: null,
                })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            type: "input",
                            name: "anime",
                            message: "What anime are you looking for?",
                        },
                    ])];
            case 3:
                anime = (_a.sent()).anime;
                spinner = ora_1.default("Searching for " + anime).start();
                return [4 /*yield*/, page.goto("https://9anime.to/search?keyword=" + anime)];
            case 4:
                _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        // @ts-ignore
                        return __spreadArrays(document.querySelectorAll(".film-list .item")).map(function (elem) {
                            var imageElem = elem.querySelector("img");
                            var linkElem = elem.querySelector("a:last-child");
                            return {
                                key: linkElem.innerText,
                                name: linkElem.innerText,
                                value: {
                                    text: linkElem.innerText,
                                    href: linkElem.getAttribute("href"),
                                    image: imageElem.getAttribute("src"),
                                },
                            };
                        });
                    })];
            case 5:
                shows = _a.sent();
                spinner.stop();
                return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            type: "list",
                            name: "show",
                            choices: shows,
                            message: "Choose a season:",
                        },
                    ])];
            case 6:
                show = (_a.sent()).show;
                spinner.start("Getting episodes");
                return [4 /*yield*/, page.goto(show.href)];
            case 7:
                _a.sent();
                mp4UploadTab = '.tab[data-name="35"]';
                return [4 /*yield*/, page.waitForSelector(mp4UploadTab)];
            case 8:
                _a.sent();
                // sometimes this needs to be clicked multiple times to work due to ads opening
                return [4 /*yield*/, page.click(mp4UploadTab)];
            case 9:
                // sometimes this needs to be clicked multiple times to work due to ads opening
                _a.sent();
                return [4 /*yield*/, page.click(mp4UploadTab)];
            case 10:
                _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        // @ts-ignore
                        return __spreadArrays(document.querySelectorAll(".episodes a")).map(function (elem) {
                            return {
                                key: elem.innerText,
                                name: "Episode " + elem.innerText,
                                value: {
                                    text: elem.innerText,
                                    href: elem.getAttribute("href"),
                                },
                            };
                        });
                    })];
            case 11:
                episodes = _a.sent();
                spinner.stop();
                return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            type: "list",
                            name: "episode",
                            choices: episodes,
                            message: "Choose a episode:",
                        },
                    ])];
            case 12:
                episode = (_a.sent()).episode;
                spinner.start("Opening video");
                return [4 /*yield*/, page.goto("https://9anime.to" + episode.href)];
            case 13:
                _a.sent();
                return [4 /*yield*/, page.click("#player")];
            case 14:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector("#player iframe")];
            case 15:
                _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        return document.querySelector("#player iframe").getAttribute("src");
                    })];
            case 16:
                videoUrl = _a.sent();
                return [4 /*yield*/, page.goto(videoUrl)];
            case 17:
                _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        return document.querySelector("video").getAttribute("src");
                    })];
            case 18:
                videoFile = _a.sent();
                spinner.stop();
                return [4 /*yield*/, open_1.default(videoFile, { app: ["vlc", "--fullscreen", "--play-and-exit"] })];
            case 19:
                _a.sent();
                return [4 /*yield*/, browser.close()];
            case 20:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
