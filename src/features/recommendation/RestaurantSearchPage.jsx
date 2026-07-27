import { useState } from 'react';
import { ArrowLeft, Check, ExternalLink, MapPin, Search, X } from 'lucide-react';
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
  const [detailRestaurant, setDetailRestaurant] = useState(null);
  const [clusterRestaurants, setClusterRestaurants] = useState([]);

  const base = { lat: gset.lat ?? 37.5665, lng: gset.lng ?? 126.978 };
  const markers = restaurantCandidates.map((r) => ({
    id: r.id,
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

  const focusRestaurant = (restaurantId) => {
    setFocusedRestaurantId(restaurantId);
    setClusterRestaurants([]);
  };

  const showRestaurantDetail = (restaurant) => {
    focusRestaurant(restaurant.id);
    setDetailRestaurant(restaurant);
  };

  const handleMarkerClick = (marker) => {
    if (!marker?.id) return;
    if (marker.id === focusedRestaurantId) {
      const restaurant = restaurantCandidates.find((candidate) => candidate.id === marker.id);
      if (restaurant) showRestaurantDetail(restaurant);
      return;
    }
    focusRestaurant(marker.id);
  };

  const handleClusterClick = (clusterMarkers) => {
    const markerIds = new Set(clusterMarkers.map((marker) => marker.id));
    setDetailRestaurant(null);
    setClusterRestaurants(
      restaurantCandidates.filter((restaurant) => markerIds.has(restaurant.id)),
    );
  };

  const detailUrl = detailRestaurant ? resolvePlaceUrl(detailRestaurant) : null;

  return (
    <>
      <main className="screen page narrow">
      <button type="button" className="back-btn" onClick={() => goToStep('menuconfirmed')}><ArrowLeft size={16} />확정 메뉴</button>
      <header className="page-head col">
        <span className="tag">방장 · 식당 검색</span>
        <h1>{selMenu?.name ? `${selMenu.name} 식당` : '식당 검색'}</h1>
        <p className="muted">식당 카드를 누르면 지도에서 위치를 자세히 볼 수 있어요.</p>
      </header>

      <section className="card map-card restaurant-map-card">
        <div className="card-title"><span className="card-icon"><MapPin size={15} /></span><h2>지도에서 보기</h2></div>
        <div className="restaurant-map-shell">
          <KakaoMap
            center={base}
            markers={markers}
            focus={mapFocus}
            height={360}
            onMarkerClick={handleMarkerClick}
            onClusterClick={handleClusterClick}
          />
          {clusterRestaurants.length > 1 ? (
            <section className="map-cluster-panel" aria-label="겹친 위치의 식당 목록">
              <header className="map-overlay-head">
                <strong>이 위치의 식당 {clusterRestaurants.length}곳</strong>
                <button
                  type="button"
                  onClick={() => setClusterRestaurants([])}
                  aria-label="겹친 식당 목록 닫기"
                >
                  <X size={17} />
                </button>
              </header>
              <div className="map-cluster-list">
                {clusterRestaurants.map((restaurant) => (
                  <button
                    type="button"
                    key={restaurant.id}
                    onClick={() => focusRestaurant(restaurant.id)}
                    aria-label={`${restaurant.name} 선택`}
                  >
                    <strong>{restaurant.name}</strong>
                    <span>{restaurant.city} · {restaurant.distance}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
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

      {restaurantCandidates.length > 0 ? (
        <section className="card rest-list-panel" aria-label="식당 검색 결과">
          <div className="rest-list">
            {restaurantCandidates.map((restaurant) => {
              const focused = restaurant.id === focusedRestaurantId;
              const detailUrl = resolvePlaceUrl(restaurant);
              return (
                <article
                  className={`rest-row rest-focus-row ${focused ? 'is-focused' : ''}`}
                  key={restaurant.id}
                >
                  <button
                    type="button"
                    className="rest-row-select"
                    onClick={() => focusRestaurant(restaurant.id)}
                    aria-current={focused ? 'location' : undefined}
                    aria-label={`${restaurant.name} 지도에서 보기`}
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
                    <button
                      type="button"
                      className="rest-detail-link"
                      onClick={() => showRestaurantDetail(restaurant)}
                      aria-label={`${restaurant.name} 식당 정보 보기`}
                    >
                      <ExternalLink size={14} />정보
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

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

      {detailRestaurant && detailUrl ? (
        <div className="modal-overlay" onClick={() => setDetailRestaurant(null)}>
          <section
            className="modal-card restaurant-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${detailRestaurant.name} 상세 정보`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="map-overlay-head">
              <strong>{detailRestaurant.name}</strong>
              <div className="map-overlay-actions">
                <a href={detailUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />새 창
                </a>
                <button
                  type="button"
                  onClick={() => setDetailRestaurant(null)}
                  aria-label="식당 상세 정보 닫기"
                >
                  <X size={17} />
                </button>
              </div>
            </header>
            <iframe
              className="restaurant-detail-frame"
              src={detailUrl}
              title={`${detailRestaurant.name} 상세 정보`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        </div>
      ) : null}
    </>
  );
}
