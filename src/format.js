import { STAGES } from './schema'

export function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtLongDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function fmtDateTime(v) {
  if (!v) return ''
  const [date, time] = v.split('T')
  return [fmtDate(date), time].filter(Boolean).join(', ')
}

export function stageLabel(v) {
  const n = parseInt(v, 10)
  return n >= 1 && n <= STAGES.length ? `Stage ${n}: ${STAGES[n - 1]}` : ''
}

// Turns a stored value into display text for the printed report.
export function display(kind, v) {
  if (v == null || v === '') return ''
  switch (kind) {
    case 'date':
      return fmtDate(v)
    case 'timerange': {
      const [a = '', b = ''] = String(v).split('|')
      return a || b ? `${a || '—'} – ${b || '—'}` : ''
    }
    case 'stage':
      return stageLabel(v)
    case 'percent':
      return `${v}%`
    default:
      return String(v)
  }
}

export function num(v) {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function sumCol(rows, ci) {
  return (rows || []).reduce((t, r) => t + num(r?.[ci]), 0)
}

export function overallProgress(values) {
  const rows = values?.tracker || []
  const pcts = STAGES.map((_, i) => num(rows[i]?.[2]))
  if (!pcts.some((p) => p > 0)) return ''
  return String(Math.round(pcts.reduce((a, b) => a + b, 0) / STAGES.length))
}
