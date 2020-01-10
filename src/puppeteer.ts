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
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
    ]
  }
): Promise<IPuppeteerInstance> => {
  const browser = await puppeteer.launch(options);

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  await page.on("request", request => {
    const blacklistedDomains = [
      "zap.buzz",
      "google.com",
      "disqus.com",
      "defpush.com",
      "twitter.com",
      "gstatic.com",
      "facebook.com",
      "mp4upload.com",
      "jsc.mgrid.com",
      "s7.addthis.com",
      "indlzxgptf.com",
      "cm.steepto.com",
      "c.disquscdn.com",
      "servicer.mgrid.com",
      "fonts.googleapis.com",
      "google-analytics.com",
      "connect.facebook.net",
      "platform.twitter.com",
      "9anime-to.disqus.com",
      "sb.scorecardresearch.com",
      "native.propellerclick.com",
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
