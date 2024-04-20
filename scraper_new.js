import puppeteer from "puppeteer";

const DEFAULT_URL = "https://foxtale.in/collections/summer-essentials/products/glow-sunscreen";

const scrapeProductData = async (productUrl = DEFAULT_URL) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ["--disable-features=site-per-process"],
  });
  const page = await browser.newPage();

  // Navigate to the product page
  await page.goto(productUrl);

  const productTitle = await page.$eval(".product_title", (el) =>
    el.textContent.split("\n")[1].trim()
  );
  console.log("Product Title:", productTitle);
  // TO DO: we will find price too

  //   const { amazonPrice, couponn } = await getAmazonData(browser, productTitle);
  await getAmazonData(browser, productTitle);

  //   await browser.close();
  //   return productData;
};

async function getAmazonData(browser, title) {
  const page = await browser.newPage();

  // Navigate to Amazon.in
  await page.goto(`https://www.amazon.in/s?k=foxtale+${title}`);

  // Part 1: Select all elements with data-component-type="s-search-result"
  const searchResults = await page.$$eval(
    'div[data-component-type="s-search-result"]',
    (results) => results
  );

  console.log("searchResults = ", searchResults);

  // Part 2: Find element which contains 'foxtale and title '
  const elementToClick = searchResults.find(async (result) => {
    const elementTitle = await page.evaluate((html) => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      const spanElement = temp.querySelector("h2 > a > span");
      return spanElement ? spanElement.textContent : "";
    }, result);

    return elementTitle.includes("foxtale") && elementTitle.includes(title);
  });

  console.log("ELEMENT to click =  = ", elementToClick);

  await elementToClick.click();

  //   await page.close();
}

export default scrapeProductData;
