'use client'

import type { QRCodeErrorCorrectionLevel } from 'qrcode'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'

import { generateUnsafeTag } from './actions'
import { TagCard } from './tag-card'

// Dev secrets come at this length; the slider shows a prefix.
const MAX_SECRET_LENGTH = 40

const PB = 'https://pb.pod.brussels'
const ROOTS = ['https://plantbook.pod.brussels', PB]

const LEVELS: { level: QRCodeErrorCorrectionLevel; label: string }[] = [
  { level: 'L', label: 'L (7%)' },
  { level: 'M', label: 'M (15%)' },
  { level: 'Q', label: 'Q (25%)' },
  { level: 'H', label: 'H (30%)' },
]

type Props = {
  detectedOrigin: string
  /** The agreed secret length: the slider's default and what the db stores. */
  storedSecretLength: number
}

export function TagGenerator({ detectedOrigin, storedSecretLength }: Props) {
  const [secrets, setSecrets] = useState<string[]>([])
  const [pending, startTransition] = useTransition()
  const [origin, setOrigin] = useState(PB)
  const [sizeCm, setSizeCm] = useState(2)
  const [secretLength, setSecretLength] = useState(storedSecretLength)
  const [level, setLevel] = useState<QRCodeErrorCorrectionLevel>('H')
  const [uppercase, setUppercase] = useState(true)

  function generate() {
    startTransition(async () => {
      const secret = await generateUnsafeTag(secrets.length + 1, MAX_SECRET_LENGTH)
      setSecrets((current) => [...current, secret])
    })
  }

  const origins = [
    {
      label: `Detected (${new URL(detectedOrigin).host})`,
      value: detectedOrigin,
    },
    ...ROOTS.map((root) => ({ label: new URL(root).host, value: root })),
  ]

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-[22rem_1fr] md:items-start">
      <div className="flex flex-col gap-4 md:sticky md:top-4">
        <fieldset className="flex flex-col gap-3 border p-4 text-sm">
          <label className="flex flex-col gap-1">
            <span>Size: {sizeCm.toFixed(1)} cm square, border included</span>
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={sizeCm}
              onChange={(e) => setSizeCm(Number(e.target.value))}
            />
            <span className="text-xs text-gray-500">On screen, cm is approximate; print to check the real size.</span>
          </label>

          <div role="radiogroup" aria-label="URL root" className="flex flex-col gap-1">
            <span>URL root</span>
            {origins.map((o) => (
              <label key={o.value} className="flex items-center gap-2">
                <input type="radio" name="origin" checked={origin === o.value} onChange={() => setOrigin(o.value)} />
                {o.label}
              </label>
            ))}
          </div>

          <label className="flex flex-col gap-1">
            <span>
              Secret length: {secretLength} chars base36, {(secretLength * Math.log2(36)).toFixed(2)} bits
            </span>
            <input
              type="range"
              min={8}
              max={MAX_SECRET_LENGTH}
              value={secretLength}
              onChange={(e) => setSecretLength(Number(e.target.value))}
            />
            <span className="text-xs text-gray-500">
              Only the {storedSecretLength}-char secret is stored in the db.
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
            Uppercase
          </label>

          <div role="radiogroup" aria-label="Error correction" className="flex flex-col gap-1">
            <span>Error correction</span>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {LEVELS.map((l) => (
                <label key={l.level} className="flex items-center gap-1 whitespace-nowrap">
                  <input type="radio" name="level" checked={level === l.level} onChange={() => setLevel(l.level)} />
                  {l.label}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
        <Button onClick={generate} disabled={pending}>
          Generate Tag
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
        {secrets.map((secret) => (
          <TagCard
            key={secret}
            secret={secret}
            secretLength={secretLength}
            origin={origin}
            sizeCm={sizeCm}
            level={level}
            uppercase={uppercase}
          />
        ))}
      </div>
    </div>
  )
}
