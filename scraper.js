import puppeteer from "puppeteer";

const DEFAULT_URL =
  "https://foxtale.in/collections/summer-essentials/products/glow-sunscreen";

const scrapeProductData = async (productUrl = DEFAULT_URL) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  // Navigate to the product page
  await page.goto(productUrl);

  const foxtalePrice = await extractPrice(page);
  const foxtaleTitle = await extractTitle(page);

  // get amazon price and coupon
  const amazonPrice = await getAmazonData(browser, foxtaleTitle);

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

async function getAmazonData(browser, title) {
  console.log("getAmazonData", { title });
  const page = await browser.newPage();

  // Navigate to Amazon.in
  await page.goto("https://www.amazon.in");

  await page.setDefaultNavigationTimeout(0);

  // Type the title into the search input and submit the form
  await page.type("#twotabsearchtextbox", `foxtale ${title}`);

  // click the search btn and wait for the result
  const promiseAll = await Promise.all([
    page.click("#nav-search-submit-button"),
    // page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  console.log("PROMISE value = ", promiseAll);

  const searchResults = await page.$$(".s-result-item");

  const itemToClick = searchResults.find(async (el) => {
    try {
      title = await page.evaluate(
        (el) => el.querySelector("h2 > a > span").textContent
      );
      console.log(title);
      if (title.indexof("foxtale") && title.indexof(title)) return el;
    } catch (err) {
      console.log("no title found for this element");
      console.log(err);
    }
  });

  console.log("ITEM TO CHECK = = = ", itemToClick);

  // Wait for the search results to load
  const results = await page.$eval(
    'div[data-component-type="s-search-result"]'
  );

  console.log({ results });
  // Select the div element with the specified attributes
  //   const resultDiv = await page.$(
  //     'div[data-component-type="s-search-result"][data-index="7"]'
  //   );

  //   console.log({ resultDiv });

  // Click on the div element to open a new page in a new tab
  //   const newPagePromise = new Promise((resolve) =>
  //     browser.once("targetcreated", resolve)
  //   );
  //   await resultDiv.click({ button: "middle" });
  //   const newTarget = await newPagePromise;
  //   console.log({ newTarget });
  //   const newPage = await newTarget.page();

  // Extract the product data
  //   const price =
  //     (await newPage.$eval(".a-offscreen", (el) => el.textContent)) ?? // offer price
  //     (await newPage.$eval(".a-price-whole", (el) => el.textContent)); // whole price

  console.log("AMAZON PRICE = ", price);
  return price;
}

export default scrapeProductData;
