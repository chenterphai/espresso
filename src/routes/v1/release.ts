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
import validationError from '../../middlewares/validation-error.ts';

// Node Module
import { Router } from 'express';
import { body } from 'express-validator';

// Controller
import createRelease from '../../controllers/v1/release/create-relaese.ts';
import getAllRelease from '../../controllers/v1/release/get-all-release.ts';
import getSingleReplease from '../../controllers/v1/release/get-single-release.ts';
import updateRelease from '../../controllers/v1/release/update-release.ts';
import deleteRelease from '../../controllers/v1/release/delete-release.ts';

const router = Router();

router.post(
  '/',
  body('title')
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 200 chars.'),
  body('description').notEmpty().withMessage('Description is required.'),
  body('tags').notEmpty().withMessage('Tags is required.'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['public', 'private'])
    .withMessage('Status is invalid.'),
  validationError,
  createRelease,
);

router.get('/', getAllRelease);
router.get('/:id', getSingleReplease);
router.put('/:id', validationError, updateRelease);
router.delete('/:id', validationError, deleteRelease);

export default router;
