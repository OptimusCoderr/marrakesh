import { useLayoutEffect, useRef } from 'react'
import { STAGES } from '../schema'

export function AutoTextarea({ value, onChange, rows = 2, ...rest }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 2 + 'px'
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export function Chips({ options, value, onChange, label }) {
  return (
    <div className="chips" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          className={'chip' + (value === o ? ' on' : '') + chipTone(o)}
          onClick={() => onChange(value === o ? '' : o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function chipTone(o) {
  if (['Yes', 'Done'].includes(o)) return ' good'
  if (['No', 'Stopped', 'Delayed'].includes(o)) return ' bad'
  if (['At risk', 'Ongoing'].includes(o)) return ' warn'
  return ''
}

// One input, chosen by `kind`. Used by every table and field in the form.
export function Field({ kind = 'text', value, onChange, options, placeholder, label, rows, computed }) {
  const v = value ?? ''
  switch (kind) {
    case 'textarea':
      return <AutoTextarea value={v} onChange={onChange} rows={rows || 2} placeholder={placeholder} aria-label={label} />
    case 'number':
    case 'percent':
    case 'money':
      return (
        <div className={'affix' + (kind === 'percent' ? ' pct' : '')}>
          <input
            type="text"
            inputMode="decimal"
            value={v}
            placeholder={computed ? `${computed} (auto)` : placeholder}
            aria-label={label}
            onChange={(e) => onChange(e.target.value)}
          />
          {kind === 'percent' && <span>%</span>}
        </div>
      )
    case 'date':
      return <input type="date" value={v} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    case 'datetime':
      return <input type="datetime-local" value={v} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    case 'timerange': {
      const [a = '', b = ''] = String(v).split('|')
      const set = (x, y) => onChange(x || y ? `${x}|${y}` : '')
      return (
        <div className="timerange">
          <input type="time" value={a} onChange={(e) => set(e.target.value, b)} aria-label="Start time" />
          <span>to</span>
          <input type="time" value={b} onChange={(e) => set(a, e.target.value)} aria-label="End time" />
        </div>
      )
    }
    case 'select':
      if (options.length <= 4) return <Chips options={options} value={v} onChange={onChange} label={label} />
      return (
        <select value={v} onChange={(e) => onChange(e.target.value)} aria-label={label}>
          <option value="">—</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )
    case 'stage':
      return (
        <select value={v} onChange={(e) => onChange(e.target.value)} aria-label={label}>
          <option value="">Select the stage you are working in…</option>
          {STAGES.map((s, i) => (
            <option key={s} value={String(i + 1)}>
              Stage {i + 1}: {s}
            </option>
          ))}
        </select>
      )
    default:
      return (
        <input type="text" value={v} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(e.target.value)} />
      )
  }
}
