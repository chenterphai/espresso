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

// Types
import type { Request, Response } from 'express';

const updateRelease = async (req: Request, res: Response): Promise<void> => {
  const { title, description, tags, status, vote } = req.body;
  try {
    // Get release ID from URL parameters
    const { id } = req.params as { id: string };
    // Validate ID format (assuming MongoDB ObjectId)
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

    const release = await Release.findById(id).select('-__v').exec();

    if (!release) {
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

    if (title) release.title = title;
    if (description) release.description = description;
    if (tags) release.tags = tags;
    if (status) release.status = status;
    if (vote) release.vote = vote;

    await release.save();

    res.status(200).json({
      status: {
        code: 0,
        status: 'OK',
        msg: 'A release updated successfully',
      },
      content: {
        success: true,
        data: release,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 1,
        status: 'Internal server error',
        msg: 'Error while selecting a single release.',
      },
      content: {
        success: false,
        data: null,
      },
    });

    logger.error(`Error while selecting a single release.`, error);
  }
};

export default updateRelease;
