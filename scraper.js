import puppeteer from "puppeteer";
import getFlipkartData from "./flipkart_scraper.js";
import getAmazonData from "./amazon_scraper.js";

const DEFAULT_URL = "https://foxtale.in/collections/summer-essentials/products/glow-sunscreen";

const scrapeProductData = async (productUrl = DEFAULT_URL) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ["--disable-features=site-per-process", "--start-maximized"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(24 * 60 * 60 * 1000);

  // Navigate to the product page
  await page.goto(productUrl);

  // get product title from foxtale.com
  const { foxtalePrice, foxtaleTitle } = {
    foxtalePrice: await getFoxtalePrice(page),
    foxtaleTitle: await getFoxtaleTitle(page),
  };

  // TO DO: we will find price too

  const { amazonPrice, amazonBankOffer } = await getAmazonData(browser, foxtaleTitle);
  const { flipkartPrice, flipkartBankOffer } = await getFlipkartData(browser, foxtaleTitle);

  console.log("🚀 ~ scrapeProductData ~ getAmazonData:", { amazonPrice, amazonBankOffer });
  console.log("🚀 ~ scrapeProductData ~ getFlipkartData:", { flipkartPrice, flipkartBankOffer });

  await browser.close();
};

async function getFoxtalePrice(page) {
  try {
    // Find the price element on the page
    const priceElement = await page.$eval(".t4s-product-price", (el) => el.textContent);
    return priceElement.trim();
  } catch (error) {
    console.error("Error extracting price:", error);
    return "N/A";
  }
}

async function getFoxtaleTitle(page) {
  try {
    // Find the title element on the page
    const title = await page.$eval(".product_title", (el) => el.textContent);
    return title.split("\n")[1].trim();
  } catch (error) {
    console.error("Error extracting title:", error);
    return "N/A";
  }
}

export default scrapeProductData;
