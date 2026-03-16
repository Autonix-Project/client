import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { toast } from 'sonner';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      login(username, password, response.token);
      toast.success('로그인 성공!');
      navigate('/');
    } catch (error) {
      toast.error('로그인 실패. 아이디와 비밀번호를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Autonix</h1>
            <p className="text-muted-foreground">Smart Factory OS 관리자 로그인</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm mb-2">
                관리자 ID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              데모용: 아무 ID/비밀번호나 입력하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}