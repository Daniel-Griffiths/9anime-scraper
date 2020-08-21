import puppeteer from "puppeteer-extra";
import { LaunchOptions } from "puppeteer";
import puppeteerFirefox from "puppeteer-firefox";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { IPuppeteerInstance } from "./types";

puppeteer.use(StealthPlugin());

type Options = LaunchOptions & { firefox?: boolean };

/**
 * Createa a new Puppeteer instance
 *
 * @param   {Options} options Specify custom puppeteer options
 * @returns {Promise<IPuppeteerInstance>}
 */
export const createPuppeteerInstance = async (
  options?: Options
): Promise<IPuppeteerInstance> => {
  const defaultOptions: Options = {
    headless: true,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: [
      "--no-pings",
      "--no-zygote",
      "--mute-audio",
      "--no-sandbox",
      "--disable-sync",
      "--enable-webgl",
      "--no-first-run",
      "--hide-scrollbars",
      "--disable-breakpad",
      "--disable-infobars",
      "--enable-async-dns",
      "--disable-translate",
      "--use-mock-keychain",
      "--disable-extensions",
      "--disable-speech-api",
      "--use-gl=swiftshader",
      "--disable-voice-input",
      "--disable-cloud-import",
      "--disable-default-apps",
      "--disable-hang-monitor",
      "--disable-wake-on-wifi",
      "--enable-tcp-fast-open",
      "--ignore-gpu-blacklist",
      "--password-store=basic",
      "--disable-dev-shm-usage",
      "--disable-notifications",
      "--disable-print-preview",
      "--disable-gesture-typing",
      "--disable-popup-blocking",
      "--disable-setuid-sandbox",
      "--metrics-recording-only",
      "--disable-prompt-on-repost",
      "--disk-cache-size=33554432",
      "--no-default-browser-check",
      "--media-cache-size=33554432",
      "--enable-simple-cache-backend",
      "--disable-tab-for-desktop-share",
      "--prerender-from-omnibox=disabled",
      "--disable-offer-upload-credit-cards",
      "--disable-background-timer-throttling",
      "--disable-client-side-phishing-detection",
      "--disable-offer-store-unmasked-wallet-cards",
    ],
  };

  if (options?.firefox !== false) {
    const browser = await puppeteerFirefox.launch(defaultOptions);

    await browser.userAgent();

    const page = await browser.newPage();

    return { page, browser };
  }

  const browser = await puppeteer.launch({ ...defaultOptions, ...options });

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

    if (request.isNavigationRequest() && request.redirectChain().length) {
      request.abort();
    }

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
