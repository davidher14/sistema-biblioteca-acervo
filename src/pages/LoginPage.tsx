import { useState } from 'react';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/api/authService';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

const loginSchema = z.object({
  email: z.string().trim().email('Digite um e-mail válido.'),
  senha: z.string().min(1, 'Digite sua senha.'),
});
const registerSchema = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome completo.').max(120, 'O nome deve ter no máximo 120 caracteres.'),
  email: z.string().trim().email('Digite um e-mail válido.').max(180, 'O e-mail deve ter no máximo 180 caracteres.'),
  senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(100, 'A senha deve ter no máximo 100 caracteres.'),
});
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type LoginLocation = Location & { state: { from?: { pathname: string } } | null };

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation() as LoginLocation;
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerMode, setRegisterMode] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });
  const {
    register: registerField,
    handleSubmit: handleRegisterSubmit,
    setError: setRegisterFieldError,
    setValue: setLoginValue,
    formState: { errors: registerErrors, isSubmitting: isRegistering },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-4">
        <div className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-surface p-6 shadow-card" role="status" aria-label="Verificando sua sessão">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <span className="text-sm text-text-muted">Verificando sua sessão...</span>
        </div>
      </main>
    );
  }
  if (user) return <Navigate to={location.state?.from?.pathname ?? '/'} replace />;

  async function onSubmit(values: LoginValues) {
    setServerError('');
    try {
      await login(values.email, values.senha);
      toast.success('Acesso realizado. Boas-vindas à biblioteca!');
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (field === 'email' || field === 'senha') setError(field, { message });
      });
      setServerError(Object.keys(fieldErrors).length ? '' : getErrorMessage(error, 'Não foi possível entrar. Verifique seus dados.'));
    }
  }

  async function onRegister(values: RegisterValues) {
    setRegisterError('');
    try {
      await authService.register({
        nome: values.nome.trim(),
        email: values.email.trim(),
        senha: values.senha,
      });
      setLoginValue('email', values.email.trim(), { shouldValidate: true });
      try {
        await login(values.email.trim(), values.senha);
      } catch {
        setRegisterMode(false);
        setServerError('Sua conta foi criada. Entre com seu e-mail e senha para continuar.');
        return;
      }
      toast.success('Conta de leitor criada. Boas-vindas à biblioteca!');
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (field === 'nome' || field === 'email' || field === 'senha') {
          setRegisterFieldError(field, { message });
        }
      });
      setRegisterError(Object.keys(fieldErrors).length ? '' : getErrorMessage(error, 'Não foi possível criar sua conta.'));
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f1ed] text-[#17332d]">
      <div className="grid min-h-screen md:grid-cols-[1.15fr_0.85fr]">
        <section
          className="relative hidden min-h-screen overflow-hidden bg-[#0d1f1d] md:block"
          aria-label="Imagem da biblioteca"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(8, 17, 14, 0.78) 0%, rgba(8, 17, 14, 0.52) 30%, rgba(8, 17, 14, 0.18) 100%), url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex h-full flex-col justify-between p-8 lg:p-12">
            <BrandLogo inverse size="default" />

            <div className="max-w-lg pb-10 text-white/95">
              <p className="mb-4 text-sm font-medium italic tracking-[0.12em] text-[#d9e4df]">
                “Sempre imaginei que o paraíso fosse uma espécie de biblioteca.”
              </p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">Jorge Luis Borges</p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12" aria-labelledby="login-title">
          <div className="w-full max-w-[420px]">
            <BrandLogo size="large" className="mb-8 md:mb-9" />

            <div className="mb-7">
              <h1 id="login-title" className="m-0 text-[2.3rem] font-medium leading-[1.05] tracking-[-0.06em] text-[#203b34]">
                {registerMode ? 'Crie sua conta' : 'Bem-vindo de volta'}
              </h1>
              <p className="mt-3 text-base text-[#5d6e68]">
                {registerMode ? 'Cadastre-se como leitor para consultar o acervo.' : 'Entre para gerenciar o acervo da biblioteca.'}
              </p>
            </div>

            {!registerMode ? <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-2">
                <label htmlFor="login-email" className="text-sm font-medium text-[#324a43]">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8883]" aria-hidden="true" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@biblioteca.com"
                    className="h-12 border-[#d7ddd6] bg-white pl-10 text-base shadow-sm placeholder:text-[#8a938d] focus-visible:ring-[#2d5c4d]"
                    hasError={Boolean(errors.email)}
                    aria-invalid={Boolean(errors.email)}
                    {...register('email')}
                  />
                </div>
                {errors.email?.message && <span className="text-xs text-[#b44848]">{errors.email.message}</span>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="login-password" className="text-sm font-medium text-[#324a43]">
                  Senha
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8883]" aria-hidden="true" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="admin123"
                    className="h-12 border-[#d7ddd6] bg-white pl-10 pr-12 text-base shadow-sm placeholder:text-[#8a938d] focus-visible:ring-[#2d5c4d]"
                    hasError={Boolean(errors.senha)}
                    aria-invalid={Boolean(errors.senha)}
                    {...register('senha')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[#52655e]"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                  </Button>
                </div>
                {errors.senha?.message && <span className="text-xs text-[#b44848]">{errors.senha.message}</span>}
              </div>

              {serverError && (
                <div className="flex items-start gap-2 rounded-md border border-[#e7b7b7] bg-[#fdf1f1] p-3 text-sm text-[#a94141]" role="alert">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <Button
                type="submit"
                className="mt-1 h-12 w-full justify-center rounded-xl bg-[#1c4a3d] text-base font-medium text-white shadow-md shadow-[#1c4a3d]/20 transition hover:bg-[#173d32]"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form> : <form className="grid gap-5" onSubmit={handleRegisterSubmit(onRegister)} noValidate>
              <div className="grid gap-2">
                <label htmlFor="register-name" className="text-sm font-medium text-[#324a43]">Nome completo</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8883]" aria-hidden="true" />
                  <Input
                    id="register-name"
                    autoComplete="name"
                    maxLength={120}
                    placeholder="Seu nome"
                    className="h-12 border-[#d7ddd6] bg-white pl-10 text-base shadow-sm placeholder:text-[#8a938d] focus-visible:ring-[#2d5c4d]"
                    hasError={Boolean(registerErrors.nome)}
                    aria-invalid={Boolean(registerErrors.nome)}
                    {...registerField('nome')}
                  />
                </div>
                {registerErrors.nome?.message && <span className="text-xs text-[#b44848]">{registerErrors.nome.message}</span>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="register-email" className="text-sm font-medium text-[#324a43]">E-mail</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8883]" aria-hidden="true" />
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    maxLength={180}
                    placeholder="voce@exemplo.com"
                    className="h-12 border-[#d7ddd6] bg-white pl-10 text-base shadow-sm placeholder:text-[#8a938d] focus-visible:ring-[#2d5c4d]"
                    hasError={Boolean(registerErrors.email)}
                    aria-invalid={Boolean(registerErrors.email)}
                    {...registerField('email')}
                  />
                </div>
                {registerErrors.email?.message && <span className="text-xs text-[#b44848]">{registerErrors.email.message}</span>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="register-password" className="text-sm font-medium text-[#324a43]">Senha</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8883]" aria-hidden="true" />
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    maxLength={100}
                    placeholder="Mínimo de 8 caracteres"
                    className="h-12 border-[#d7ddd6] bg-white pl-10 pr-12 text-base shadow-sm placeholder:text-[#8a938d] focus-visible:ring-[#2d5c4d]"
                    hasError={Boolean(registerErrors.senha)}
                    aria-invalid={Boolean(registerErrors.senha)}
                    {...registerField('senha')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[#52655e]"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                  </Button>
                </div>
                {registerErrors.senha?.message && <span className="text-xs text-[#b44848]">{registerErrors.senha.message}</span>}
              </div>

              {registerError && (
                <div className="flex items-start gap-2 rounded-md border border-[#e7b7b7] bg-[#fdf1f1] p-3 text-sm text-[#a94141]" role="alert">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{registerError}</span>
                </div>
              )}

              <Button
                type="submit"
                className="mt-1 h-12 w-full justify-center rounded-xl bg-[#1c4a3d] text-base font-medium text-white shadow-md shadow-[#1c4a3d]/20 transition hover:bg-[#173d32]"
                disabled={isRegistering}
                aria-busy={isRegistering}
              >
                {isRegistering ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Criando conta...</> : <>Criar conta de leitor<ArrowRight className="size-4" aria-hidden="true" /></>}
              </Button>
            </form>}

            <p className="mt-5 text-center text-sm text-[#5d6e68]">
              {registerMode ? 'Já tem uma conta?' : 'Não tem conta?'}{' '}
              <button
                type="button"
                className="rounded-sm font-semibold text-[#1c4a3d] underline underline-offset-4 hover:text-[#173d32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5c4d]"
                onClick={() => {
                  setRegisterMode((mode) => !mode);
                  setServerError('');
                  setRegisterError('');
                }}
              >
                {registerMode ? 'Entrar' : 'Criar conta'}
              </button>
            </p>

            {!registerMode && import.meta.env.VITE_USE_MOCK === 'true' && (
              <div className="mt-5 rounded-xl border border-[#dfe7e2] bg-[#f4f7f4] px-3 py-2 text-left text-[11px] leading-5 text-[#51625d]">
                <div className="font-medium text-[#334d46]">Acesso de demonstração</div>
                <div>
                  Admin: <a className="underline underline-offset-2" href="mailto:admin@biblioteca.com">admin@biblioteca.com</a> / admin123
                </div>
                <div>
                  Leitor: <a className="underline underline-offset-2" href="mailto:usuario@biblioteca.com">usuario@biblioteca.com</a> / usuario123
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
