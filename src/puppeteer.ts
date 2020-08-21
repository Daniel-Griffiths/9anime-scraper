import puppeteer from "puppeteer-extra";
import { LaunchOptions } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { IPuppeteerInstance } from "./types";
import { WEBSITE_URL } from "./constants/9anime";

puppeteer.use(StealthPlugin());

type Options = LaunchOptions;

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
      "go.bebi.com",
      "st.bebi.com",
      "facebook.com",
      "mp4upload.com",
      "jsc.mgrid.com",
      "whos.amung.us",
      "s7.addthis.com",
      "indlzxgptf.com",
      "cm.steepto.com",
      "www.google.com",
      "c.disquscdn.com",
      "suburbglaze.com",
      "static.akacdn.ru",
      "jojoie8eamus.com",
      "evergreensame.com",
      "servicer.mgrid.com",
      "demand.bidgear.com",
      "ie8eamus.com/sfp.js",
      "fonts.googleapis.com",
      "google-analytics.com",
      "connect.facebook.net",
      "9anime-to.disqus.com",
      "cdnjs.cloudflare.com",
      "platform.bidgear.com",
      "platform.twitter.com",
      "platform.twitterp.com",
      "jojoevergreensame.com",
      "r.remarketingpixel.com",
      "slaveforgetfulsneak.com",
      "sb.scorecardresearch.com",
      "www.google-analytics.com",
      "native.propellerclick.com",
      "links.services.disqus.com",
      "cdn.runative-syndicate.com",
      "9anime.to/user/ajax/menu-bar",
      "9anime.ru/user/ajax/menu-bar",
      "d24ak3f2b.top/advertisers.js",
      "d24ak3f2b.top/advertisers.js",
      "invitesuperstitiousadmire.com",
    ];

    const blacklistedFileTypes = [
      "font",
      "json",
      "image",
      "media",
      "script",
      "stylesheet",
    ];

    if (request.isNavigationRequest() && request.redirectChain().length) {
      request.abort();
    }

    if (
      blacklistedDomains.includes(new URL(request.url()).host) ||
      request
        .url()
        .includes("https://staticf.akacdn.ru/assets/min/frontend/all.js")
    ) {
      return request.abort();
    }

    if (
      request.url().includes(WEBSITE_URL) &&
      blacklistedFileTypes.indexOf(request.resourceType()) !== -1
    ) {
      return request.abort();
    }

    return request.continue();
  });

  return { page, browser };
};
