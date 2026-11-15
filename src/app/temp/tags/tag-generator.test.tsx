import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { TagGenerator } from './tag-generator'

const SECRET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCD'

vi.mock('./actions', () => ({ generateUnsafeTag: vi.fn(async () => SECRET) }))

afterEach(cleanup)

async function renderWithOneTag() {
  const result = render(<TagGenerator detectedOrigin="http://192.168.1.20:3000" storedSecretLength={24} />)
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))
  await screen.findByRole('link')
  return result
}

const href = () => screen.getByRole('link').getAttribute('href')
const version = () => Number(screen.getByText('Version', { selector: 'dt' }).nextElementSibling?.textContent)

test('defaults to the agreed format: pb.pod.brussels, uppercase, 24 chars, H', async () => {
  await renderWithOneTag()

  expect(href()).toBe(`HTTPS://PB.POD.BRUSSELS/T/${SECRET.slice(0, 24)}`)
  expect((screen.getByRole('checkbox', { name: 'Uppercase' }) as HTMLInputElement).checked).toBe(true)
  expect((screen.getByRole('radio', { name: /^H/ }) as HTMLInputElement).checked).toBe(true)
  expect(version()).toBe(4)
})

test('the URL root, uppercase and secret length apply to every QR code', async () => {
  await renderWithOneTag()

  fireEvent.click(screen.getByRole('radio', { name: /detected/i }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Uppercase' }))
  fireEvent.change(screen.getByRole('slider', { name: /secret length/i }), {
    target: { value: '30' },
  })
  expect(href()).toBe(`http://192.168.1.20:3000/t/${SECRET.slice(0, 30).toLowerCase()}`)

  fireEvent.click(screen.getByRole('radio', { name: 'plantbook.pod.brussels' }))
  expect(href()).toBe(`https://plantbook.pod.brussels/t/${SECRET.slice(0, 30).toLowerCase()}`)
})

test('the size slider and error correction switcher apply to every QR code', async () => {
  const { container } = await renderWithOneTag()

  fireEvent.change(screen.getByRole('slider', { name: /size/i }), {
    target: { value: '3.5' },
  })
  expect(container.querySelector('svg')?.style.width).toBe('3.5cm')

  const versionH = version()
  fireEvent.click(screen.getByRole('radio', { name: /^L/ }))
  expect(version()).toBeLessThan(versionH)
})
