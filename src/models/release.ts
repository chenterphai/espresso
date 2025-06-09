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

import { Schema, model } from 'mongoose';

export interface IRelease {
  title: string;
  description: string;
  tags: string[];
  status: 'public' | 'private';
}

const releaseSchema = new Schema<IRelease>(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      maxlength: [200, 'Title must be less than 200 chars.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
    },
    tags: {
      type: [String],
      required: [true, 'Status is required.'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['public', 'private'],
        message: 'Status is invalid.',
      },
      default: 'public',
    },
  },
  {
    timestamps: true,
  },
);

export default model<IRelease>('Release', releaseSchema);
