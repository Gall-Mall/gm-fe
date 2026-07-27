import { useState } from 'react';
import { ArrowLeft, Check, ExternalLink, MapPin, Search } from 'lucide-react';
import { KakaoMap } from '../../components/KakaoMap';
import { resolvePlaceUrl } from '../../utils/placeUrl';

export function RestaurantSearchPage({ flow }) {
  const {
    goToStep, gset, decidedMenu,
    restaurantCandidates, restaurantSearchStatus, requestRestaurantSearch, refreshRestaurantResults,
    voteStartStatus, operationError, confirmSchedule,
  } = flow;
  const selMenu = decidedMenu;
  const isReal = voteStartStatus === 'connected';
  const [focusedRestaurantId, setFocusedRestaurantId] = useState(null);

  const base = { lat: gset.lat ?? 37.5665, lng: gset.lng ?? 126.978 };
  const markers = restaurantCandidates.map((r) => ({
    lat: r.lat ?? base.lat + (r.geo?.dLat || 0),
    lng: r.lng ?? base.lng + (r.geo?.dLng || 0),
    label: r.name,
    url: resolvePlaceUrl(r),
  }));
  const focusedRestaurant = restaurantCandidates.find((r) => r.id === focusedRestaurantId);
  const mapFocus = focusedRestaurant
    ? {
        lat: focusedRestaurant.lat ?? base.lat + (focusedRestaurant.geo?.dLat || 0),
        lng: focusedRestaurant.lng ?? base.lng + (focusedRestaurant.geo?.dLng || 0),
      }
    : null;

  return (
    <main className="screen page narrow">
      <button type="button" className="back-btn" onClick={() => goToStep('menuconfirmed')}><ArrowLeft size={16} />확정 메뉴</button>
      <header className="page-head col">
        <span className="tag">방장 · 식당 검색</span>
        <h1>{selMenu?.name ? `${selMenu.name} 식당` : '식당 검색'}</h1>
        <p className="muted">식당 카드를 누르면 지도에서 위치를 자세히 볼 수 있어요.</p>
      </header>

      <section className="card map-card">
        <div className="card-title"><span className="card-icon"><MapPin size={15} /></span><h2>지도에서 보기</h2></div>
        <KakaoMap center={base} markers={markers} focus={mapFocus} height={200} />
      </section>

      {isReal && restaurantCandidates.length === 0 ? (
        <section className="card decide-card">
          {restaurantSearchStatus === 'searching' || restaurantSearchStatus === 'waiting' ? (
            <div className="waiting-box">
              <span className="waiting-spinner" aria-hidden="true" />
              <span>주변 식당 검색 결과를 기다리고 있어요</span>
              <button type="button" className="button ghost" onClick={refreshRestaurantResults}>
                검색 결과 다시 확인
              </button>
            </div>
          ) : (
            <button type="button" className="button primary full" onClick={() => requestRestaurantSearch(Math.round((gset.distanceKm || 2) * 1000))}>
              <Search size={17} /><span>{selMenu?.name} 주변 식당 검색</span>
            </button>
          )}
          {operationError ? <p className="alert-warn">{operationError}</p> : null}
        </section>
      ) : null}

      <div className="rest-list">
        {restaurantCandidates.map((restaurant) => {
          const focused = restaurant.id === focusedRestaurantId;
          const detailUrl = resolvePlaceUrl(restaurant);
          return (
            <article
              className={`card rest-row rest-focus-row ${focused ? 'is-focused' : ''}`}
              key={restaurant.id}
            >
              <button
                type="button"
                className="rest-row-select"
                onClick={() => setFocusedRestaurantId(restaurant.id)}
                aria-current={focused ? 'location' : undefined}
              >
                <div className="rest-thumb" style={{ backgroundImage: `url(${restaurant.image})` }} />
                <div className="rest-info">
                  <div className="final-name">
                    <strong>{restaurant.name}</strong>
                    <em className="accent">{restaurant.score}%</em>
                  </div>
                  <small className="muted-sm">
                    <MapPin size={12} /> {restaurant.city} · {restaurant.distance}
                  </small>
                  <p className="muted-sm">{restaurant.meta}</p>
                </div>
                <MapPin size={20} className={focused ? 'accent' : 'muted-sm'} aria-hidden="true" />
              </button>
              {detailUrl ? (
                <a
                  className="rest-detail-link"
                  href={detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${restaurant.name} 식당 정보 보기`}
                >
                  <ExternalLink size={14} />식당 정보 보기
                </a>
              ) : null}
            </article>
          );
        })}
      </div>

      {restaurantCandidates.length > 0 ? <div className="page-actions">
        <span className="muted-sm">
          {focusedRestaurant ? `${focusedRestaurant.name} 선택됨` : '확정할 식당을 선택하세요'}
        </span>
        <button
          type="button"
          className="button primary"
          disabled={!focusedRestaurant}
          onClick={() => confirmSchedule(focusedRestaurant.id, gset.recTime || '18:00')}
        >
          <Check size={16} />식당 확정하기
        </button>
      </div> : null}
    </main>
  );
}
