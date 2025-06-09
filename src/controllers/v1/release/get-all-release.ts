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

// Custom module
import { logger } from '../../../lib/winston.ts';

// Models
import Release from '../../../models/release.ts';

// Types
import type { Request, Response } from 'express';

const getAllRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const skip = (page - 1) * size;

    // Validate pagination parameters
    if (page < 1 || size < 1) {
      logger.warn('Invalid pagination parameters', { page, size });
      res.status(400).json({
        status: {
          code: 1,
          status: 'Bad Request',
          msg: 'Page and size must be positive integers',
        },
        content: {
          success: false,
          data: null,
        },
      });
      return;
    }

    // Query total count and releases in parallel
    const [total, releases] = await Promise.all([
      Release.countDocuments(),
      Release.find()
        .select('-__v')
        .skip(skip)
        .limit(size)
        .where({ status: 'public' })
        .sort({ createdAt: 'desc' })
        .lean(), // .exec() isn't needed because await handles query execution within `Promise.all`
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / size);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log successful operation
    logger.info('Fetched releases successfully', {
      page,
      size,
      total,
      returned: releases.length,
    });

    // Return paginated response
    res.status(200).json({
      status: {
        code: 0,
        status: 'OK',
        msg: 'Release selected successfully.',
      },
      content: {
        success: true,
        data: releases,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: size,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 1,
        status: 'Internal server error',
        msg: 'Internal server error',
      },
    });
    logger.error(`Error while selecting releases: `, error);
  }
};

export default getAllRelease;
