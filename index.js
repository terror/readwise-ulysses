import dotenv from 'dotenv';
import Readwise from './src/Readwise.js';
import Ulysses from './src/Ulysses.js';
import { buildPage, capitalize, sleep } from './src/Utilities.js';

/*
 * Run the application
 * @param {string} token - Readwise access token
 */
const run = async (token) => {
  // Authenticate a `Readwise` instance
  const readwise = await Readwise.auth(token);

  // Authenticate a `Ulysses` instance
  const ulysses = await Ulysses.auth();

  // Fetch all books from Readwise
  const books = await readwise.getBooks();

  // Create the top-level group if it does not exist
  const root = await ulysses.findOrCreateGroup(
    { id: '/Readwise' },
    { name: 'Readwise' }
  );

  // Create all child groups
  for (const book of books) {
    // Get highlights correspondant to the current book
    const highlights = await readwise.getHighlightsByBook(book.id);

    // Create child group if it does not exist
    const group = await ulysses.findOrCreateGroup(
      { id: `/Readwise/${capitalize(book.category)}` },
      { name: capitalize(book.category), parent: root.id }
    );

    // If the root was found, we need to go through
    // and re-create all `Highlight` pages
    if (root.found) {
      for (const container of JSON.parse(root.item).containers) {
        for (const sheet of container.sheets) {
          // A highlight sheet has the same name as the
          // corresponding book
          if (sheet.title === book.title) {
            // Trash it
            await ulysses.trash({
              id: sheet.identifier,
            });
            // Create it
            await ulysses.createSheet({
              name: 'Highlights',
              group: group.targetId,
              text: buildPage(book, highlights)
            });
          }
        }
      }
    } else {
      await ulysses.createSheet({
        name: 'Highlights',
        group: group.targetId,
        text: buildPage(book, highlights),
      });
    }

    // Hack: Readwise rate limit
    await sleep(5000);
  }
};

/**
 * Program entrypoint
 */
const main = async () => {
  dotenv.config();
  try {
    await run(process.env.ACCESS_TOKEN);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

main();
