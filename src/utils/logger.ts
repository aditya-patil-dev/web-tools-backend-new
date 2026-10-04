import winston from 'winston';

const { combine, timestamp, printf } = winston.format;
const logFormat = printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Add file transports only in local non-production environment
if (process.env.NODE_ENV !== 'production') {
  try {
    const fs = require('fs');
    const winstonDaily = require('winston-daily-rotate-file');
    const logDir = __dirname + '/../logs';

    if (!fs.existsSync(logDir + '/info')) {
      fs.mkdirSync(logDir + '/info', { recursive: true });
    }
    if (!fs.existsSync(logDir + '/error')) {
      fs.mkdirSync(logDir + '/error', { recursive: true });
    }

    transports.push(
      new winstonDaily({
        level: 'info',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/info',
        filename: `%DATE%.log`,
        maxFiles: 30,
        json: false,
        zippedArchive: true,
      }),
      new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error',
        filename: `%DATE%.error.log`,
        maxFiles: 30,
        json: false,
        zippedArchive: true,
      }),
    );
  } catch (e) {
    // Ignore file transport initialization errors
  }
}

const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat
  ),
  transports,
});

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };
