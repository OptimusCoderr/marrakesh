import { Field, AutoTextarea } from './Fields'
import SignaturePad from './SignaturePad'
import { sumCol, overallProgress } from '../format'

// Immutable set for nested arrays/objects: setAt(arr, [2, 'name'], 'x')
function setAt(base, path, v) {
  const [k, ...rest] = path
  const copy = Array.isArray(base) ? [...base] : typeof k === 'number' ? [] : { ...(base || {}) }
  if (Array.isArray(copy) && typeof k === 'number') {
    while (copy.length < k) copy.push(undefined)
  }
  copy[k] = rest.length ? setAt(base?.[k], rest, v) : v
  return copy
}

export default function FormBlock({ block, values, set }) {
  const value = values[block.id]
  const update = (path, v) => set(block.id, setAt(value, path, v))
  const props = { block, value, update, set: (v) => set(block.id, v), values }

  let body
  switch (block.type) {
    case 'kv':
      body = <KV {...props} />
      break
    case 'grid':
      body = <Grid {...props} />
      break
    case 'rows':
      body = <Rows {...props} />
      break
    case 'prose':
      body = <Prose {...props} />
      break
    case 'checklist':
      body = <Checklist {...props} />
      break
    case 'inline':
      body = <Inline {...props} />
      break
    case 'list':
      body = <List {...props} />
      break
    case 'signoff':
      body = <SignOff {...props} />
      break
    default:
      body = null
  }
  return (
    <div className="fblock">
      {block.subtitle && <h4 className="fsub">{block.subtitle}</h4>}
      {body}
    </div>
  )
}

function KV({ block, value, update, values }) {
  return (
    <div className={'kv' + (block.narrow ? ' narrow' : '')}>
      {block.rows.map((row, i) => {
        const r = typeof row === 'string' ? { label: row } : row
        const computed = r.computed === 'overall' ? overallProgress(values) : ''
        return (
          <label className="kv-row" key={i}>
            <span className="kv-label">{r.label}</span>
            <span className="kv-input">
              <Field
                kind={r.kind}
                options={r.options}
                placeholder={r.placeholder}
                label={r.label}
                value={value?.[i]}
                computed={computed}
                onChange={(v) => update([i], v)}
              />
            </span>
          </label>
        )
      })}
    </div>
  )
}

function Grid({ block, value, update }) {
  const sums = block.cols.map((col, ci) => (col.sum ? sumCol(value, ci) : null))
  return (
    <div className="ftable-wrap">
      <table className="ftable">
        <thead>
          <tr>
            {block.cols.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((rowLabel, ri) => (
            <tr key={rowLabel}>
              <th scope="row" className="rowhead">
                {rowLabel}
              </th>
              {block.cols.slice(1).map((col, k) => {
                const ci = k + 1
                return (
                  <td key={ci} data-label={col.short || col.label} className={'k-' + col.kind}>
                    <Field
                      kind={col.kind}
                      options={col.options}
                      label={`${rowLabel}: ${col.label}`}
                      value={value?.[ri]?.[ci]}
                      onChange={(v) => update([ri, ci], v)}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
          {block.totalRow && (
            <tr className="total">
              <th scope="row" className="rowhead">
                {block.totalRow}
              </th>
              {block.cols.slice(1).map((col, k) => (
                <td key={k} data-label={col.label} className={sums[k + 1] == null ? 'empty-total' : ''}>
                  {sums[k + 1] != null && <strong>{sums[k + 1] || '—'}</strong>}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Rows({ block, value, update, set }) {
  const rows = value || []
  const count = Math.max(rows.length, block.minRows || 1)
  const removeRow = (ri) => set(rows.filter((_, i) => i !== ri))
  return (
    <div className="ftable-wrap">
      <table className="ftable rows">
        <thead>
          <tr>
            {block.numbered && <th className="num">#</th>}
            {block.cols.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
            <th className="act" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }, (_, ri) => (
            <tr key={ri}>
              {block.numbered && <td className="num" data-label="#">{ri + 1}</td>}
              {block.cols.map((col, ci) => (
                <td key={ci} data-label={col.short || col.label} className={'k-' + col.kind}>
                  <Field
                    kind={col.kind}
                    options={col.options}
                    label={col.label}
                    rows={1}
                    value={rows[ri]?.[ci]}
                    onChange={(v) => update([ri, ci], v)}
                  />
                </td>
              ))}
              <td className="act">
                {ri < rows.length && (
                  <button type="button" className="icon-btn" title="Remove row" aria-label="Remove row" onClick={() => removeRow(ri)}>
                    ×
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn ghost sm add" onClick={() => update([count, 0], rows[count]?.[0] ?? '')}>
        + Add row
      </button>
    </div>
  )
}

function Prose({ block, value, set }) {
  return (
    <div className="prose-field">
      <p className="prompt">
        {block.lead && <strong>{block.lead} </strong>}
        {block.prompt}
      </p>
      <AutoTextarea value={value} onChange={set} rows={block.rows || 5} placeholder="Type here…" />
    </div>
  )
}

const STATES = [
  ['y', '✓'],
  ['na', 'N/A'],
]

function Checklist({ block, value, update, set }) {
  const items = value || []
  const allNA = () => set(block.items.map((_, i) => ({ ...(items[i] || {}), s: items[i]?.s || 'na' })))
  return (
    <div className="checklist">
      {block.items.map((text, i) => {
        const it = items[i] || {}
        return (
          <div className={'check-item s-' + (it.s || 'none')} key={i}>
            <div className="check-main">
              <button
                type="button"
                className="tick"
                aria-pressed={it.s === 'y'}
                aria-label={`Tick: ${text}`}
                onClick={() => update([i, 's'], it.s === 'y' ? '' : 'y')}
              >
                {it.s === 'y' ? '✓' : ''}
              </button>
              <span className="check-text" onClick={() => update([i, 's'], it.s === 'y' ? '' : 'y')}>
                {text}
              </span>
              <div className="tri">
                {STATES.map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    className={'tri-btn' + (it.s === k ? ' on' : '')}
                    onClick={() => update([i, 's'], it.s === k ? '' : k)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {block.notes && (
              <input
                className="check-note"
                type="text"
                placeholder="Readings, quantities or problems (optional)"
                value={it.n || ''}
                onChange={(e) => update([i, 'n'], e.target.value)}
              />
            )}
          </div>
        )
      })}
      <div className="checklist-foot">
        <button type="button" className="link" onClick={allNA}>
          Mark the rest N/A
        </button>
        <button type="button" className="link" onClick={() => set([])}>
          Clear
        </button>
      </div>
    </div>
  )
}

function Inline({ block, value, update }) {
  return (
    <div className="inline-fields">
      {block.fields.map((f, i) => (
        <label key={f} className="inline-field">
          <strong>{f}</strong>
          <input type="text" value={value?.[i] ?? ''} onChange={(e) => update([i], e.target.value)} />
        </label>
      ))}
    </div>
  )
}

function List({ block, value, update, set }) {
  const items = value || []
  const count = Math.max(items.length, block.minRows || 3)
  return (
    <ol className="flist">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <AutoTextarea value={items[i]} onChange={(v) => update([i], v)} rows={1} placeholder="Decision needed…" />
        </li>
      ))}
      <li className="nobullet">
        <button type="button" className="btn ghost sm" onClick={() => update([count], '')}>
          + Add item
        </button>
        {items.length > (block.minRows || 3) && (
          <button type="button" className="link" onClick={() => set(items.slice(0, -1))}>
            Remove last
          </button>
        )}
      </li>
    </ol>
  )
}

function SignOff({ block, value, update }) {
  return (
    <div className="signoff">
      {block.rows.map((role, i) => {
        const r = value?.[i] || {}
        return (
          <div className="sign-card" key={role}>
            <div className="sign-role">{role}</div>
            <label>
              <span>Name</span>
              <input type="text" value={r.name || ''} onChange={(e) => update([i, 'name'], e.target.value)} />
            </label>
            <label>
              <span>Date and time</span>
              <div className="row-inline">
                <input type="datetime-local" value={r.dt || ''} onChange={(e) => update([i, 'dt'], e.target.value)} />
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => {
                    const d = new Date()
                    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    update([i, 'dt'], iso)
                  }}
                >
                  Now
                </button>
              </div>
            </label>
            <div className="sign-field">
              <span>Signature</span>
              <SignaturePad label={role} value={r.sig} onChange={(v) => update([i, 'sig'], v)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
