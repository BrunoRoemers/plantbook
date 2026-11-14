import { headers } from 'next/headers'
import { Suspense } from 'react'

import { TagGenerator } from './tag-generator'

// Temporary page to kick off development: generates dev tags 1, 2, 3... with deterministic secrets.
export default function TempTagsPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Unsafe Tags</h1>
      <Suspense>
        <Tags />
      </Suspense>
    </main>
  )
}

async function Tags() {
  // Point the QR code at whichever host served this page (localhost, LAN IP, preview).
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'

  return <TagGenerator origin={`${proto}://${host}`} />
}
