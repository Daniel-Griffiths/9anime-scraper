import ora from "ora";
import open from "open";
import inquirer from "inquirer";
import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  const { anime } = await inquirer.prompt([
    {
      type: "input",
      name: "anime",
      message: "What anime are you looking for?",
    },
  ]);

  const spinner = ora(`Searching for ${anime}`).start();

  await page.goto(`https://9anime.to/search?keyword=${anime}`);

  const shows = await page.evaluate(() =>
    [...document.querySelectorAll(".film-list .item")].map(
      (elem: HTMLElement) => {
        const imageElem: HTMLElement = elem.querySelector("img");
        const linkElem: HTMLElement = elem.querySelector("a:last-child");
        return {
          key: linkElem.innerText,
          name: linkElem.innerText,
          value: {
            text: linkElem.innerText,
            href: linkElem.getAttribute("href"),
            image: imageElem.getAttribute("src"),
          },
        };
      }
    )
  );

  spinner.stop();

  const { show } = await inquirer.prompt([
    {
      type: "list",
      name: "show",
      choices: shows,
      message: "Choose a season:",
    },
  ]);

  spinner.start("Getting episodes");

  await page.goto(show.href);

  const mp4UploadTab = '.tab[data-name="35"]';

  await page.waitForSelector(mp4UploadTab);

  // sometimes this needs to be clicked multiple times to work due to ads opening
  await page.click(mp4UploadTab);
  await page.click(mp4UploadTab);

  const episodes = await page.evaluate(() =>
    [...document.querySelectorAll(".episodes a")].map((elem: HTMLElement) => {
      return {
        key: elem.innerText,
        name: `Episode ${elem.innerText}`,
        value: {
          text: elem.innerText,
          href: elem.getAttribute("href"),
        },
      };
    })
  );

  spinner.stop();

  const { episode } = await inquirer.prompt([
    {
      type: "list",
      name: "episode",
      choices: episodes,
      message: "Choose a episode:",
    },
  ]);

  spinner.start("Opening video");

  await page.goto(`https://9anime.to${episode.href}`);

  await page.click(`#player`);

  await page.waitForSelector(`#player iframe`);

  const videoUrl = await page.evaluate(() =>
    document.querySelector("#player iframe").getAttribute("src")
  );

  await page.goto(videoUrl);

  const videoFile = await page.evaluate(() =>
    document.querySelector("video").getAttribute("src")
  );

  spinner.stop();

  await open(videoFile, { app: ["vlc", "--fullscreen", "--play-and-exit"] });

  await browser.close();
})();
