import styles from './SystemDiagram.module.css';

const rows = [
  { id: 'product', label: 'Product', verb: 'Build', y: 70, nodes: ['UX', 'Web', 'Mobile', 'APIs'] },
  { id: 'digital', label: 'Digital', verb: 'Connect', y: 210, nodes: ['Site', 'Search', 'Content', 'Data'] },
  { id: 'intelligence', label: 'Intelligence', verb: 'Understand · Automate', y: 350, nodes: ['Chat', 'Agents', 'Answers', 'Actions'] },
] as const;

const xs = [200, 290, 380, 470];

/** Links between layers: [fromRow, fromNode, toRow, toNode]. */
const links: [number, number, number, number][] = [
  [0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 1, 1], [0, 2, 1, 2], [0, 3, 1, 3], [0, 3, 1, 1],
  [1, 0, 2, 0], [1, 1, 2, 2], [1, 2, 2, 0], [1, 3, 2, 1], [1, 3, 2, 3], [1, 2, 2, 2],
];

const path = ([r1, n1, r2, n2]: [number, number, number, number]) => {
  const x1 = xs[n1]!, y1 = rows[r1]!.y + 14, x2 = xs[n2]!, y2 = rows[r2]!.y - 14;
  const mid = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
};

/**
 * Hero visual: Product → Digital → Intelligence as connected layers.
 * Purely decorative (aria-hidden); the same idea is stated in the copy.
 */
export function SystemDiagram() {
  return (
    <svg className={styles.svg} viewBox="0 0 520 420" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="sd-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" className={styles.grid} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="520" height="420" fill="url(#sd-grid)" />

      {links.map((link, index) => (
        <g key={index}>
          <path d={path(link)} className={styles.link} />
          <path d={path(link)} className={styles.pulse} data-row={link[0]} style={{ animationDelay: `${(index % 6) * 0.35}s` }} />
        </g>
      ))}

      {rows.map((row) => (
        <g key={row.id} data-pillar={row.id} className={styles.row}>
          <line x1="150" x2="500" y1={row.y} y2={row.y} className={styles.rail} />
          <text x="20" y={row.y - 4} className={styles.rowLabel}>
            {row.label}
          </text>
          <text x="20" y={row.y + 14} className={styles.rowVerb}>
            {row.verb}
          </text>
          {row.nodes.map((node, index) => (
            <g key={node} transform={`translate(${xs[index]} ${row.y})`}>
              <rect x="-34" y="-14" width="68" height="28" rx="4" className={styles.node} />
              <circle cx="-22" cy="0" r="3" className={styles.dot} />
              <text x="-13" y="4" className={styles.nodeText}>
                {node}
              </text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
