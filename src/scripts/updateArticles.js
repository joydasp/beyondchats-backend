const Article = require("../models/Article");
const {
  getOriginalArticles,
  searchRelatedArticles
} = require("../services/articleService");
const scrapeExternalContent = require("../services/scrapeExternalBlog");
const rewriteWithLLM = require("../services/llmService");

async function updateArticles() {
  const originals = await getOriginalArticles();

  for (const original of originals) {
    console.log("Processing:", original.title);

    // STEP 1: Google search
    const links = await searchRelatedArticles(original.title);
    if (links.length < 2) {
      console.log("Not enough reference articles");
      continue;
    }

    // STEP 2: Scrape external articles
    const ref1 = await scrapeExternalContent(links[0]);
    const ref2 = await scrapeExternalContent(links[1]);

    // STEP 3: LLM rewrite
    const updatedContent = await rewriteWithLLM(
      original.content,
      ref1,
      ref2
    );

    // 🔹 STEP 5: SAVE UPDATED ARTICLE (THIS LINE 👇)
    await Article.create({
      title: original.title,
      content: updatedContent,
      sourceUrl: original.sourceUrl,
      isUpdated: true
    });

    console.log("Updated article saved:", original.title);
  }
}

module.exports = updateArticles;
