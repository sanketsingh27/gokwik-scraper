import puppeteer from "puppeteer";
import getFlipkartData from "./flipkart_scraper.js";
import getAmazonData from "./amazon_scraper.js";

const scrapeProductData = async (productUrl) => {
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
  const foxtaleData = {
    price: await getFoxtalePrice(page),
    bankOffer: await getFoxtaleTitle(page),
  };

  // TO DO: we will find price too

  const amazonData = await getAmazonData(browser, foxtaleData.foxtaleTitle);
  const flipkartData = await getFlipkartData(browser, foxtaleData.foxtaleTitle);

  console.log("🚀 ~ scrapeProductData ~ getAmazonData:", amazonData);
  console.log("🚀 ~ scrapeProductData ~ getFlipkartData:", flipkartData);

  await browser.close();

  return {
    amazon: amazonData,
    flipkart: flipkartData,
    foxTale: foxtaleData,
  };
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
