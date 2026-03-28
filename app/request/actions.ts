'use server'

import {
  encryptWithSeederKey,
  encryptWithServerKey,
  type SeederEncryptedValue,
  type ServerEncryptedValue,
} from '@/lib/crypto'
import { getGitHubRepo, getGitHubToken } from '@/lib/env'
import { createGitHubCommitService } from '@/lib/github'
import { getNextTrayNumber } from '@/lib/trays'
import { randomUUID } from 'crypto'
import { z } from 'zod'

/*
 * Validation schema
 */

const CURRENCIES = ['EUR', 'CHT'] as const

const RequestTrayInput = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  cells: z.array(z.string().min(1)).length(12, 'All 12 cells must be filled'),
  contribution_amount: z.coerce.number().min(0, 'Amount must be 0 or more'),
  contribution_currency: z.enum(CURRENCIES),
  message: z.string().max(1000).optional(),
})
type RequestTrayInput = z.infer<typeof RequestTrayInput>

/*
 * Action result
 */

export type ValidationErrorNode = { errors: string[] }

export type ValidationErrors = ValidationErrorNode & {
  properties?: { [K in keyof RequestTrayInput]?: ValidationErrorNode }
}

export type RequestTrayState =
  | {
      success: false
      validationErrors?: ValidationErrors
      message?: string
    }
  | {
      success: true
      trayNumber: number
      trayUrl: string
    }

/*
 * Server action
 */

export async function requestTray(
  _prev: RequestTrayState | null,
  formData: FormData
): Promise<RequestTrayState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    cells: Array.from({ length: 12 }, (_, i) => formData.get(`cell-${i}`)),
    contribution_amount: formData.get('contribution_amount'),
    contribution_currency: formData.get('contribution_currency'),
    message: formData.get('message') || undefined,
  }

  const parsed = RequestTrayInput.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      validationErrors: z.treeifyError(parsed.error),
    }
  }

  const input = parsed.data

  try {
    const trayNumber = getNextTrayNumber()

    /* Encrypt sensitive fields */
    const encryptedEmail = encryptWithServerKey(input.email)
    const encryptedSeederSecret = encryptWithSeederKey(randomUUID())
    const encryptedNurturerSecret = encryptWithServerKey(randomUUID())

    /* Build markdown */
    const now = new Date().toISOString()
    const markdown = buildTrayMarkdown({
      number: trayNumber,
      nurturer_name: input.name,
      nurturer_email: encryptedEmail,
      seeder_secret: encryptedSeederSecret,
      nurturer_secret: encryptedNurturerSecret,
      contribution_amount: input.contribution_amount,
      contribution_currency: input.contribution_currency,
      cells: input.cells,
      created_at: now,
      message: input.message,
    })

    /* Commit to GitHub */
    const dirName = String(trayNumber).padStart(3, '0')
    const filePath = `content/trays/${dirName}/index.md`

    const git = createGitHubCommitService({
      token: getGitHubToken(),
      repo: getGitHubRepo(),
    })

    await git.commitFiles({
      files: [{ path: filePath, content: markdown }],
      message: `Add tray #${trayNumber} for ${input.name}`,
    })

    return {
      success: true,
      trayNumber,
      trayUrl: `/trays/${trayNumber}`,
    }
  } catch (error) {
    console.error('Failed to create tray:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    }
  }
}

/*
 * Markdown builder
 */

function buildTrayMarkdown(fields: {
  number: number
  nurturer_name: string
  nurturer_email: ServerEncryptedValue
  seeder_secret: SeederEncryptedValue
  nurturer_secret: ServerEncryptedValue
  contribution_amount: number
  contribution_currency: string
  cells: string[]
  created_at: string
  message?: string
}): string {
  const cellsYaml = fields.cells.map((c) => `  - ${c}`).join('\n')
  const dateLabel = new Date(fields.created_at).toISOString().slice(0, 10)

  const body = fields.message?.trim() ? fields.message.trim() : `Tray requested!`

  return `---
number: ${fields.number}
nurturer_name: ${fields.nurturer_name}
nurturer_email: '${fields.nurturer_email}'
seeder_secret: '${fields.seeder_secret}'
nurturer_secret: '${fields.nurturer_secret}'
contribution_amount: ${fields.contribution_amount}
contribution_currency: ${fields.contribution_currency}
cells_per_row: 6
cells:
${cellsYaml}
created_at: ${fields.created_at}
---

## Day 0 — Seeds Requested

_Posted by nurturer on ${dateLabel}_

${body}
`
}
