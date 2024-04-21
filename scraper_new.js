import puppeteer from "puppeteer";

const DEFAULT_URL = "https://foxtale.in/collections/summer-essentials/products/glow-sunscreen";

const scrapeProductData = async (productUrl = DEFAULT_URL) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ["--disable-features=site-per-process", "--start-maximized"],
  });

  //   await getAmazonData(browser, "SPF 50 Glow Sunscreen");
  await getFlipkartData(browser, "SPF 70 Matte Finish Sunscreen");
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
  console.log(" ====== Amazon ====== ");
  console.log("🚀 ~ getAmazonData ~ title:", title);
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

      productDetailPage = await newPagePromise;
      break;
    }
  }

  const { price: amazonPrice, bankOffer: amazonBankOffer } = await amazonProductPage(
    productDetailPage
  );

  await page.close();
  return { amazonPrice, amazonBankOffer };
}

async function amazonProductPage(page) {
  console.log("🚀 ~ amazonProductPage ~ page:", Object.keys(page).length > 0);

  // run this in parallal
  const price = await extractPriceFromAmazon(page);
  const bankOffer = await extractBankOfferFromAmazon(page);

  console.log("🚀 ~ productPage ~  { price, bankOffer }:", { price, bankOffer });
  return { price, bankOffer };
  //   TODO : scraping coupon
}

async function extractPriceFromAmazon(page) {
  try {
    // Find the price element on the page
    const priceElement = await page.$eval(".a-offscreen", (el) => el.textContent);
    console.log("🚀 ~ extractPriceFromAmazon ~ priceElement:", priceElement);
    return priceElement.trim();
  } catch (error) {
    console.error("Error extracting price:", error);
    return "N/A";
  }
}

async function extractBankOfferFromAmazon(page) {
  try {
    // Find the copupon element on the page
    const bankOffer = await page.$eval(
      "#itembox-InstantBankDiscount > span > div > span > span.a-truncate-full.a-offscreen",
      (el) => el.textContent
    );
    console.log("🚀 ~ extractBankOfferFromAmazon ~ bankOffer:", bankOffer);

    return bankOffer ? bankOffer.trim() : "N/A";
  } catch (error) {
    console.error("Error extracting price:", error);
    return "N/A";
  }
}

async function getFlipkartData(browser, title) {
  console.log(" ====== Flipkart ====== ");
  console.log("🚀 ~ getFlipkartData ~ title:", title);
  const page = await browser.newPage();

  const SESRCH_STRING = `foxtale ${title}&augment=false`;
  const SEARCH_TERM_ARRAY = SESRCH_STRING.toLowerCase().split(" ");

  // Navigate to Flipkart
  await page.goto(`https://www.flipkart.com/search?q=${SESRCH_STRING}`);

  const searchResults = await page.$$(".slAVV4");
  console.log("🚀 ~ getFlipkartData ~ searchResults:", searchResults.length);

  let productDetailPage;
  for (let index = 0; index < searchResults.length; index++) {
    const result = searchResults[index];
    console.log("🚀 ~ getFlipkartData ~ Inside For ~ result:", result);

    const { title, dataIndex } = await page.evaluate((el) => {
      const title = el.querySelector(".wjcEIp").getAttribute("title").toLowerCase() || "";
      const dataIndex = el.getAttribute("data-tkid"); // to target proper item for click
      return { title, dataIndex };
    }, result);
    console.log("🚀 ~ { title, dataIndex }: of data = ", {
      title,
      dataIndex,
    });

    if (title.includes("foxtale")) {
      const newPagePromise = getNewPageWhenLoaded(browser);

      const clickSelector = `div[data-tkid="${dataIndex}"]`;
      console.log("🚀 ~ getFlipkartData ~ clickSelector:", clickSelector);
      page.click(clickSelector);

      productDetailPage = await newPagePromise;
      break;
    }
  }

  const { price: flipkartPrice, bankOffer: flipkartBankOffer } = await flipkartProductPage(
    productDetailPage
  );

  //   await page.close();
  //   return { amazonPrice, amazonBankOffer };
}

async function flipkartProductPage(page) {
  console.log("🚀 ~ flipkartProductPage ~ page:", Object.keys(page).length > 0);

  // run this in parallal
  const price = await extractPriceFromFlipkart(page);
  const bankOffer = await extractBankOfferFromFlipkart(page);

  console.log("🚀 ~ productPage ~  { price, bankOffer }:", { price, bankOffer });
  return { price, bankOffer };
  //   TODO : scraping coupon
}

async function extractPriceFromFlipkart(page) {
  try {
    // Find the price element on the page
    const price = await page.$eval("div.Nx9bqj.CxhGGd", (el) => el.textContent);
    console.log("🚀 ~ extractPriceFromFlipkart ~ price:", price);

    return price.trim();
  } catch (error) {
    console.error("Error extracting price:", error);
    return "N/A";
  }
}

async function extractBankOfferFromFlipkart(page) {
  try {
    // Find the copupon element on the page
    return await page.evaluate(() => {
      const listItems = document.querySelectorAll(".kF1Ml8");
      for (const item of listItems) {
        const spans = item.querySelectorAll("span");
        if (spans.length > 1 && spans[0].textContent.includes("Bank Offer")) {
          return spans[1].textContent;
        }
      }
      return "N/A"; // Return null if not found
    });
  } catch (error) {
    console.error("Error extracting price:", error);
    return "N/A";
  }
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
