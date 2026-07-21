import { ArrowLeft, Check, Plus, MapPin } from 'lucide-react';
import { recommendationCandidates, menus as menuData } from '../../data/appData';
import { KakaoMap } from '../../components/KakaoMap';

export function RestaurantSearchPage({ flow }) {
  const { goToStep, gset, groupRestaurants, toggleGroupRestaurant, decidedMenu } = flow;
  const selMenu = decidedMenu || menuData[0];

  const base = { lat: gset.lat ?? 37.5665, lng: gset.lng ?? 126.978 };
  const markers = recommendationCandidates.map((r) => ({
    lat: base.lat + (r.geo?.dLat || 0),
    lng: base.lng + (r.geo?.dLng || 0),
    label: r.name,
  }));

  return (
    <main className="screen page narrow">
      <button type="button" className="back-btn" onClick={() => goToStep('menuconfirmed')}><ArrowLeft size={16} />확정 메뉴</button>
      <header className="page-head col">
        <span className="tag">방장 · 식당 검색</span>
        <h1>{selMenu?.name} 식당</h1>
        <p className="muted">그룹 위치 기준 근처 식당이에요. 오늘 갈 식당을 한 곳만 선택하세요.</p>
      </header>

      <section className="card map-card">
        <div className="card-title"><span className="card-icon"><MapPin size={15} /></span><h2>지도에서 보기</h2></div>
        <KakaoMap center={base} markers={markers} height={200} />
      </section>

      <div className="rest-list">
        {recommendationCandidates.map((r) => {
          const added = groupRestaurants.includes(r.id);
          return (
            <article className={`card rest-row ${added ? 'is-added' : ''}`} key={r.id}>
              <div className="rest-thumb" style={{ backgroundImage: `url(${r.image})` }} />
              <div className="rest-info">
                <div className="final-name"><strong>{r.name}</strong><em className="accent">{r.score}%</em></div>
                <small className="muted-sm"><MapPin size={12} /> {r.city} · {r.distance}</small>
                <p className="muted-sm">{r.meta}</p>
              </div>
              <button type="button" className={`button ${added ? 'primary' : 'ghost'} square-lg`} onClick={() => toggleGroupRestaurant(r.id)} aria-label={added ? '선택됨' : '선택'} aria-pressed={added}>
                {added ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </article>
          );
        })}
      </div>

      <div className="page-actions">
        <span className="muted-sm">{groupRestaurants.length ? '식당 1곳 선택됨' : '식당을 한 곳 선택하세요'}</span>
        <button type="button" className="button primary" disabled={groupRestaurants.length === 0} onClick={() => goToStep('result')}>
          선택한 식당으로 진행
        </button>
      </div>
    </main>
  );
}
