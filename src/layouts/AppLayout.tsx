import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Bookmark,
  LayoutDashboard,
  Layers3,
  Menu,
  RotateCcw,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog';
import { Header } from '../components/ui/Header';
import { NotificationsBell } from '../components/NotificationsBell';
import { Sidebar } from '../components/ui/Sidebar';
import { BrandLogo } from '../components/ui/BrandLogo';
import { cn } from '../lib/utils';

interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  end?: boolean;
}

const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/livros', label: 'Acervo de livros', icon: BookOpen },
  { to: '/autores', label: 'Autores', icon: UserRound },
  { to: '/categorias', label: 'Categorias', icon: Layers3 },
  { to: '/usuarios', label: 'Usuários', icon: UsersRound, adminOnly: true },
  { to: '/emprestimos', label: 'Empréstimos', icon: ArrowLeftRight },
  { to: '/devolucoes', label: 'Devoluções', icon: RotateCcw },
  { to: '/reservas', label: 'Reservas', icon: Bookmark, adminOnly: true },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3, adminOnly: true },
];

interface NavigationLinksProps {
  isAdmin: boolean;
  onNavigate?: () => void;
}

function NavigationLinks({ isAdmin, onNavigate }: NavigationLinksProps) {
  return (
    <>
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-primary-soft">Menu principal</p>
      {navigationItems
        .filter((item) => isAdmin || !item.adminOnly)
        .map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isActive ? 'bg-primary-soft text-primary' : 'text-surface hover:bg-primary-hover',
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span>{!isAdmin && to === '/emprestimos' ? 'Meus empréstimos' : label}</span>
          </NavLink>
        ))}
    </>
  );
}

function SidebarBrand({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <Link to="/" onClick={onNavigate} aria-label="Acervo Biblioteca — início" className="flex min-h-11 items-center rounded-xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <BrandLogo inverse />
      </Link>
      {mobile && (
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-surface hover:bg-primary-hover hover:text-surface"
            aria-label="Fechar menu"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </DialogClose>
      )}
    </div>
  );
}

function SidebarFooter() {
  return (
    <>
      <div className="flex gap-3 rounded-md bg-primary-hover p-3 text-primary-soft">
        <BookOpen className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="m-0 text-xs leading-5">
          <strong className="font-medium text-surface">Um bom livro muda tudo.</strong>
          <br />
          Cuide bem do seu acervo.
        </p>
      </div>
      <p className="mb-0 mt-4 px-2 text-xs font-medium uppercase tracking-wide text-primary-soft">
        Biblioteca · versão 1.0
      </p>
    </>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.perfil === 'admin';
  const currentPage = navigationItems.find((item) => item.to === pathname)?.label ?? 'Visão geral';

  async function handleLogout() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Não foi possível encerrar a sessão. Tente novamente.');
    }
  }

  const desktopSidebar = (
    <Sidebar
      className="hidden h-screen shrink-0 md:sticky md:top-0 md:flex"
      header={<SidebarBrand />}
      footer={<SidebarFooter />}
    >
      <NavigationLinks isAdmin={isAdmin} />
    </Sidebar>
  );

  return (
    <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
      <div className="flex min-h-screen bg-background text-text">
        {desktopSidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            userName={user?.nome ?? 'Usuário'}
            profile={isAdmin ? 'Administrador' : 'Usuário'}
            onLogout={() => { void handleLogout(); }}
            trailing={user ? <NotificationsBell key={user.id} user={user} /> : null}
            leading={(
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Abrir menu"
                  aria-expanded={menuOpen}
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
              </DialogTrigger>
            )}
          />
          <main className="w-full flex-1 px-4 py-7 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Breadcrumb
                className="text-[13px]"
                items={[{ label: 'Biblioteca' }, { label: currentPage }]}
              />
              <div className="mt-7"><Outlet /></div>
            </div>
          </main>
          <footer className="px-4 pb-5 text-xs text-text-muted sm:px-6 lg:px-8">
            Feito para quem acredita no poder das histórias.
          </footer>
        </div>
      </div>
      <DialogContent
        showClose={false}
        className="left-0 top-0 block h-[100dvh] max-h-none w-72 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-0 bg-primary p-0 shadow-none md:hidden"
      >
        <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
        <Sidebar
          className="h-full w-full overflow-y-auto"
          header={<SidebarBrand mobile onNavigate={() => setMenuOpen(false)} />}
          footer={<SidebarFooter />}
        >
          <NavigationLinks isAdmin={isAdmin} onNavigate={() => setMenuOpen(false)} />
        </Sidebar>
      </DialogContent>
    </Dialog>
  );
}
