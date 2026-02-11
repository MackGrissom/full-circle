import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "projects");

const sites = [
  { name: "executive-leaderboard", url: "https://www.executiveleaderboard.com" },
  { name: "soulpunx", url: "https://www.soulpunx.net" },
  { name: "tutorboost", url: "https://tutorboost.org" },
  { name: "simplyai", url: "https://simplyai.pro" },
  { name: "dock-appeal", url: "https://dockappeal.myshopify.com" },
  { name: "empower-advocacy", url: "https://empoweradvocacy.netlify.app" },
];

async function run() {
  const browser = await puppeteer.launch({ headless: true });

  for (const site of sites) {
    console.log(`Capturing ${site.name} (${site.url})...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
      await page.goto(site.url, { waitUntil: "networkidle2", timeout: 20000 });
      // Wait a beat for animations / lazy images
      await new Promise((r) => setTimeout(r, 2000));
      await page.screenshot({
        path: path.join(outDir, `${site.name}.webp`),
        type: "webp",
        quality: 85,
      });
      console.log(`  -> saved ${site.name}.webp`);
    } catch (err) {
      console.error(`  -> FAILED ${site.name}: ${err.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log("Done!");
}

run();
