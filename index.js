import express from "express";
import scrapeProductData from "./scraper.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.post("/product", async (req, res) => {
  const { productUrl } = req.body;
  const productData = await scrapeProductData(productUrl);
  const bestPrice = getBestPrice(productData);
  const offers = productData.offers;
  res.render("product", { bestPrice, offers });
});

app.listen(port, async () => {
  const productData = await scrapeProductData();
  console.log(JSON.stringify(productData, 2, null));
  console.log("Server is up on port " + port);
});
