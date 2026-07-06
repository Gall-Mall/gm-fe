import { useState } from 'react';
import { Lock, Mail, Search, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/Button';

export function LoginPage({ goToStep }) {
  const [message, setMessage] = useState('');

  return (
    <main className="auth-page" aria-labelledby="auth-title">
      <section className="auth-panel">
        <span className="auth-logo">
          <ShieldCheck size={20} />
        </span>
        <h1 id="auth-title">Gallae Mallae</h1>
        <p>친구들과 납득 가능한 맛집 결정을 만드는 여행 도우미입니다.</p>
        <div className="login-card">
          <h2>다시 오셨군요</h2>
          <p>여행 그룹을 이어서 확인해보세요.</p>
          <Button className="full-width kakao" variant="plain" icon={Lock} onClick={() => setMessage('Kakao로 계속 진행할게요')}>
            Kakao로 계속하기
          </Button>
          <Button className="full-width" variant="outline" icon={Search} onClick={() => setMessage('Google로 계속 진행할게요')}>
            Google로 계속하기
          </Button>
          <Button className="full-width" variant="primary" icon={Mail} onClick={() => setMessage('Email로 계속 진행할게요')}>
            Email로 계속하기
          </Button>
          {message ? <strong className="auth-message">{message}</strong> : null}
          <small>계속하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.</small>
        </div>
        <Button variant="ghost" onClick={() => goToStep('groups')}>내 여행 그룹 보기</Button>
      </section>
    </main>
  );
}
