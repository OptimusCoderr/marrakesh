import { PARTS, ALL_SECTIONS } from './schema'

const KEY = 'cluuf-daily-reports-v1'

export function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function loadAll() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

export function saveAll(reports) {
  try {
    localStorage.setItem(KEY, JSON.stringify(reports))
    return true
  } catch {
    return false
  }
}

export function sortedReports(reports) {
  return Object.values(reports).sort((a, b) => {
    const da = a.values?.site?.[2] || ''
    const db = b.values?.site?.[2] || ''
    if (da !== db) return db.localeCompare(da)
    return (b.createdAt || 0) - (a.createdAt || 0)
  })
}

// "DSR-009" -> "DSR-010", "12 / 60" -> "13 / 60", "7" -> "8"
function increment(value) {
  if (!value) return ''
  const m = String(value).match(/^(\D*)(\d+)(.*)$/)
  if (!m) return value
  const [, pre, num, rest] = m
  const next = String(parseInt(num, 10) + 1).padStart(num.length, '0')
  return pre + next + rest
}

const BLOCKS = ALL_SECTIONS.flatMap((s) => s.blocks)

export function newReport(previous) {
  const values = { site: [] }
  values.site[2] = todayISO()

  if (previous) {
    const pv = previous.values || {}
    const siteBlock = BLOCKS.find((b) => b.id === 'site')
    siteBlock.rows.forEach((row, i) => {
      if (row.carry === true) values.site[i] = pv.site?.[i] ?? ''
      if (row.carry === 'increment') values.site[i] = increment(pv.site?.[i])
    })
    // Same hours as yesterday is the usual case.
    values.site[6] = pv.site?.[6] ?? ''

    for (const b of BLOCKS) {
      if (b.carry) values[b.id] = structuredClone(pv[b.id] ?? [])
    }

    // Yesterday's plan for tomorrow becomes today's plan.
    const plan = (pv.tomorrow || [])
      .map((r) => [r?.[0], r?.[1]].filter(Boolean).join(' – '))
      .filter(Boolean)
    if (plan.length) values.progress = [plan.join('\n')]
  }

  const now = Date.now()
  return { id: uid(), createdAt: now, updatedAt: now, values }
}

// ---- completeness ------------------------------------------------------

function filled(v) {
  if (v == null) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'number') return true
  if (Array.isArray(v)) return v.some(filled)
  if (typeof v === 'object') return Object.values(v).some(filled)
  return false
}

export function sectionFilled(section, values) {
  return section.blocks.some((b) => filled(values?.[b.id]))
}

export function completion(values, stage) {
  const required = PARTS.flatMap((p) =>
    p.sections.filter((s) => p.id !== 'D' || s.stage === stage),
  )
  const done = required.filter((s) => sectionFilled(s, values)).length
  return { done, total: required.length }
}

// ---- backup ------------------------------------------------------------

export function downloadJSON(reports) {
  const blob = new Blob([JSON.stringify({ app: 'cluuf-daily-report', version: 1, reports }, null, 2)], {
    type: 'application/json',
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `cluuf-site-reports-${todayISO()}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export async function readBackup(file) {
  const data = JSON.parse(await file.text())
  const reports = data?.reports
  if (!reports || typeof reports !== 'object') throw new Error('Not a site report backup file')
  return reports
}
