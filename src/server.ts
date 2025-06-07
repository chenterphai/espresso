// Copyright 2025 chen
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

import config from './config/index.ts';
import limiter from './lib/rate-limit.ts';

import v1Routes from './routes/v1/index.ts';
import { connectToDatabase, disconnectFromDatabase } from './lib/mongoose.ts';
import { logger } from './lib/winston.ts';

const app = express();

// CORS Configuration
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS Error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS Error: ${origin} is not allowed by CORS`);
    }
  },
};

app.use(cors(corsOptions));

// Enable JSON request body parsing
app.use(express.json());

// Enable URL-encoded request body parsing with extended mode
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // Only compress responses larger than 1KB
  }),
);

// Use Helmet to enhance security by setting various HTTP headers
app.use(helmet());

// Apply rate limiting
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();

    app.use('/api/v1', v1Routes);
    app.listen(config.PORT, () => {
      logger.info(`Server running http://localhost:${config.PORT}`, {});
    });
  } catch (error) {
    logger.error(error);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();

    logger.info(`Server SHUTDOWN!`);
    process.exit(0);
  } catch (error) {
    logger.warn(`Error during server shutdown.`, error);
  }
};

/**
 * Listens for termination signals (`SIGTERM` and `SIGINT`).
 *
 * - `SIGTERM` is typically sent when stopping a process (e.g. `kill` command or container shutdown).
 * - `SIGINT` is triggerd when the user interrupts the process (e.g. processing `Ctrl + C`)
 * - When either signal is received, `handleServerShutdown` is executed to ensure proper cleanup.
 */

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
