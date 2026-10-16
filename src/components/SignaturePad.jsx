import { useEffect, useRef, useState } from 'react'

// Draw-to-sign pad. Stores the signature as a PNG data URL.
export default function SignaturePad({ value, onChange, label }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sig">
      {value ? (
        <div className="sig-preview">
          <img src={value} alt={`${label} signature`} />
          <div className="sig-actions">
            <button type="button" className="link" onClick={() => setOpen(true)}>
              Re-sign
            </button>
            <button type="button" className="link danger" onClick={() => onChange('')}>
              Clear
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn ghost sm" onClick={() => setOpen(true)}>
          ✍︎ Tap to sign
        </button>
      )}
      {open && (
        <SignDialog
          label={label}
          onCancel={() => setOpen(false)}
          onSave={(url) => {
            onChange(url)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}

function SignDialog({ label, onCancel, onSave }) {
  const canvas = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const c = canvas.current
    const ratio = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * ratio
    c.height = rect.height * ratio
    const ctx = c.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#14223f'
  }, [])

  const pos = (e) => {
    const r = canvas.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const down = (e) => {
    e.preventDefault()
    canvas.current.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }
  const move = (e) => {
    if (!drawing.current) return
    const p = pos(e)
    const ctx = canvas.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    setEmpty(false)
  }
  const up = () => {
    drawing.current = false
  }
  const clear = () => {
    const c = canvas.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    setEmpty(true)
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Sign as ${label}`}>
        <h3>Sign as {label}</h3>
        <canvas
          ref={canvas}
          className="sig-canvas"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
        <p className="hint">Sign with your finger or mouse inside the box.</p>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={clear}>
            Clear
          </button>
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn primary" disabled={empty} onClick={() => onSave(canvas.current.toDataURL('image/png'))}>
            Save signature
          </button>
        </div>
      </div>
    </div>
  )
}
