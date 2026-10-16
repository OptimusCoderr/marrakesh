import { PARTS, DOC_TITLE, DOC_INTRO, currentStage } from '../schema'
import { display, sumCol, overallProgress, fmtDateTime } from '../format'

// The exported report. Laid out like the original form: serif headings,
// beige header rows, light ruled tables and square tick boxes.
export default function PrintReport({ values = {} }) {
  const stage = currentStage(values)
  return (
    <article className="doc">
      <h1 className="doc-title">{DOC_TITLE}</h1>
      <p className="doc-p">{DOC_INTRO}</p>
      {PARTS.map((part) => (
        <section key={part.id} className={'doc-part part-' + part.id}>
          {part.id !== 'E' && <h2 className="doc-h2">{part.title}</h2>}
          {part.intro && <p className="doc-p">{part.intro}</p>}
          {part.sections.map((s) => {
            const na = part.id === 'D' && s.stage !== stage && !hasAny(values[s.blocks[0].id])
            return (
              <div key={s.id} className="doc-section">
                {s.hideTitle ? (
                  <h2 className="doc-h2">{s.title}</h2>
                ) : (
                  <h3 className="doc-h3">
                    {s.num ? `${s.num}. ` : ''}
                    {s.title}
                    {na && <span className="doc-na">N/A</span>}
                  </h3>
                )}
                {s.intro && <p className="doc-p">{s.intro}</p>}
                {s.blocks.map((b) => (
                  <DocBlock key={b.id} block={b} values={values} />
                ))}
                {s.outro && <p className="doc-p">{s.outro}</p>}
                {s.rule && (
                  <p className="doc-p">
                    <strong>{s.rule.lead}</strong> {s.rule.text}
                  </p>
                )}
              </div>
            )
          })}
        </section>
      ))}
    </article>
  )
}

function hasAny(v) {
  if (!v) return false
  return v.some((x) => x && (x.s || (x.n && x.n.trim())))
}

function Cell({ children }) {
  return <td>{children}</td>
}

function Multiline({ text }) {
  if (!text) return null
  return <span className="ml">{text}</span>
}

function DocBlock({ block, values }) {
  const value = values[block.id]
  switch (block.type) {
    case 'kv':
      return (
        <table className={'dt dkv' + (block.narrow ? ' narrow' : '')}>
          <thead>
            <tr>
              <th>{block.head[0]}</th>
              <th>{block.head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => {
              const r = typeof row === 'string' ? { label: row } : row
              let v = value?.[i]
              if (!v && r.computed === 'overall') v = overallProgress(values)
              return (
                <tr key={i}>
                  <td className="lbl">{r.label}</td>
                  <Cell>
                    <Multiline text={display(r.kind, v)} />
                  </Cell>
                </tr>
              )
            })}
          </tbody>
        </table>
      )

    case 'grid':
      return (
        <>
          {block.subtitle && <h4 className="doc-h4">{block.subtitle}</h4>}
          <table className={'dt grid g-' + block.id}>
            <thead>
              <tr>
                {block.cols.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((label, ri) => (
                <tr key={label}>
                  <td className="lbl">{label}</td>
                  {block.cols.slice(1).map((c, k) => (
                    <Cell key={k}>
                      <Multiline text={display(c.kind, value?.[ri]?.[k + 1])} />
                    </Cell>
                  ))}
                </tr>
              ))}
              {block.totalRow && (
                <tr className="total">
                  <td className="lbl">
                    <strong>{block.totalRow}</strong>
                  </td>
                  {block.cols.slice(1).map((c, k) => {
                    const t = c.sum ? sumCol(value, k + 1) : 0
                    return <Cell key={k}>{c.sum && t ? <strong>{t}</strong> : null}</Cell>
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </>
      )

    case 'rows': {
      const rows = (value || []).filter((r) => r && r.some((x) => x && String(x).trim()))
      const count = block.numbered ? Math.max(rows.length, block.minRows) : Math.max(rows.length, 2)
      return (
        <>
          {block.subtitle && <h4 className="doc-h4">{block.subtitle}</h4>}
          <table className={'dt rows' + (rows.length ? '' : ' blank') + ' r-' + block.id}>
            <thead>
              <tr>
                {block.numbered && <th className="num">#</th>}
                {block.cols.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: count }, (_, ri) => (
                <tr key={ri}>
                  {block.numbered && <td className="num">{ri + 1}</td>}
                  {block.cols.map((c, ci) => (
                    <Cell key={ci}>
                      <Multiline text={display(c.kind, rows[ri]?.[ci])} />
                    </Cell>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )
    }

    case 'prose':
      return (
        <>
          <p className="doc-p">
            {block.lead && <strong>{block.lead} </strong>}
            {block.prompt}
          </p>
          {value && value.trim() && <div className="doc-answer">{value}</div>}
        </>
      )

    case 'checklist':
      return (
        <ul className="doc-checks">
          {block.items.map((text, i) => {
            const it = value?.[i] || {}
            const s = it.s || ''
            return (
              <li key={i} className={'s-' + (s || 'none')}>
                <span className="box">{s === 'y' ? '✓' : ''}</span>
                <span className="txt">
                  {text}
                  {s === 'na' && <span className="na"> — N/A</span>}
                  {it.n && <span className="note">{it.n}</span>}
                </span>
              </li>
            )
          })}
        </ul>
      )

    case 'inline':
      return (
        <div className="doc-inline">
          {block.fields.map((f, i) => (
            <p key={f}>
              <strong>{f}</strong> {value?.[i] || ''}
            </p>
          ))}
        </div>
      )

    case 'list': {
      const items = (value || []).filter((x) => x && x.trim())
      const count = Math.max(items.length, block.minRows)
      return (
        <ol className="doc-list">
          {Array.from({ length: count }, (_, i) => (
            <li key={i}>
              <Multiline text={items[i] || ''} />
            </li>
          ))}
        </ol>
      )
    }

    case 'signoff':
      return (
        <table className="dt dsign">
          <thead>
            <tr>
              {block.cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((role, i) => {
              const r = value?.[i] || {}
              return (
                <tr key={role}>
                  <td className="lbl">{role}</td>
                  <td>{r.name}</td>
                  <td className="sigcell">{r.sig && <img src={r.sig} alt="" />}</td>
                  <td>{fmtDateTime(r.dt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )

    default:
      return null
  }
}
