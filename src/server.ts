/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { app } from './app';
import config from './config/index';
import { errorLogger, logger } from './shared/logger'; 
import https from 'https';
import http from 'http';
import fs from 'fs';

process.on('uncaughtException', error => {
  errorLogger.error(error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    logger.info('DB Connected Successfully');

    // Load SSL certificates (replace with your own paths if different)
    const sslOptions = {
      key: fs.readFileSync('/etc/ssl/self-signed/selfsigned.key'),
      cert: fs.readFileSync('/etc/ssl/self-signed/selfsigned.crt'),
    };

    const port = 
      typeof config.port === 'number' ? config.port : Number(config.port);

    // Start the HTTPS server
    server = https.createServer(sslOptions, app).listen(port, () => {
      logger.info(`App listening on https://${config.base_url}:${port}`);
    });

    // Optional: Redirect HTTP traffic to HTTPS
    http.createServer((req, res) => {
      res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
      res.end();
    }).listen(80);

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
