'use client'

import { requestTray, type RequestTrayState, type ValidationErrors } from '@/app/request/actions'
import { EggCarton } from '@/components/egg-carton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_SEED_COLOR, type Seed } from '@/lib/seed-types'
import Link from 'next/link'
import { useActionState, useState } from 'react'

type RequestFormProps = {
  seeds: Seed[]
}

const CURRENCIES = ['EUR', 'CHT'] as const
const CELL_COUNT = 12

function fieldErrors(
  tree: ValidationErrors | undefined,
  field: NonNullable<ValidationErrors['properties']> extends infer P ? keyof P : never
): string[] | undefined {
  return tree?.properties?.[field]?.errors
}

export function RequestForm({ seeds }: RequestFormProps) {
  const [state, formAction, pending] = useActionState<RequestTrayState | null, FormData>(
    requestTray,
    null
  )
  const [cells, setCells] = useState<string[]>(Array(CELL_COUNT).fill(''))

  const seedMap = new Map(seeds.map((s) => [s.slug, s]))
  const allFilled = cells.every((c) => c !== '')
  const ve = state && !state.success ? state.validationErrors : undefined

  if (state?.success) {
    return <Confirmation trayNumber={state.trayNumber} trayUrl={state.trayUrl} />
  }

  return (
    <form action={formAction} className="space-y-8">
      {state && !state.success && (state.message || ve?.errors.length) && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {[state.message, ve?.errors].filter(Boolean).map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      {/* Name & Email */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" error={fieldErrors(ve, 'name')}>
          <Input name="name" required placeholder="Alice" />
        </Field>
        <Field label="Email" error={fieldErrors(ve, 'email')}>
          <Input name="email" type="email" required placeholder="alice@example.com" />
        </Field>
      </div>

      {/* Seed selection grid */}
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Choose seeds for each cell</legend>
        {fieldErrors(ve, 'cells') && (
          <p className="mb-2 text-xs text-destructive">{fieldErrors(ve, 'cells')![0]}</p>
        )}
        <div className="grid grid-cols-6 gap-2">
          {cells.map((slug, i) => (
            <CellSelector
              key={i}
              index={i}
              value={slug}
              seeds={seeds}
              onChange={(val) => {
                const next = [...cells]
                next[i] = val
                setCells(next)
              }}
            />
          ))}
        </div>
      </fieldset>

      {/* Live preview */}
      {allFilled && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Preview</p>
          <EggCarton cells={cells} cellsPerRow={6} seedMap={seedMap} size="md" />
        </div>
      )}

      {/* Contribution */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Contribution (pay what you want)"
          error={fieldErrors(ve, 'contribution_amount')}
        >
          <Input
            name="contribution_amount"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={1}
          />
        </Field>
        <Field label="Currency" error={fieldErrors(ve, 'contribution_currency')}>
          <select
            name="contribution_currency"
            defaultValue="CHT"
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c === 'EUR' ? 'EUR (Euro)' : 'CHT (Commons Hub Token)'}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Message */}
      <Field label="Message (optional)">
        <Textarea
          name="message"
          rows={3}
          placeholder="Tell the seeder about your garden plans..."
        />
      </Field>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Requesting...' : 'Request tray'}
      </Button>
    </form>
  )
}

/*
 * Cell selector — compact native select for one egg carton cell
 */

function CellSelector({
  index,
  value,
  seeds,
  onChange,
}: {
  index: number
  value: string
  seeds: Seed[]
  onChange: (val: string) => void
}) {
  const seed = seeds.find((s) => s.slug === value)
  const bgColor = seed?.color ?? (value ? DEFAULT_SEED_COLOR : undefined)

  return (
    <div className="relative">
      <select
        name={`cell-${index}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="h-11 w-full cursor-pointer appearance-none rounded-md border border-border bg-card px-1 text-center text-[0.6rem] font-medium leading-tight text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <option value="" disabled>
          +
        </option>
        {seeds.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  )
}

/*
 * Confirmation shown after successful submission
 */

function Confirmation({ trayNumber, trayUrl }: { trayNumber: number; trayUrl: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="text-5xl">🌱</div>
      <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">
        Tray #{trayNumber} requested!
      </h2>
      <p className="mt-3 max-w-md text-muted-foreground">
        Your request has been submitted. Take a deep breath... The seeder will prepare your tray and
        get back to you in a few days.
      </p>
      <Link
        href={trayUrl}
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        View your tray
      </Link>
    </div>
  )
}

/*
 * Form field wrapper
 */

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string[]
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  )
}
