import { retry } from "../utils/retry";

/**
 * Retry a method X times, it catches any errors
 * and waits for a specified time before trying again.
 *
 * @param {{ times: number; delay: number }} options
 * @returns {void}
 */
export function Retry(options: { times: number; delay: number }) {
  return (
    _target: Object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const previousFunction = descriptor.value;

    descriptor.value = async function () {
      return await retry(
        async () => previousFunction.apply(this, arguments),
        options
      );
    };
  };
}
