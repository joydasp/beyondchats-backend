const Article = require("../models/Article");
const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetch original BeyondChats articles
 */
async function getOriginalArticles(limit = 5) {
  return await Article.find({ isUpdated: false }).limit(limit);
}

/**
 * Search related articles on Google
 */
async function searchRelatedArticles(title) {
  const query = encodeURIComponent(title);
  const url = `https://www.google.com/search?q=${query}`;

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);
  const links = [];

  $("a").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.startsWith("/url?q=")) {
      const clean = href.split("/url?q=")[1].split("&")[0];
      if (clean.startsWith("http")) {
        links.push(clean);
      }
    }
  });

  return [...new Set(links)].slice(0, 2);
}

/**
 * EXPORT EVERYTHING ONCE
 */
module.exports = {
  getOriginalArticles,
  searchRelatedArticles
};
