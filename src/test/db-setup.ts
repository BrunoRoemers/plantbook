import { reset } from 'drizzle-seed'
import { afterAll, beforeEach } from 'vitest'

import { db, pool } from '@/db'
import * as schema from '@/db/schema'

// Runs in each db test file's worker: every test starts with empty tables, and
// the worker's pool closes when the file is done.
beforeEach(() => reset(db, schema))
afterAll(() => pool.end())
