import dedent from 'dedent-js';

/*
 * Build a Highlights page
 * @param {Object} book
 * @param {Array} highlights
 * @returns {string}
 */
export const buildPage = (book, highlights) => {
  let ret = dedent(`
    ## ${book.title}

    ![${book.title}](${book.cover_image_url})

    ### Metadata

    - Author: ${book.author}
    - Full Title: ${book.title}
    - Category: #${book.category}
  `);

  // Append highlights
  ret += '\n\n### Highlights\n\n';
  highlights.forEach((highlight) => {
    ret += `- ${highlight.text} ([Location ${highlight.location}](https://readwise.io/to_kindle?action=open&asin=${book.asin}&location=${highlight.location}))\n\n`;
  });

  return ret;
};

/*
 * Sleep for for `msec` milliseconds
 * @param {Number} msec
 * @returns {Promise}
 */
export const sleep = async (msec) => {
  return new Promise((resolve) => setTimeout(resolve, msec));
};
