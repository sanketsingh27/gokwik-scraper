import { getNewPageWhenLoaded } from "./utils.js";

async function getFlipkartData(browser, title) {
  console.log(" ====== Flipkart ====== ");
  console.log("🚀 ~ getFlipkartData ~ title:", title);
  const page = await browser.newPage();
  page.setDefaultTimeout(24 * 60 * 60 * 1000);

  const SESRCH_STRING = `foxtale ${title}&augment=false`;

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

  const flipkartData = await flipkartProductPage(productDetailPage);

  await page.close();
  return flipkartData;
}

async function flipkartProductPage(page) {
  // console.log("🚀 ~ flipkartProductPage ~ page:", Object.keys(page).length > 0);

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

export default getFlipkartData;
