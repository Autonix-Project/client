import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, Settings, Package, Truck, LogOut, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '대시보드', icon: LayoutDashboard },
    { path: '/orders', label: '주문 등록', icon: ClipboardList },
    { path: '/lines', label: '라인 관리', icon: Settings },
    { path: '/inventory', label: '재고 관리', icon: Package },
    { path: '/shipments', label: '배송 현황', icon: Truck },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Autonix</h1>
          <p className="text-sm text-muted-foreground mt-1">Smart Factory OS</p>
        </div>
        
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.name || '관리자'}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}