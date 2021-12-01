import exec from 'promised-exec';
import querystring from 'querystring';

/*
 * A lightweight x-callback-url client builder
 * @param {string} scheme
 * @returns {Object}
 */
export const Callback = function (scheme) {
  const binary = `${process.cwd()}/bin/xcall.app/Contents/MacOS/xcall`;
  return {
    call: (action, params) => {
      return exec(
        `${binary} -url "${scheme}://x-callback-url/${action}?${querystring.stringify(
          params
        )}"`
      );
    },
  };
};
