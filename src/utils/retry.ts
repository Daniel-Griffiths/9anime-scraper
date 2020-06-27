import { Log } from "./log";
import { sleep } from "./sleep";

/**
 * Retry a method X times, it catches any errors
 * and waits for a specified time before trying again.
 *
 * @param {(...args: any) => Promise<T>} callback
 * @param {{ times: number; delay: number }} options
 * @returns {Promise<T>}
 */
export async function retry<T>(
  callback: (...args: any) => Promise<T>,
  { times, delay }: { times: number; delay: number },
  _retries: number = 0
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    if (_retries < times) {
      Log.warn(
        `Method failed with error "${error.message}", retrying ${
          _retries + 1
        }/${times} times with a delay of ${delay / 1000} seconds`
      );
      await sleep(delay);
      return await retry(callback, { times, delay }, _retries + 1);
    } else {
      throw new Error(error);
    }
  }
}
