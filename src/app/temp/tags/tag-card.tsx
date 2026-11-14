import { QRCodeSVG } from 'qrcode.react'

type Props = {
  tag: { secret: string }
  /** Origin the QR code points to, e.g. https://plantbook.pod.brussels */
  origin: string
}

export function TagCard({ tag, origin }: Props) {
  // The secret goes in the fragment so it never reaches server logs (decision 001).
  const scanUrl = `${origin}/t#${tag.secret}`

  return (
    <figure className="flex flex-col items-center gap-3 border p-4">
      <QRCodeSVG value={scanUrl} size={192} marginSize={2} />
      <figcaption className="break-all text-center text-sm">
        <a href={scanUrl} className="underline">
          {scanUrl}
        </a>
      </figcaption>
    </figure>
  )
}
