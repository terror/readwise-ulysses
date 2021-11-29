import dotenv from 'dotenv';
import fetch from 'node-fetch';
import xcall from 'xcall';

/**
 * A client for interacting with Ulysses via x-callback-url.
 */
class UlyssesClient {
  static SCHEME = 'ulysses';
  static APP_NAME = 'readwise-ulysses';

  /**
   * `UlyssesClient` constructor
   * @param token - Application authorization token
   */
  constructor(token) {
    this.token = token;
    this.client = new xcall(UlyssesClient.SCHEME);
  }

  /**
   * Authorize a new `UlyssesClient` instance
   * @param {Object} options - Action parameters
   * @returns {Object} A new authorized `UlyssesClient` instance
   */
  static async auth(options) {
    return new UlyssesClient(
      JSON.parse(
        await new xcall(UlyssesClient.SCHEME).call('authorize', options)
      )['access-token']
    );
  }

  /**
   * Execute an action with options
   * @param action - Action to execute
   * @param options - Action parameters
   * @returns {Promise} Response
   */
  async exec(action, options = {}) {
    return await this.client.call(action, options);
  }
}

/**
 * A client for interacting with the Readwise API.
 */
class ReadwiseClient {
  static BASE_URL = 'https://readwise.io/api/v2';

  /*
   * `ReadwiseClient` constructor
   * @param token - Readwise access token
   */
  constructor(token) {
    this.token = token;
  }

  /**
   * Authenticate a readwise access token. If the request is successful
   * (i.e status 204), return a new `ReadwiseClient` instance.
   * @param {string} token - Readwise access token
   * @returns {Promise} Client
   */
  static async auth(token) {
    const response = await fetch(`${ReadwiseClient.BASE_URL}/auth`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (response.status === 204) {
      return new ReadwiseClient(token);
    } else {
      throw new Error('Invalid Readwise Access Token.');
    }
  }

  /**
   * Get a all books from Readwise.
   * @param None
   * @returns {Promise}
   */
  async getBooks() {
    // Initial request
    let data = await this.request(
      `${ReadwiseClient.BASE_URL}/books?page_size=1000`
    );
    // If we don't need to paginate, return data on the first page
    if (data.next === null) return [...data.results];
    // Return collected results from each page
    return await this.paginate(data);
  }

  /**
   * Grab all highlights from a single book given a url.
   * @param {string} url
   * @returns {Promise}
   */
  async getBookHighlights(url) {
    // Initial request
    let data = await this.request(`${url}/highlights?page_size=1000`);
    // If we don't need to paginate, return data on the first page
    if (data.next === null) return [...data.results];
    // Return collected results from each page
    return await this.paginate(data);
  }

  /**
   * Collect results from remaining pages
   * @param {object} data
   * @returns {Promise}
   */
  async paginate(data) {
    const ret = [];
    // Collect results on each page
    while (true) {
      // Collect results on this page
      ret.push(...data.results);
      // If there's no next page, break
      if (data.next === null) break;
      // Fetch data on the next page
      data = await this.request(data.next);
    }
    return ret;
  }

  /*
   * Perform a signed request to the Readwise API.
   * @param {string} url - Request endpoint
   * @param {Object} options - Request options
   * @returns {Object} Response data as JSON
   */
  async request(url, options = {}) {
    return fetch(url, {
      headers: { Authorization: `Token ${this.token}`, ...options },
    }).then((res) => res.json());
  }
}

/*
 * Run the application
 * @param {string} token - Readwise access token
 */
const run = async (token) => {
  // Authenticate a `ReadwiseClient` instance
  const readwiseClient = await ReadwiseClient.auth(token);

  // Authenticate a `UlyssesClient` instance
  const ulyssesClient = await UlyssesClient.auth({
    appname: UlyssesClient.APP_NAME,
  });

  // Create the top-level group
  const root = JSON.parse(
    await ulyssesClient.exec('new-group', { name: 'Literature' })
  );

  // Fetch all books from Readwise
  const books = await readwiseClient.getBooks();

  // Create child groups
  books.forEach(async (book) => {
    const group = JSON.parse(
      await ulyssesClient.exec('new-group', {
        name: book.title,
        parent: root.id,
      })
    );
  });
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
