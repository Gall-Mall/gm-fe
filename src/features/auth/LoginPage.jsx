export function LoginPage({ flow }) {
  const { doLogin, goToStep, afterLogin } = flow;
  return (
    <div className="screen login-screen">
      <div className="login-inner">
        <div className="login-hero">
          <div className="brand-inline">
            <span className="brand-badge">갈</span>
            <strong>갈래말래</strong>
          </div>
          <h1 className="login-title">갈래? 말래?<br />애매하긴해?</h1>
          <p className="login-lead">친구들의 입맛과 조건을 한 번에 모아, 모두가 납득하는 맛집을 카드 투표로 정합니다.</p>
          <div className="chip-wrap">
            <span className="pill like">갈래 3</span>
            <span className="pill maybe">애매하긴해 1</span>
            <span className="pill neutral">말래 0</span>
          </div>
        </div>
        <div className="login-card">
          <h2>지금 시작하기</h2>
          <p className="muted">소셜 계정으로 바로 그룹에 참여하세요.</p>
          <div className="login-buttons">
            <button type="button" className="social kakao" onClick={doLogin}>카카오로 시작하기</button>
            <button type="button" className="social naver" onClick={doLogin}>네이버로 시작하기</button>
          </div>
          {afterLogin === 'dashboard' ? (
            <p className="login-note">그룹에 참여하려면 로그인이 필요해요. 로그인하면 바로 참여돼요.</p>
          ) : null}
          <button type="button" className="link-btn" onClick={() => goToStep('home')}>먼저 둘러볼래요</button>
          <button type="button" className="demo-btn" onClick={() => goToStep('invite')}>
            데모: 초대 링크로 참가 화면 보기
          </button>
          <small className="fineprint">계속하면 이용약관·개인정보 처리방침에 동의합니다.</small>
        </div>
      </div>
    </div>
  );
}
