import { DateTime } from "luxon";

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
  eleventyConfig.addWatchTarget("src/assets/css");
  eleventyConfig.addFilter("date", (value, format = "yyyy") => {
    const dateTime = (() => {
      if (value === "now" || value === undefined || value === null) {
        return DateTime.now();
      }

      if (value instanceof Date) {
        return DateTime.fromJSDate(value);
      }

      if (typeof value === "number") {
        return DateTime.fromMillis(value);
      }

      const parsed = new Date(value);
      if (!Number.isNaN(parsed.valueOf())) {
        return DateTime.fromJSDate(parsed);
      }

      return DateTime.invalid("Invalid Date");
    })();

    if (!dateTime.isValid) {
      return value;
    }

    try {
      return dateTime.toFormat(format);
    } catch {
      return dateTime.toISO();
    }
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "11ty.js"]
  };
}
