import puppeteer from "puppeteer";

const DEFAULT_URL = "https://foxtale.in/collections/summer-essentials/products/glow-sunscreen";

const scrapeProductData = async (productUrl = DEFAULT_URL) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ["--disable-features=site-per-process"],
  });

  await getAmazonData(browser, "SPF 50 Glow Sunscreen");
  //   const page = await browser.newPage();

  //   // Navigate to the product page
  //   await page.goto(productUrl);

  // todo : uncomment
  //   const productTitle = await page.$eval(".product_title", (el) =>
  //     el.textContent.split("\n")[1].trim()
  //   );

  // TO DO: we will find price too

  //   const { amazonPrice, couponn } = await getAmazonData(browser, productTitle);

  //   await browser.close();
  //   return productData;
};

async function getAmazonData(browser, title) {
  const page = await browser.newPage();

  const SESRCH_TERM = `foxtale ${title}`;
  const SEARCH_TERM_ARRAY = SESRCH_TERM.toLowerCase().split(" ");

  // Navigate to Amazon.in
  await page.goto(`https://www.amazon.in/s?k=${SESRCH_TERM}`);

  const searchResults = await page.$$('div[data-component-type="s-search-result"]');

  let productDetailPage;
  for (let index = 0; index < searchResults.length; index++) {
    const result = searchResults[index];
    const { title, dataIndex } = await page.evaluate((el) => {
      const spanElement = el.querySelector("h2 > a > span");
      const title = spanElement ? spanElement.textContent.toLowerCase() : ""; // tital to match
      const dataIndex = el.getAttribute("data-index"); // to target proper item
      return { title, dataIndex };
    }, result);

    if (SEARCH_TERM_ARRAY.every((term) => title.includes(term))) {
      const newPagePromise = getNewPageWhenLoaded(browser);
      const clickSelector = `div[data-index="${dataIndex}"]`;

      page.click(clickSelector);
      const newPage = await newPagePromise;

      const pageTitle = await newPage.title();
      console.log("title :  = = = ", pageTitle);

      break;
    }

    // const { price, coupon } = await productPage(productDetailPage);
  }

  //   await page.close();
}

async function productPage(page) {
  console.log("product detail page = ", page);
  const pageTitle = await page.title();
  console.log("product page titile = ", pageTitle);

  //   scraping o
}

const getNewPageWhenLoaded = async (browser) => {
  return new Promise((x) =>
    browser.on("targetcreated", async (target) => {
      if (target.type() === "page") {
        const newPage = await target.page();
        const newPagePromise = new Promise((y) =>
          newPage.once("domcontentloaded", () => y(newPage))
        );
        const isPageLoaded = await newPage.evaluate(() => document.readyState);
        return isPageLoaded.match("complete|interactive") ? x(newPage) : x(newPagePromise);
      }
    })
  );
};

export default scrapeProductData;
