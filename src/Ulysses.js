import { Callback } from './Callback.js';

/**
 * A client for interacting with Ulysses via x-callback-url.
 */
export default class Ulysses {
  static SCHEME = 'ulysses';
  static APP_NAME = 'readwise-ulysses';

  /**
   * `Ulysses` constructor
   * @param token - Application authorization token
   */
  constructor(token) {
    this.token = token;
    this.client = Callback(Ulysses.SCHEME);
  }

  /**
   * Authorize a new `Ulysses` instance
   * @param {Object} options - Action parameters
   * @returns {Object} A new authorized `Ulysses` instance
   */
  static async auth(options = { appname: Ulysses.APP_NAME }) {
    return new Ulysses(
      JSON.parse(await Callback(Ulysses.SCHEME).call('authorize', options))[
        'access-token'
      ]
    );
  }

  /*
   * Get a new item from Ulysses (sheet or group)
   * @param options - Action parameters
   * @returns {Object}
   */
  async getItem(options) {
    return JSON.parse(await this.exec('get-item', options));
  }

  /*
   * Create a new Ulysses group
   * @param options - Action parameters
   * @returns {Object}
   */
  async createGroup(options) {
    return JSON.parse(await this.exec('new-group', options));
  }

  /*
   * Create a new Ulysses sheet
   * @param options - Action parameters
   * @returns {Object}
   */
  async createSheet(options) {
    return JSON.parse(await this.exec('new-sheet', options));
  }

  /*
   * Create a new Ulysses group or return the one that already exists
   * @param a - `get-item` action options
   * @param b - `new-group` action options
   * @returns {Object}
   */
  async findOrCreateGroup(a, b) {
    try {
      const item = await this.getItem(a);
      item.found = true;
      return item;
    } catch {
      return await this.createGroup(b);
    }
  }

  /*
   * Trash a Ulysses item
   * @param options - Action parameters
   * @returns {Object}
   */
  async trash(options) {
    return JSON.parse(await this.exec('trash', options));
  }

  /**
   * Execute an action with options
   * @param action - Action to execute
   * @param options - Action parameters
   * @returns {Promise} Response
   */
  async exec(action, options = {}) {
    return await this.client.call(action, {
      ...options,
      'silent-mode': 'YES',
      'access-token': this.token,
    });
  }
}
