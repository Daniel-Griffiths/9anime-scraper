import puppeteer, { LaunchOptions } from "puppeteer";

import { IPuppeteerInstance } from "./types";

/**
 * Createa a new Puppeteer instance
 *
 * @param   {LaunchOptions} options
 * @returns {Promise<IPuppeteerInstance>}
 */
export const createPuppeteerInstance = async (
  options: LaunchOptions = {
    headless: true,
    defaultViewport: null,
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
): Promise<IPuppeteerInstance> => {
  const browser = await puppeteer.launch(options);

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  await page.on("request", request => {
    if (["image", "font", "json"].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });

  return { page, browser };
};
