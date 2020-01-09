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
    const blacklistedDomains = [
      "disqus.com",
      "defpush.com",
      "twitter.com",
      "facebook.com",
      "mp4upload.com",
      "indlzxgptf.com",
      "google-analytics.com",
      "connect.facebook.net",
      "platform.twitter.com",
      "links.services.disqus.com",
      "cdn.runative-syndicate.com",
      "9anime.to/user/ajax/menu-bar"
    ]

    const blacklistedFileTypes = ["image", "font", "json", "media"]

    if (blacklistedDomains.includes(new URL(request.url()).host)) {
      return request.abort();
    }

    if (blacklistedFileTypes.indexOf(request.resourceType()) !== -1) {
      return request.abort();
    } 

    return request.continue();
  });

  return { page, browser };
};
