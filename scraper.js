import puppeteer from "puppeteer";
const DEFAULT_URL =
  "https://foxtale.in/collections/summer-essentials/products/glow-sunscreen";

const scrapeProductData = async (productUrl = DEFAULT_URL) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the product page
  await page.goto(productUrl);

  const productData = {
    price: await extractPrice(page),
    title: await extractTitle(page),
  };

  await browser.close();
  return productData;
};

async function extractPrice(page) {
  try {
    // Find the price element on the page
    const priceElement = await page.$eval(
      ".t4s-product-price",
      (el) => el.textContent
    );
    return priceElement.trim();
  } catch (error) {
    console.error("Error extracting price:", error);
    return "N/A";
  }
}

async function extractTitle(page) {
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
