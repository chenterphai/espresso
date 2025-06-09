// Copyright 2025 chenterphai
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

// Custom Module
import { logger } from '../../../lib/winston.ts';

// Models
import Release from '../../../models/release.ts';

// Typea
import type { Request, Response } from 'express';

const deleteRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('Invalid release ID format', { id });
      res.status(400).json({
        status: {
          code: 1,
          status: 'Bed Request',
          msg: 'Invalid release ID format',
        },
        content: {
          success: false,
          data: null,
        },
      });
      return;
    }

    const release = await Release.findById(id);
    if (!release) {
      logger.error(`Release not found`);
      res.status(404).json({
        status: {
          code: 1,
          status: 'Not Found',
          msg: 'Release not found',
        },
        content: {
          success: false,
          data: null,
        },
      });
      return;
    }

    await Release.deleteOne({ _id: id });

    logger.info(`A release has been deleted`);

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      status: {
        code: 1,
        status: 'Internal server error',
        msg: 'Error while deleting a single release.',
      },
      content: {
        success: false,
        data: null,
      },
    });

    logger.error(`Error while deleting a single release.`, error);
  }
};

export default deleteRelease;
