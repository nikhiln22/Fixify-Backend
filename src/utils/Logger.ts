import fs from 'fs';
import path from 'path';
import { createLogger, format, transports, Logger } from 'winston';

class AppLogger {
  private logger: Logger;

  constructor() {
    const logDir = path.join(__dirname, '../../logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    this.logger = createLogger({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
      },
      level: 'http',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDir, 'combined.log') }),
      ],
    });
  }

 
  public getLogger(): Logger {
    return this.logger;
  }
}


export default new AppLogger().getLogger();
