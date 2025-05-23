/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { app } from './app';
import config from './config/index';
import { errorLogger, logger } from './shared/logger'; 

process.on('uncaughtException', error => {
  errorLogger.error(error);
  process.exit(1);
});

let server: any;
async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info('DB Connected on Successfully');

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);
    server = app.listen(port, () => {
      logger.info(`App listening on http://${config.base_url}:${config.port}`);
    });
  } catch (error) {
    errorLogger.error(error);
    throw error;
  }

  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error(error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main().catch(err => errorLogger.error(err));

process.on('SIGTERM', () => {
  logger.info('SIGTERM is received');
  if (server) {
    server.close();
  }
});
