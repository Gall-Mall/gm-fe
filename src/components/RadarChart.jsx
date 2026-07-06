export function RadarChart({ variant = 'personal' }) {
  const points =
    variant === 'group'
      ? '150,38 220,82 214,164 150,216 78,178 70,94'
      : '150,52 216,92 204,172 150,204 92,170 82,94';

  return (
    <svg className="radar-chart" viewBox="0 0 300 250" role="img" aria-label="먹거리 성향 레이더 차트">
      <polygon className="radar-grid" points="150,30 235,80 235,170 150,225 65,170 65,80" />
      <polygon className="radar-grid light" points="150,70 200,100 200,155 150,188 100,155 100,100" />
      <line x1="150" y1="30" x2="150" y2="225" />
      <line x1="65" y1="80" x2="235" y2="170" />
      <line x1="235" y1="80" x2="65" y2="170" />
      <polygon className="radar-fill" points={points} />
      <circle cx="150" cy="52" r="5" />
      <circle cx="216" cy="92" r="5" />
      <circle cx="204" cy="172" r="5" />
      <circle cx="150" cy="204" r="5" />
      <circle cx="92" cy="170" r="5" />
      <circle cx="82" cy="94" r="5" />
      <text x="150" y="18">감성</text>
      <text x="240" y="85">단체</text>
      <text x="232" y="182">가격</text>
      <text x="150" y="244">웨이팅</text>
      <text x="48" y="180">로컬</text>
      <text x="50" y="86">실패</text>
    </svg>
  );
}
