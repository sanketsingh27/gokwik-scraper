import { getNewPageWhenLoaded } from "./utils.js";

async function getFoxtaleData(browser, searchkey) {
  console.log(" ====== Foxtale ====== ");
  console.log("🚀 ~ getFoxtaleData ~ searchkey:", searchkey);

  const SEARCH_TERM_ARRAY = searchkey.toLowerCase().split(/[\s-]+/);
  console.log("🚀 ~ getFoxtaleData ~ SEARCH_TERM_ARRAY:", SEARCH_TERM_ARRAY);

  const page = await browser.newPage();
  page.setDefaultTimeout(24 * 60 * 60 * 1000);

  // Navigate to foxtale.in
  await page.goto(`https://foxtale.in/search?type=product&q=${searchkey}`);

  const searchResults = await page.$$("div.t4s-product-info.product-info");

  //   let productDetailPage;

  for (let index = 0; index < searchResults.length; index++) {
    const result = searchResults[index];

    const { title, dataIndex } = await page.evaluate((el) => {
      const titleElement = el.querySelector("h3.product-title");
      const title = titleElement ? titleElement.textContent.toLowerCase() : "";
      const dataIndex = el.getAttribute("data-pr-id"); // to target proper item

      return { title, dataIndex };
    }, result);

    if (SEARCH_TERM_ARRAY.every((term) => title.indexOf(term) !== -1)) {
      console.log("🚀 ~ inside");
      const newPagePromise = getNewPageWhenLoaded(browser);
      console.log("🚀 ~ getFoxtaleData ~ newPagePromise:", newPagePromise);

      const clickSelector = `h3.product-title a`;
      console.log({ clickSelector });
      await page.click(clickSelector);

      //   productDetailPage = await newPagePromise;

      break;
    }
  }

  await page.waitForSelector("[data-pr-price]");

  const foxtaleData = {
    price: await getFoxtalePrice(page),
    title: await getFoxtaleTitle(page),
    bankOffer: "N/A",
  };
  console.log("🚀 ~ getFoxtaleData ~ foxtaleData:", foxtaleData);
  return foxtaleData;
}

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

export default getFoxtaleData;
