'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'

import { generateUnsafeTag } from './actions'
import { TagCard } from './tag-card'

export function TagGenerator({ origin }: { origin: string }) {
  const [tags, setTags] = useState<{ secret: string }[]>([{secret: '3nebV4aj0mql6PPW7oh2-g'}])
  const [pending, startTransition] = useTransition()

  function generate() {
    startTransition(async () => {
      const tag = await generateUnsafeTag(tags.length + 1)
      setTags((current) => [...current, tag])
    })
  }

  return (
    <>
      {tags.map((tag) => (
        <TagCard key={tag.secret} tag={tag} origin={origin} />
      ))}
      <Button onClick={generate} disabled={pending}>
        Generate Next Tag
      </Button>
    </>
  )
}
