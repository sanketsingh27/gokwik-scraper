import { getNewPageWhenLoaded } from "./utils.js";
async function getAmazonData(browser, title) {
  console.log(" ====== Amazon ====== ");
  console.log("🚀 ~ getAmazonData ~ title:", title);
  const page = await browser.newPage();
  page.setDefaultTimeout(24 * 60 * 60 * 1000);

  const SESRCH_TERM = `foxtale ${title}`;
  const SEARCH_TERM_ARRAY = SESRCH_TERM.toLowerCase().split(" ");

  // Navigate to Amazon.in
  await page.goto(`https://www.amazon.in/s?k=${SESRCH_TERM}`);

  const searchResults = await page.$$('div[data-component-type="s-search-result"]');
  console.log("🚀 ~ getAmazonData ~ searchResults:", searchResults.length);

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

export default getAmazonData;
