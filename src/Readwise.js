import fetch from 'node-fetch';

/**
 * A client for interacting with the Readwise API.
 */
export default class Readwise {
  static BASE_URL = 'https://readwise.io/api/v2';

  /*
   * `Readwise` constructor
   * @param token - Readwise access token
   */
  constructor(token) {
    this.token = token;
  }

  /**
   * Authenticate a readwise access token. If the request is successful
   * (i.e status 204), return a new `Readwise` instance.
   * @param {string} token - Readwise access token
   * @returns {Promise} Client
   */
  static async auth(token) {
    const response = await fetch(`${Readwise.BASE_URL}/auth`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (response.status === 204) {
      return new Readwise(token);
    } else {
      throw new Error('Invalid Readwise Access Token.');
    }
  }

  /**
   * Get all books from Readwise.
   * @param None
   * @returns {Promise}
   */
  async getBooks() {
    // Initial request
    let data = await this.request(
      `${Readwise.BASE_URL}/books?page_size=1000`
    );

    // No books
    if (!data.results) {
      return [];
    }

    // If we don't need to paginate, return data on the first page
    if (data.next === null) {
      return data.results;
    }

    // Return collected results from each page
    return await this.paginate(data);
  }

  /**
   * Get all highlights from a single book.
   * @param {Number} id - Book ID
   * @returns {Promise}
   */
  async getHighlightsByBook(id) {
    // Initial request
    let data = await this.request(
      `${Readwise.BASE_URL}/highlights?book_id=${id}&page_size=1000`
    );

    // No highlights
    if (!data.results) {
      return [];
    }

    // If we don't need to paginate, return data on the first page
    if (data.next === null) {
      return data.results;
    }

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
      if (data.next === null) {
        break;
      }

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
    return await (
      await fetch(url, {
        headers: {
          Authorization: `Token ${this.token}`,
          ...options,
        },
      })
    ).json();
  }
}
