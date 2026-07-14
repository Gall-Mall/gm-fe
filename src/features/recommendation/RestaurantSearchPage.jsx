import { ArrowLeft, Check, Plus, MapPin } from 'lucide-react';
import { recommendationCandidates, menus } from '../../data/appData';

export function RestaurantSearchPage({ flow }) {
  const { goToStep, groupRestaurants, toggleGroupRestaurant, selectedFinalMenuId, finalRanked } = flow;
  const selMenu = finalRanked.find((m) => m.id === selectedFinalMenuId) || finalRanked[0] || menus[0];

  return (
    <main className="screen page narrow">
      <button type="button" className="back-btn" onClick={() => goToStep('finallist')}><ArrowLeft size={16} />최종 메뉴 목록</button>
      <header className="page-head col">
        <span className="tag">방장 · 식당 검색</span>
        <h1>{selMenu?.name} 식당</h1>
        <p className="muted">그룹 위치 기준 근처 식당이에요. 그룹 음식점 목록에 담을 식당을 추가하세요.</p>
      </header>

      <div className="rest-list">
        {recommendationCandidates.map((r) => {
          const added = groupRestaurants.includes(r.id);
          return (
            <article className="card rest-row" key={r.id}>
              <div className="rest-thumb" style={{ backgroundImage: `url(${r.image})` }} />
              <div className="rest-info">
                <div className="final-name"><strong>{r.name}</strong><em className="accent">{r.score}%</em></div>
                <small className="muted-sm"><MapPin size={12} /> {r.city} · {r.distance}</small>
                <p className="muted-sm">{r.meta}</p>
              </div>
              <button type="button" className={`button ${added ? 'ghost' : 'primary'} square-lg`} onClick={() => toggleGroupRestaurant(r.id)} aria-label={added ? '추가됨' : '추가'}>
                {added ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </article>
          );
        })}
      </div>

      <div className="page-actions">
        <span className="muted-sm">그룹 목록에 담긴 식당 {groupRestaurants.length}곳</span>
        <button type="button" className="button primary" disabled={groupRestaurants.length === 0} onClick={() => goToStep('recommend')}>
          담은 식당으로 투표하기
        </button>
      </div>
    </main>
  );
}
