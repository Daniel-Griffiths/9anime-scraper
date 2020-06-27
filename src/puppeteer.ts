import chromium from "chrome-aws-lambda";
import { LaunchOptions } from "puppeteer-core";

import { IPuppeteerInstance } from "./types";

/**
 * Createa a new Puppeteer instance
 *
 * @param   {LaunchOptions} options
 * @returns {Promise<IPuppeteerInstance>}
 */
export const createPuppeteerInstance = async (
  options: LaunchOptions = {}
): Promise<IPuppeteerInstance> => {
  const defaultOptions = {
    headless: true,
    args: chromium.args,
    ignoreHTTPSErrors: true,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  };

  const browser = await chromium.puppeteer.launch({
    ...defaultOptions,
    ...options,
  });

  browser.on("targetcreated", async (target) => {
    const page = await target.page();

    if (page && (await browser.pages()).length > 2) page.close();
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  await page.on("request", (request) => {
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
      "platform.twitterp.com",
      "9anime-to.disqus.com",
      "sb.scorecardresearch.com",
      "native.propellerclick.com",
      "links.services.disqus.com",
      "cdn.runative-syndicate.com",
      "9anime.to/user/ajax/menu-bar",
    ];

    const blacklistedFileTypes = [
      "stylesheet",
      "image",
      "font",
      "json",
      "media",
    ];

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
