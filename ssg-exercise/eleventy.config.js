/*
  eleventy.config.js - CSE 134B HW5 Part 4
  Author: Christos-Iason Enotiadis
  Builds index.html and about.html from src/ into _site/, with the shared
  footer in src/_includes/footer.njk.
*/

export default function (eleventyConfig) {
  // assets - copied to _site as they are
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/docs");

  // output names - about.html stays about.html, so relative links keep working
  eleventyConfig.addGlobalData("permalink", function () {
    return function (data) {
      return `${data.page.filePathStem}.html`;
    };
  });
}

export const config = {
  dir: {
    input: "src",
    includes: "_includes",
    output: "_site"
  },
  // html pages - nunjucks, so {% include %} works
  htmlTemplateEngine: "njk"
};
