// The whole questionnaire, described once. Both the form and the printed
// report are rendered from this, so the export always matches the form.

export const DOC_TITLE = 'CLUUF Daily Site Report: Refurbishment & Renovation'
export const RUNNING_HEAD = 'Daily Site Report: Refurbishment & Renovation'
export const DOC_INTRO =
  'One report per site, per day, from the first survey to handover. Complete Parts A to C every day. In Part D, complete only the stage you are working in and write N/A for the rest. Refurbishment hides surprises: record everything you find, with photos, before anything is covered or removed. Be specific: numbers, locations, rooms, names. Never leave a section blank.'

export const STAGES = [
  'Pre-start survey and condition record',
  'Protection, isolation and mobilisation',
  'Strip-out and demolition',
  'Structural checks and hidden defects',
  'Repairs and making good',
  'Waterproofing and damp treatment',
  'First fix (electrical, plumbing, drainage)',
  'Plastering, screed and ceilings',
  'Second fix and finishes',
  'External works',
  'Testing, snagging and handover',
]

const YES_NO = ['Yes', 'No']

// Column helpers. `kind` controls the input; `w` is a print width hint.
const c = (label, kind = 'text', extra = {}) => ({ label, kind, ...extra })

export const PARTS = [
  {
    id: 'A',
    title: 'Part A: Daily Basics',
    sections: [
      {
        id: 's1',
        num: 1,
        title: 'Site Details',
        blocks: [
          {
            id: 'site',
            type: 'kv',
            head: ['Field', 'Entry'],
            rows: [
              { label: 'Project / Client', carry: true },
              { label: 'Property address', carry: true },
              { label: 'Report date', kind: 'date' },
              { label: 'Report number', carry: 'increment' },
              { label: 'Day number / total days planned', carry: 'increment', placeholder: 'e.g. 12 / 60' },
              { label: 'Prepared by (Site Engineer)', carry: true },
              { label: 'Work start time / end time', kind: 'timerange' },
              { label: 'Current stage (see Part D)', kind: 'stage', carry: true },
              { label: 'Is the property occupied during works? (Yes / No)', kind: 'select', options: YES_NO, carry: true },
              { label: 'Agreed working hours and noise limits', carry: true },
            ],
          },
        ],
      },
      {
        id: 's2',
        num: 2,
        title: 'Weather & Access',
        blocks: [
          {
            id: 'weather',
            type: 'kv',
            head: ['Field', 'Entry'],
            rows: [
              { label: 'Morning / afternoon weather', placeholder: 'e.g. Sunny / light rain after 3pm' },
              { label: 'Hours lost to weather' },
              { label: 'Access problems (gate, parking, stairs, deliveries, estate rules)', kind: 'textarea' },
              { label: 'Water and power available on site?' },
            ],
          },
        ],
      },
      {
        id: 's3',
        num: 3,
        title: 'Manpower',
        blocks: [
          {
            id: 'manpower',
            type: 'grid',
            cols: [
              c('Trade / Role'),
              c('Company or crew lead'),
              c('Number present', 'number', { sum: true }),
              c('Hours', 'number', { sum: true }),
              c('Absent (and why)'),
            ],
            rows: [
              'Site supervisor / foreman',
              'Demolition / strip-out crew',
              'Masons',
              'Carpenters / joiners',
              'Plumbers',
              'Electricians',
              'Roofers',
              'Plasterers / tilers / painters',
              'POP / ceiling fitters',
              'Welders / metalworkers',
              'General labourers',
              'Subcontractors (name them)',
              'Visitors (client, neighbours, inspectors, suppliers)',
            ],
            totalRow: 'Total on site',
          },
        ],
      },
      {
        id: 's4',
        num: 4,
        title: 'Equipment & Tools',
        blocks: [
          {
            id: 'equipment',
            type: 'grid',
            cols: [
              c('Equipment'),
              c('Number', 'number'),
              c('Hours used', 'number'),
              c('Condition / breakdowns'),
              c('Hired or owned', 'select', { options: ['Hired', 'Owned'] }),
            ],
            rows: [
              'Breakers / drills',
              'Cutting saw / grinder',
              'Scaffolding / ladders',
              'Mixer',
              'Water pump / generator',
              'Dust control (sheeting, fans)',
              'Other',
            ],
          },
        ],
      },
      {
        id: 's5',
        num: 5,
        title: 'Work Completed Today',
        intro: 'List every activity by room or area, with quantity (m, m², number).',
        blocks: [
          {
            id: 'work',
            type: 'rows',
            numbered: true,
            minRows: 5,
            cols: [
              c('Room / area'),
              c('Activity'),
              c('Quantity done'),
              c('Unit', 'select', { options: ['m', 'm²', 'm³', 'no.', 'kg', 'bags', 'trips'] }),
              c('Crew'),
              c('Status (done / ongoing / stopped)', 'select', { options: ['Done', 'Ongoing', 'Stopped'] }),
            ],
          },
          {
            id: 'account',
            type: 'prose',
            lead: 'Full account of the day (in your own words):',
            prompt:
              'Write what happened from arrival to close of work, in time order. Include decisions, changes of plan, stoppages, surprises and anyone who came to site.',
            rows: 8,
          },
        ],
      },
      {
        id: 's6',
        num: 6,
        title: 'Materials',
        blocks: [
          {
            id: 'delivered',
            type: 'rows',
            subtitle: 'Delivered today',
            minRows: 2,
            cols: [
              c('Material'),
              c('Supplier'),
              c('Quantity'),
              c('Delivery note no.'),
              c('Quality checked (Yes / No)', 'select', { options: YES_NO }),
              c('Rejected?'),
            ],
          },
          {
            id: 'used',
            type: 'rows',
            subtitle: 'Used today',
            minRows: 2,
            cols: [c('Material'), c('Quantity used'), c('Where used'), c('Wastage')],
          },
          {
            id: 'stock',
            type: 'grid',
            subtitle: 'Stock and shortages',
            carry: true,
            cols: [
              c('Material'),
              c('In stock'),
              c('Needed in the next 3 days'),
              c('Order required?', 'select', { options: YES_NO }),
            ],
            rows: [
              'Cement / sand',
              'Blocks / bricks',
              'Plaster / POP / screed materials',
              'Tiles and adhesive',
              'Paint and primer',
              'Pipes, cables and fittings',
              'Timber / doors / windows',
              'Waterproofing materials',
              'Other',
            ],
          },
        ],
      },
      {
        id: 's7',
        num: 7,
        title: 'Waste & Cleanliness',
        blocks: [
          {
            id: 'waste',
            type: 'kv',
            head: ['Item', 'Entry'],
            rows: [
              { label: 'Rubble and waste removed today (quantity, trips, disposal point)', kind: 'textarea' },
              { label: 'Waste still on site and where' },
              { label: 'Hazardous materials found (old chemicals, asbestos-type sheets, fuel, wiring)', kind: 'textarea' },
              { label: 'Dust and noise controlled?', kind: 'select', options: YES_NO },
              { label: "Client's furniture, floors and finishes protected?", kind: 'select', options: YES_NO },
              { label: 'Work areas swept and made safe at close of work?', kind: 'select', options: YES_NO },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'B',
    title: 'Part B: Progress & Control',
    sections: [
      {
        id: 's8',
        num: 8,
        title: 'Stage Tracker',
        intro: 'Update every day. Enter the cumulative percentage complete for each stage.',
        blocks: [
          {
            id: 'tracker',
            type: 'grid',
            carry: true,
            cols: [
              c('Stage'),
              c('Planned finish date', 'date'),
              c('% complete', 'percent'),
              c('Status (not started / ongoing / done / delayed)', 'select', {
                options: ['Not started', 'Ongoing', 'Done', 'Delayed'],
              }),
              c('Notes'),
            ],
            rows: STAGES.map((s, i) => `${i + 1}. ${s.charAt(0).toUpperCase()}${s.slice(1)}`),
          },
          {
            id: 'progress',
            type: 'kv',
            head: ['Question', 'Entry'],
            rows: [
              { label: 'Planned for today', kind: 'textarea' },
              { label: 'Actually achieved', kind: 'textarea' },
              { label: 'If behind: by how much and why', kind: 'textarea' },
              { label: 'Overall project progress (%)', kind: 'percent', computed: 'overall' },
              { label: 'On track for completion date? (Yes / No / At risk)', kind: 'select', options: ['Yes', 'No', 'At risk'] },
              { label: 'Recovery plan if behind', kind: 'textarea' },
            ],
          },
        ],
      },
      {
        id: 's9',
        num: 9,
        title: 'Hidden Defects & Surprises Log',
        intro:
          'Record every defect or surprise found once walls, floors, ceilings or services are opened. Photograph before anything is covered or removed. Do not decide on extra work without the MD.',
        blocks: [
          {
            id: 'defects',
            type: 'rows',
            numbered: true,
            minRows: 3,
            cols: [
              c('Room / location'),
              c('What was found (damp, termite damage, cracks, rotten timber, corroded steel, old wiring, blocked or leaking pipes, other)', 'textarea', { short: 'What was found' }),
              c('Photo no.'),
              c('Effect on scope, time and cost', 'textarea'),
              c('MD decision'),
            ],
          },
        ],
      },
      {
        id: 's10',
        num: 10,
        title: 'Quality Control (every day)',
        intro: "Tick what applies to today's work. Write N/A for the rest.",
        blocks: [
          {
            id: 'qc',
            type: 'checklist',
            items: [
              'Work matches the agreed scope, drawings and finishes schedule',
              'Existing structure assessed before cutting, drilling or removing anything',
              'Levels, lines, plumb and measurements checked (give readings and room)',
              'Materials are the specified type, grade, brand and colour',
              'New work matches or bonds correctly to existing work',
              'Workmanship acceptable (finish, alignment, joints, neatness)',
              'Everything that will be covered up was checked and photographed first',
              'Curing, drying or setting times observed',
              'Completed work protected from damage and from other trades',
              'Quantities recorded for payment',
            ],
          },
          {
            id: 'ncr',
            type: 'rows',
            minRows: 2,
            cols: [c('Defect or non-conformance found'), c('Location'), c('Action taken'), c('Fixed? (Yes / No)', 'select', { options: YES_NO })],
          },
          {
            id: 'holds',
            type: 'inline',
            fields: ['Hold points or inspections reached today:', 'Signed off by:'],
          },
        ],
      },
      {
        id: 's11',
        num: 11,
        title: 'Health & Safety',
        blocks: [
          {
            id: 'hs',
            type: 'checklist',
            items: [
              'Toolbox talk held today',
              'Helmets, boots, gloves, dust masks and eye protection used',
              'Power and water isolated before working on services',
              'Propping or support in place where structure was cut or opened',
              'Scaffold, ladders and working platforms safe',
              'Falling debris controlled; area below barricaded',
              'Nobody entered any chamber, tank or confined space',
              'Temporary electrics safe',
              'First aid kit available',
              'Occupants, children and visitors kept clear of work areas',
              'Site secured at close of work',
            ],
          },
          {
            id: 'incidents',
            type: 'rows',
            minRows: 1,
            cols: [c('Incident, injury or near miss'), c('Who'), c('What happened', 'textarea'), c('Action taken')],
          },
        ],
      },
      {
        id: 's12',
        num: 12,
        title: 'Site Observations & Unexpected Findings',
        blocks: [
          {
            id: 'observations',
            type: 'kv',
            head: ['Item', 'Entry'],
            rows: [
              'Anything unexpected found on site today (what, where, when, what you did)',
              'Existing pipes, cables, drains, chambers or tanks found, opened, moved or damaged',
              'Anything that does not match the existing drawings or the client’s description',
              'Damage to existing property caused during works (record immediately)',
              'Snakes, pests or wildlife seen',
              'Theft, security, neighbour or estate management issues',
              'Visits, inspections, comments or complaints from the client or occupants',
              'Work you were unsure about and how you handled it',
              'Anything else the MD should know',
            ].map((label) => ({ label, kind: 'textarea' })),
          },
        ],
      },
      {
        id: 's13',
        num: 13,
        title: 'Problems, Delays & Risks',
        blocks: [
          {
            id: 'problems',
            type: 'rows',
            numbered: true,
            minRows: 3,
            cols: [c('Issue'), c('Cause'), c('Impact (time / cost)'), c('Action taken'), c('Help needed from the MD?')],
          },
        ],
      },
      {
        id: 's14',
        num: 14,
        title: 'Instructions, Variations & Extra Work',
        intro: 'Refurbishment scope changes constantly. Record every request and discovery that adds, removes or changes work.',
        outro: 'Do not carry out any variation or extra work without written approval from the MD.',
        blocks: [
          {
            id: 'variations',
            type: 'rows',
            minRows: 2,
            cols: [
              c('Who gave the instruction or found the issue'),
              c('Instruction or extra work', 'textarea'),
              c('Date', 'date'),
              c('Cost or time impact'),
              c('Approved by MD in writing?', 'select', { options: YES_NO }),
            ],
          },
        ],
      },
      {
        id: 's15',
        num: 15,
        title: 'Money & Payment Requests',
        outro: 'Attach receipts and delivery notes for every expense.',
        blocks: [
          {
            id: 'payments',
            type: 'rows',
            minRows: 2,
            cols: [c('Item'), c('Amount', 'money'), c('Reason'), c('Needed by', 'date'), c('Approved')],
          },
          {
            id: 'cash',
            type: 'kv',
            head: ['Summary', 'Amount'],
            narrow: true,
            rows: [
              { label: 'Cash received today', kind: 'money' },
              { label: 'Cash spent today', kind: 'money' },
              { label: 'Balance on site', kind: 'money' },
              { label: 'Requested from the MD', kind: 'money' },
            ],
          },
        ],
      },
      {
        id: 's16',
        num: 16,
        title: 'Photos',
        intro:
          'Photograph each room before work starts, after strip-out, whenever anything hidden is found, before covering any pipe, cable or repair, and at the end of each stage.',
        blocks: [
          {
            id: 'photos',
            type: 'rows',
            minRows: 2,
            cols: [c('Photo no.'), c('Room / location'), c('What it shows')],
          },
        ],
      },
    ],
  },
  {
    id: 'C',
    title: 'Part C: Looking Ahead',
    sections: [
      {
        id: 's17',
        num: 17,
        title: "Tomorrow's Plan",
        blocks: [
          {
            id: 'tomorrow',
            type: 'rows',
            numbered: true,
            minRows: 3,
            cols: [c('Activity'), c('Room / location'), c('Crew'), c('Materials and equipment needed'), c('Risks to watch')],
          },
        ],
      },
      {
        id: 's18',
        num: 18,
        title: 'Decisions Needed From the MD',
        blocks: [{ id: 'decisions', type: 'list', minRows: 3 }],
      },
      {
        id: 's19',
        num: 19,
        title: "Site Engineer's Summary",
        blocks: [
          {
            id: 'summary',
            type: 'prose',
            prompt: 'Write 3 to 5 sentences: how the day went, what matters most, and what worries you.',
            rows: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'D',
    title: 'Part D: Stage Checklists',
    intro:
      'Complete only the stage you are working in. Tick each item when checked and note readings, quantities and problems.',
    sections: [
      [
        'Pre-Start Survey & Condition Record',
        [
          "Client's scope, budget, finishes and timeline agreed in writing",
          'Existing drawings obtained, or a measured sketch of each room made',
          'Every room photographed and videoed before work starts (walls, ceilings, floors, fittings)',
          'Existing defects recorded: cracks, damp, stains, leaks, termite damage, broken fittings',
          'Roof, gutters, drains and external walls inspected',
          'Electrical system, distribution board and earthing checked',
          'Plumbing, water tank, borehole, pump, septic tank and chambers located',
          'Live and abandoned chambers and pipes identified with the plumber',
          'Structural concerns referred to an engineer before work starts',
          'Items the client wants kept or protected listed and agreed',
          'Condition record signed by the client',
        ],
      ],
      [
        'Protection, Isolation & Mobilisation',
        [
          "Client's furniture and belongings removed or covered",
          'Floors, stairs, fittings and finishes protected',
          'Dust barriers and sheeting in place',
          'Water, electricity and gas isolated where required',
          "Temporary power, water and workers' toilet arranged",
          'Storage for materials and tools agreed',
          'Working hours, noise rules and neighbour or estate permissions confirmed',
          'Waste route and disposal point agreed',
          'Safety signs and barricades in place',
        ],
      ],
      [
        'Strip-Out & Demolition',
        [
          'Only the agreed items are being removed (check the marked-up plan)',
          'Services identified and isolated before cutting, drilling or breaking',
          'Load-bearing walls not touched without engineer approval',
          'Temporary props in place before removing any support',
          'Debris removed daily; stairs and exits kept clear',
          'Reusable items (doors, fittings, tiles) set aside and recorded',
          'Hazardous materials separated and handled safely',
          'Each opened area photographed before repairs',
          'Surprises logged in the Hidden Defects Log (section 9)',
        ],
      ],
      [
        'Structural Checks & Hidden Defects',
        [
          'Cracks measured, photographed and marked; engineer informed of any active cracks',
          'Corroded rebar, spalling concrete and sagging slabs reported',
          'Foundation or wall settlement signs checked',
          'Termite and rot damage assessed (timber, doors, roofs, ceilings)',
          'Roof timbers, trusses and fixings checked',
          'Damp sources identified (leaks, rising damp, blocked gutters, poor external levels)',
          "Engineer's instructions received in writing before structural work starts",
          'Revised scope and cost sent to the MD for approval',
        ],
      ],
      [
        'Repairs & Making Good',
        [
          'Cracks repaired using the specified method (not simply plastered over)',
          'Damaged concrete cut back, rebar treated and repaired',
          'New walls bonded to existing walls correctly',
          'New openings formed with proper lintels',
          'Roof repairs: leaks traced and fixed at the source, sheets and flashings replaced as required',
          'Floor levels corrected where required',
          'Repairs allowed to dry or cure before the next stage',
          'Repairs photographed before covering',
        ],
      ],
      [
        'Waterproofing & Damp Treatment',
        [
          'Cause of damp fixed first (leak, gutter, external levels, drainage)',
          'Surfaces cleaned, dry and prepared as per product instructions',
          'Waterproofing product, coats and overlaps as specified',
          'Bathrooms, kitchens and balconies waterproofed and turned up at walls',
          'Flood test or ponding test done and recorded (hours, result)',
          'Termite or soil treatment applied where relevant (product, area, contractor)',
        ],
      ],
      [
        'First Fix (Electrical, Plumbing, Drainage)',
        [
          'Old wiring removed or tested; unsafe wiring replaced',
          'New conduits and cables sized and positioned per plan',
          'Circuits labelled and distribution board upgraded as agreed',
          'Pipes replaced or rerouted; leaks fixed at source',
          'Water pressure test done and recorded',
          'Drainage falls checked; blocked drains cleared and tested',
          'Chambers cleaned, covered or filled as agreed; abandoned pipes capped',
          'Every pipe and conduit photographed before covering',
        ],
      ],
      [
        'Plastering, Screed & Ceilings',
        [
          'Old loose plaster removed; surfaces cleaned and dampened',
          'New plaster blended into existing plaster (no visible patch lines)',
          'Plaster thickness, mix and flatness checked',
          'Floor screed level and falls checked in wet areas',
          'Ceiling framing and boards installed; POP work flat and neat',
          'Drying time respected before painting or tiling',
        ],
      ],
      [
        'Second Fix & Finishes',
        [
          'Doors and windows: fit, operation, locks, seals',
          'Tiling: levels, joints, falls, pattern, hollow or cracked tiles',
          'Painting: surface prep, primer, coats, colour matches schedule, no patchiness',
          'Sanitary ware and fittings fixed and tested for leaks',
          'Electrical fittings, switches, sockets and lights fixed and tested',
          'Water traps present on every toilet, basin, sink and floor drain',
          'Vent pipes covered with mesh; gaps around pipes sealed',
          'Finished areas protected from other trades',
        ],
      ],
      [
        'External Works',
        [
          'Ground levels checked so water falls away from the building',
          'Drainage and channels working',
          'Paving, driveway and landscaping done per the Landscape Standard',
          'Boundary walls, gates, fences repaired or built per scope',
          'Chamber covers set flush and sealed',
          'External painting and cleaning done',
        ],
      ],
      [
        'Testing, Snagging & Handover',
        [
          'Electrical, plumbing, water and drainage tested end to end',
          'Snagging list compiled room by room with photos',
          'Defects rectified and re-checked',
          'Compare against the Stage 1 condition record: any damage to existing items fixed',
          "Site cleaned and rubble removed; client's property returned and cleaned",
          'As-built notes updated (pipes, cables, chambers, anything that changed)',
          'Keys, warranties and care guide handed over',
          'Client walk-through done and signed',
          'Defects period and aftercare explained',
        ],
      ],
    ].map(([title, items], i) => ({
      id: `stage${i + 1}`,
      stage: i + 1,
      title: `Stage ${i + 1}: ${title}`,
      navTitle: title,
      blocks: [{ id: `stage${i + 1}`, type: 'checklist', items, notes: true }],
    })),
  },
  {
    id: 'E',
    title: 'Sign-Off',
    sections: [
      {
        id: 'signoff',
        title: 'Sign-Off',
        hideTitle: true,
        blocks: [
          {
            id: 'signoff',
            type: 'signoff',
            cols: ['Role', 'Name', 'Signature', 'Date and time'],
            rows: ['Site Engineer', 'Supervisor / Foreman', 'Reviewed by MD'],
          },
        ],
        rule: {
          lead: 'Submission rule:',
          text: 'send by the agreed time each day. If the report is late or work did not hold, say why in the summary.',
        },
      },
    ],
  },
]

export const ALL_SECTIONS = PARTS.flatMap((p) => p.sections.map((s) => ({ ...s, part: p.id })))

// Index of the selected current stage (1-11), or 0 if none chosen.
export function currentStage(values) {
  const v = values?.site?.[7]
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : 0
}
