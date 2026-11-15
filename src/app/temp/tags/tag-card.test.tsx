import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { TagCard } from './tag-card'

afterEach(cleanup)

const stat = (term: string) => screen.getByText(term, { selector: 'dt' }).nextElementSibling?.textContent

const secret = 'Q7VD2KXO9LMZA1RTYP3FWG8HJ4NC6BE5UISX0TKV'
const props = {
  secret,
  origin: 'https://pb.pod.brussels',
  sizeCm: 2,
  level: 'H',
  secretLength: 24,
  uppercase: true,
} as const

test('links to /t/<secret> cut to the chosen length, drawn at the chosen physical size', () => {
  const { container } = render(<TagCard {...props} />)

  expect(screen.getByRole('link').getAttribute('href')).toBe('HTTPS://PB.POD.BRUSSELS/T/Q7VD2KXO9LMZA1RTYP3FWG8H')
  expect(container.querySelector('svg')?.style.width).toBe('2cm')
})

test('lowercase writes the whole URL in lowercase: base36 is case-insensitive', () => {
  render(<TagCard {...props} uppercase={false} />)

  expect(screen.getByRole('link').getAttribute('href')).toBe('https://pb.pod.brussels/t/q7vd2kxo9lmza1rtyp3fwg8h')
})

test('24 chars uppercase at H is version 4; one more char tips it to version 5', () => {
  const { rerender } = render(<TagCard {...props} />)
  expect(stat('Version')).toBe('4')
  expect(stat('Grid')).toBe('33 x 33')
  // Plus a 2-module border on each side: 20 mm / 37.
  expect(stat('Module')).toBe('0.54 mm')
  expect(stat('URL')).toBe('50 chars')

  rerender(<TagCard {...props} secretLength={25} />)
  expect(stat('Version')).toBe('5')
})
