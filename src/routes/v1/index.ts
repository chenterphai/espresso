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

import { Router } from 'express';
import authRoutes from '../v1/auth.ts';
import userRoutes from '../v1/user.ts';
import releaseRoutes from '../v1/release.ts';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: {
      code: 0,
      status: 'Success',
      msg: 'Successfully',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/release', releaseRoutes);

export default router;
