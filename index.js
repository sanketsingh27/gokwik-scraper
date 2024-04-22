import express from "express";
import cors from "cors";
import scrapeProductData from "./scraper.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.post("/api/product-data", async (req, res) => {
  const { searchkey } = req.body;
  if (!searchkey) {
    return res.status(400).send("Missing Parameter: searchkey");
  }

  try {
    const scrapedData = await scrapeProductData(searchkey);
    return res.status(200).send(scrapedData);
  } catch (error) {
    console.log(error);
    res.send(`Error occured while scraping data ${error}`);
  }
});

app.listen(port, async () => {
  console.log("Server is up on port " + port);
});
