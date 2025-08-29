import morgan, { StreamOptions } from "morgan";
import Logger from "../utils/Logger";
import { RequestHandler } from "express";
import config from "../config/env";

class LoggerMiddleware {
  private stream: StreamOptions;

  constructor() {
    this.stream = {
      write: (message: string) => {
        Logger.http(message.trim());
      },
    };
  }

  public getMiddleware(): RequestHandler {
    const isDevelopment = config.NODE_ENV === "development";

    console.log(`Logger initialized - Environment: ${config.NODE_ENV}`);

    if (isDevelopment) {
      return morgan("dev", { stream: this.stream });
    } else {
      return morgan("combined", { stream: this.stream });
    }
  }

  public getCustomMiddleware(): RequestHandler {
    const customFormat =
      ":method :url :status :response-time ms - :res[content-length]";
    return morgan(customFormat, { stream: this.stream });
  }

  public getCleanMiddleware(): RequestHandler {
    return morgan("dev", {
      stream: this.stream,
      skip: (req) => {
        return (
          req.url.includes(".css") ||
          req.url.includes(".js") ||
          req.url.includes(".ico") ||
          req.url.includes("/health")
        );
      },
    });
  }
}

export default new LoggerMiddleware();
