import QRCode, { type QRCodeErrorCorrectionLevel } from 'qrcode'

type Props = {
  /** Uppercase base36, case-insensitive. The QR code holds its first secretLength chars. */
  secret: string
  secretLength: number
  /** Origin the QR code points to, e.g. https://pb.pod.brussels */
  origin: string
  /** Printed side length, border included. */
  sizeCm: number
  level: QRCodeErrorCorrectionLevel
  /** Capitalise the whole URL, so it fits QR's denser alphanumeric mode. */
  uppercase: boolean
}

// Quiet zone around the code, in modules. The spec says 4; most phones cope with 2.
const BORDER = 2

export function TagCard({ secret, secretLength, origin, sizeCm, level, uppercase }: Props) {
  const url = `${origin}/t/${secret.slice(0, secretLength)}`
  const scanUrl = uppercase ? url.toUpperCase() : url.toLowerCase()
  const qr = QRCode.create(scanUrl, { errorCorrectionLevel: level })
  const modules = qr.modules.size
  const side = modules + 2 * BORDER

  let path = ''
  for (let y = 0; y < modules; y++)
    for (let x = 0; x < modules; x++) if (qr.modules.get(y, x)) path += `M${x + BORDER} ${y + BORDER}h1v1h-1z`

  const stats = [
    ['Version', qr.version],
    ['Grid', `${modules} x ${modules}`],
    ['Module', `${((sizeCm * 10) / side).toFixed(2)} mm`],
    ['URL', `${scanUrl.length} chars`],
  ]

  return (
    <figure className="flex flex-col items-center gap-3 border p-4">
      <svg
        viewBox={`0 0 ${side} ${side}`}
        style={{ width: `${sizeCm}cm`, height: `${sizeCm}cm` }}
        shapeRendering="crispEdges"
        role="img"
        aria-label="QR code"
      >
        <rect width={side} height={side} fill="#fff" />
        <path d={path} fill="#000" />
      </svg>
      <figcaption className="flex w-full flex-col gap-3 text-center">
        <dl className="grid grid-cols-4 gap-2">
          {stats.map(([term, value]) => (
            <div key={term} className="flex flex-col">
              <dt className="text-xs text-muted-foreground">{term}</dt>
              <dd className="whitespace-nowrap text-sm font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <a href={scanUrl} className="break-all text-sm underline">
          {scanUrl}
        </a>
      </figcaption>
    </figure>
  )
}
