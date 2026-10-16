import { useEffect, useMemo, useRef, useState } from 'react'
import { PARTS, STAGES, currentStage } from './schema'
import { loadAll, saveAll, newReport, sortedReports, sectionFilled, completion, downloadJSON, readBackup } from './storage'
import { fmtLongDate, fmtDate } from './format'
import FormBlock from './components/FormBlocks'
import PrintReport from './components/PrintReport'

const CURRENT_KEY = 'cluuf-current-report'

function initialState() {
  let reports = loadAll()
  let current = null
  try {
    current = localStorage.getItem(CURRENT_KEY)
  } catch {}
  if (!reports[current]) {
    const list = sortedReports(reports)
    if (list.length) current = list[0].id
    else {
      const r = newReport()
      reports = { [r.id]: r }
      current = r.id
    }
  }
  return { reports, current }
}

export default function App() {
  const [{ reports, current }, setState] = useState(initialState)
  const [view, setView] = useState('edit')
  const [drawer, setDrawer] = useState(null) // 'reports' | 'nav' | null
  const [saved, setSaved] = useState(true)
  const [toast, setToast] = useState('')
  const report = reports[current]
  const values = report.values
  const stage = currentStage(values)

  // Persist (debounced) whenever reports change.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaved(false)
    const t = setTimeout(() => {
      const ok = saveAll(reports)
      setSaved(ok ? true : 'error')
    }, 400)
    return () => clearTimeout(t)
  }, [reports])

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_KEY, current)
    } catch {}
  }, [current])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const setValue = (blockId, v) =>
    setState((s) => {
      const r = s.reports[s.current]
      return {
        ...s,
        reports: { ...s.reports, [s.current]: { ...r, updatedAt: Date.now(), values: { ...r.values, [blockId]: v } } },
      }
    })

  const createReport = () => {
    const latest = sortedReports(reports)[0]
    const r = newReport(latest)
    setState({ reports: { ...reports, [r.id]: r }, current: r.id })
    setDrawer(null)
    setView('edit')
    window.scrollTo({ top: 0 })
    setToast(latest ? 'New report started. Site details, stage tracker and stock carried over.' : 'New report started.')
  }

  const deleteReport = (id) => {
    const r = reports[id]
    const name = `${r.values?.site?.[0] || 'Untitled'} – ${fmtDate(r.values?.site?.[2]) || 'no date'}`
    if (!window.confirm(`Delete the report "${name}"? This cannot be undone.`)) return
    const rest = { ...reports }
    delete rest[id]
    let next = current
    if (id === current) {
      const list = sortedReports(rest)
      if (list.length) next = list[0].id
      else {
        const n = newReport()
        rest[n.id] = n
        next = n.id
      }
    }
    setState({ reports: rest, current: next })
  }

  const exportPdf = () => {
    const prev = document.title
    const proj = (values.site?.[0] || 'Site').replace(/[\\/:*?"<>|]+/g, '-')
    const no = values.site?.[3] ? ` #${values.site[3]}` : ''
    document.title = `Daily Site Report – ${proj}${no} – ${values.site?.[2] || ''}`
    const restore = () => {
      document.title = prev
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
  }

  const restore = async (file) => {
    try {
      const incoming = await readBackup(file)
      const n = Object.keys(incoming).length
      setState((s) => ({ ...s, reports: { ...s.reports, ...incoming } }))
      setToast(`Restored ${n} report${n === 1 ? '' : 's'}.`)
    } catch (e) {
      setToast(e.message || 'Could not read that file.')
    }
  }

  const { done, total } = completion(values, stage)
  const pct = Math.round((done / total) * 100)

  return (
    <>
      <div className="app">
        <header className="topbar">
          <button className="icon-btn menu" aria-label="Sections" onClick={() => setDrawer(drawer === 'nav' ? null : 'nav')}>
            ☰
          </button>
          <div className="brand">
            <span className="mark">C</span>
            <div>
              <div className="brand-name">CLUUF</div>
              <div className="brand-sub">Daily Site Report</div>
            </div>
          </div>
          <button className="report-switch" onClick={() => setDrawer(drawer === 'reports' ? null : 'reports')}>
            <span className="rs-date">{fmtDate(values.site?.[2]) || 'No date'}</span>
            <span className="rs-meta">
              {values.site?.[0] || 'Untitled project'}
              {values.site?.[3] ? ` · #${values.site[3]}` : ''}
            </span>
            <span className="caret">▾</span>
          </button>
          <span className="grow" />
          <span className={'save-state' + (saved === 'error' ? ' err' : '')}>
            {saved === 'error' ? 'Storage full' : saved ? 'Saved' : 'Saving…'}
          </span>
          <div className="seg" role="tablist">
            <button role="tab" aria-selected={view === 'edit'} className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}>
              Fill in
            </button>
            <button role="tab" aria-selected={view === 'preview'} className={view === 'preview' ? 'on' : ''} onClick={() => setView('preview')}>
              Preview
            </button>
          </div>
          <button className="btn primary" onClick={exportPdf}>
            <span className="hide-sm">Export </span>PDF
          </button>
        </header>

        <div className="layout">
          <aside className={'sidebar' + (drawer === 'nav' ? ' open' : '')}>
            <div className="progress-card">
              <div className="ring" style={{ '--p': pct }}>
                <span>{pct}%</span>
              </div>
              <div>
                <div className="pc-title">
                  {done} of {total} sections
                </div>
                <div className="pc-sub">Never leave a section blank.</div>
              </div>
            </div>
            <nav>
              {PARTS.map((p) => (
                <div key={p.id} className="nav-part">
                  <div className="nav-part-title">{p.id === 'E' ? 'Sign-Off' : p.title.split(':')[0]}</div>
                  {p.sections
                    .filter((s) => p.id !== 'D' || s.stage === stage || sectionFilled(s, values))
                    .map((s) => (
                      <a
                        key={s.id}
                        href={'#' + s.id}
                        className={'nav-link' + (sectionFilled(s, values) ? ' done' : '')}
                        onClick={() => {
                          setView('edit')
                          setDrawer(null)
                        }}
                      >
                        <span className="dot" />
                        {s.num ? `${s.num}. ` : ''}
                        {s.navTitle || s.title}
                      </a>
                    ))}
                  {p.id === 'D' && !stage && (
                    <a href="#s1" className="nav-link muted" onClick={() => setDrawer(null)}>
                      Choose current stage in section 1
                    </a>
                  )}
                </div>
              ))}
            </nav>
          </aside>
          {drawer && <div className="scrim" onClick={() => setDrawer(null)} />}

          <main className="main">
            {view === 'edit' ? (
              <EditView values={values} setValue={setValue} stage={stage} />
            ) : (
              <div className="paper-wrap">
                <div className="paper-note">
                  This is how the PDF will look. Use <strong>Export PDF</strong> and choose “Save as PDF”.
                </div>
                <div className="paper">
                  <div className="paper-head">Daily Site Report: Refurbishment &amp; Renovation</div>
                  <PrintReport values={values} />
                </div>
              </div>
            )}
          </main>
        </div>

        {drawer === 'reports' && (
          <ReportsDrawer
            reports={reports}
            current={current}
            onPick={(id) => {
              setState((s) => ({ ...s, current: id }))
              setDrawer(null)
              window.scrollTo({ top: 0 })
            }}
            onNew={createReport}
            onDelete={deleteReport}
            onBackup={() => downloadJSON(reports)}
            onRestore={restore}
            onClose={() => setDrawer(null)}
          />
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>

      <div className="print-root" aria-hidden="true">
        <PrintReport values={values} />
      </div>
    </>
  )
}

function EditView({ values, setValue, stage }) {
  return (
    <div className="form">
      <div className="hero">
        <div className="eyebrow">{fmtLongDate(values.site?.[2]) || 'Today'}</div>
        <h1>Daily Site Report: Refurbishment &amp; Renovation</h1>
        <p>
          Complete Parts A to C every day. In Part D, complete only the stage you are working in. Record everything you find,
          with photos, before anything is covered or removed. Be specific: numbers, locations, rooms, names.
        </p>
      </div>
      {PARTS.map((p) => (
        <section key={p.id} className="part">
          <h2 className="part-title">{p.title}</h2>
          {p.intro && <p className="part-intro">{p.intro}</p>}
          {p.id === 'D' ? (
            <StageSections part={p} values={values} setValue={setValue} stage={stage} />
          ) : (
            p.sections.map((s) => <SectionCard key={s.id} section={s} values={values} setValue={setValue} />)
          )}
        </section>
      ))}
      <div className="form-end">
        <p>End of report. Check the preview, then export the PDF and send it by the agreed time.</p>
      </div>
    </div>
  )
}

function SectionCard({ section, values, setValue, badge }) {
  const filled = sectionFilled(section, values)
  return (
    <div className={'card' + (filled ? ' filled' : '')} id={section.id}>
      {!section.hideTitle && (
        <h3 className="card-title">
          {section.num && <span className="num-badge">{section.num}</span>}
          <span>{section.title}</span>
          {badge}
          <span className={'status-dot' + (filled ? ' done' : '')} title={filled ? 'Filled in' : 'Not filled in yet'} />
        </h3>
      )}
      {section.intro && <p className="card-intro">{section.intro}</p>}
      {section.blocks.map((b) => (
        <FormBlock key={b.id} block={b} values={values} set={setValue} />
      ))}
      {section.outro && <p className="card-outro">{section.outro}</p>}
      {section.rule && (
        <p className="card-outro">
          <strong>{section.rule.lead}</strong> {section.rule.text}
        </p>
      )}
    </div>
  )
}

function StageSections({ part, values, setValue, stage }) {
  const [open, setOpen] = useState({})
  const active = part.sections.find((s) => s.stage === stage)
  return (
    <>
      {active ? (
        <SectionCard section={active} values={values} setValue={setValue} badge={<span className="pill">Current stage</span>} />
      ) : (
        <div className="card empty-stage">
          <p>
            Choose the <a href="#s1">current stage in section 1</a> and its checklist will appear here. The other stages are
            marked N/A in the export.
          </p>
        </div>
      )}
      <div className="other-stages">
        <div className="other-title">Other stages (exported as N/A unless ticked)</div>
        {part.sections
          .filter((s) => s.stage !== stage)
          .map((s) =>
            open[s.id] ? (
              <SectionCard
                key={s.id}
                section={s}
                values={values}
                setValue={setValue}
                badge={
                  <button className="link pill-btn" onClick={() => setOpen({ ...open, [s.id]: false })}>
                    Collapse
                  </button>
                }
              />
            ) : (
              <button key={s.id} id={s.id} className={'stage-row' + (sectionFilled(s, values) ? ' filled' : '')} onClick={() => setOpen({ ...open, [s.id]: true })}>
                <span className="stage-n">{s.stage}</span>
                <span className="stage-t">{STAGES[s.stage - 1]}</span>
                <span className="stage-na">{sectionFilled(s, values) ? 'Has entries' : 'N/A'}</span>
                <span className="caret">▸</span>
              </button>
            ),
          )}
      </div>
    </>
  )
}

function ReportsDrawer({ reports, current, onPick, onNew, onDelete, onBackup, onRestore, onClose }) {
  const list = useMemo(() => sortedReports(reports), [reports])
  const fileRef = useRef(null)
  return (
    <>
      <div className="scrim top" onClick={onClose} />
      <div className="reports" role="dialog" aria-label="Reports">
        <div className="reports-head">
          <h3>Your reports</h3>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <button className="btn primary block" onClick={onNew}>
          + New daily report
        </button>
        <p className="hint">A new report copies the site details, stage tracker and stock from your latest report.</p>
        <ul className="report-list">
          {list.map((r) => {
            const v = r.values || {}
            const { done, total } = completion(v, currentStage(v))
            return (
              <li key={r.id} className={r.id === current ? 'active' : ''}>
                <button className="report-item" onClick={() => onPick(r.id)}>
                  <span className="ri-date">{fmtDate(v.site?.[2]) || 'No date'}</span>
                  <span className="ri-meta">
                    {v.site?.[0] || 'Untitled project'}
                    {v.site?.[3] ? ` · Report #${v.site[3]}` : ''}
                  </span>
                  <span className="ri-bar">
                    <span style={{ width: `${(done / total) * 100}%` }} />
                  </span>
                </button>
                <button className="icon-btn danger" aria-label="Delete report" title="Delete report" onClick={() => onDelete(r.id)}>
                  🗑
                </button>
              </li>
            )
          })}
        </ul>
        <div className="reports-foot">
          <p className="hint">Reports are saved on this device. Back them up to move them to another phone or computer.</p>
          <div className="row-inline">
            <button className="btn ghost sm" onClick={onBackup}>
              Back up all
            </button>
            <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>
              Restore backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onRestore(f)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
