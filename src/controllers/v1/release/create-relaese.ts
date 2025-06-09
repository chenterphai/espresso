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
import type { IRelease } from '../../../models/release.ts';
type ReleaseData = Pick<IRelease, 'title' | 'description' | 'status' | 'tags'>;

const createRelease = async (req: Request, res: Response): Promise<void> => {
  const { title, description, status, tags } = req.body as ReleaseData;
  try {
    const newRelease = await Release.create({
      title,
      description,
      status,
      tags,
    });

    res.status(201).json({
      status: {
        code: 0,
        status: 'Created',
        msg: 'Release created successfully.',
      },
      content: {
        data: newRelease,
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
    logger.error(`Error while creating release: `, error);
  }
};

export default createRelease;
