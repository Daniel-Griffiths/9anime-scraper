import chalk from "chalk";

enum LogType {
  warn = "warn",
  info = "info",
  error = "error",
  muted = "muted",
  success = "success",
}

export class Log {
  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static basic(message: string): typeof Log {
    console.log(message);
    return Log;
  }

  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static success(message: string): typeof Log {
    return Log.message(LogType.success, `⭐ ${message}`);
  }

  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static warn(message: string): typeof Log {
    return Log.message(LogType.warn, `⚠️ ${message}`);
  }

  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static info(message: string): typeof Log {
    return Log.message(LogType.info, message);
  }

  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static muted(message: string): typeof Log {
    return Log.message(LogType.muted, message);
  }

  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static error(message: string): typeof Log {
    return Log.message(LogType.error, `${message}`);
  }

  /**
   * @param {string} key
   * @returns {typeof Log}
   */
  public static time(key: string): typeof Log {
    console.time(key);
    return Log;
  }

  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static timeEnd(message: string): typeof Log {
    console.timeEnd(message);
    return Log;
  }

  /**
   * @param {string} message
   * @returns {typeof Log}
   */
  public static group(message: string): typeof Log {
    console.group(message);
    return Log;
  }

  /**
   * @returns {typeof Log}
   */
  public static groupEnd(): typeof Log {
    console.groupEnd();
    return Log;
  }

  /**
   * Sends a coloured console message
   *
   * @param {LogType} type success, error, warn
   * @param {string} message the message to be pushed
   * @return {typeof Log}
   */
  public static message(type: LogType, message: string): typeof Log {
    let output = "";

    switch (type) {
      case LogType.warn:
        output = chalk.yellow(message);
        break;
      case LogType.error:
        output = chalk.red(message);
        break;
      case LogType.info:
        output = chalk.cyan(message);
        break;
      case LogType.muted:
        output = chalk.gray(message);
        break;
      default:
        output = chalk.green(message);
        break;
    }

    console.log(output);

    return Log;
  }
}
