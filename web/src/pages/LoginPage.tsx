import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import {
  LockOutlined as LockIcon,
  EmailOutlined as EmailIcon,
  PersonOutlined as PersonIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, registerSchema } from '../schemas';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'email' | 'password', string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const schema = isRegister ? registerSchema : loginSchema;
    const validation = schema.safeParse(isRegister ? { name, email, password } : { email, password });

    if (!validation.success) {
      const errors: Partial<Record<'name' | 'email' | 'password', string>> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof errors;
        if (field && !errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      setError(validation.error.issues[0]?.message || 'Por favor, verifique os campos.');
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
      navigate('/connections');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-unni-sidebar px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-unni-accent">
              Unni<span className="text-white">Black</span>
            </span>
            <span className="text-xs text-unni-muted font-normal">| ∞ Mots Business Partners</span>
          </div>
          <p className="mt-2 text-sm text-unni-muted">
            Plataforma de Gestão e Disparos Inteligentes de WhatsApp
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-unni-border bg-unni-card p-8 shadow-xl">
          <div role="tablist" aria-label="Opções de acesso" className="mb-6 flex rounded-xl bg-[#0E1524] p-1 border border-[#25385C]">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              onClick={() => setIsRegister(false)}
              className={`w-1/2 rounded-lg py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                !isRegister
                  ? 'bg-[#1E2E4E] text-unni-accent shadow-sm border border-[#2E4674]'
                  : 'bg-transparent text-[#8E9EB5] border border-transparent hover:text-white'
              }`}
            >
              Acessar Conta
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              onClick={() => setIsRegister(true)}
              className={`w-1/2 rounded-lg py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                isRegister
                  ? 'bg-[#1E2E4E] text-unni-accent shadow-sm border border-[#2E4674]'
                  : 'bg-transparent text-[#8E9EB5] border border-transparent hover:text-white'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label htmlFor="login-name" className="mb-1 block text-xs font-semibold text-slate-300">
                  Nome Completo *
                </label>
                <TextField
                  id="login-name"
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={Boolean(fieldErrors.name)}
                  helperText={fieldErrors.name}
                  slotProps={{
                    input: {
                      startAdornment: <PersonIcon sx={{ color: '#8E9EB5', mr: 1, fontSize: 18 }} aria-hidden="true" />,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0E1524',
                      color: '#F1F5F9',
                      borderRadius: '0.5rem',
                      '& fieldset': { borderColor: fieldErrors.name ? '#F87171' : '#25385C' },
                      '&:hover fieldset': { borderColor: fieldErrors.name ? '#F87171' : '#54D1D6' },
                      '&.Mui-focused fieldset': { borderColor: fieldErrors.name ? '#F87171' : '#54D1D6' },
                    },
                    '& .MuiFormHelperText-root': { color: '#F87171', fontSize: '0.75rem', mt: 0.5 },
                  }}
                />
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-slate-300">
                E-mail Corporativo *
              </label>
              <TextField
                id="login-email"
                autoFocus={!isRegister}
                fullWidth
                size="small"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                slotProps={{
                  input: {
                    startAdornment: <EmailIcon sx={{ color: '#8E9EB5', mr: 1, fontSize: 18 }} aria-hidden="true" />,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0E1524',
                    color: '#F1F5F9',
                    borderRadius: '0.5rem',
                    '& fieldset': { borderColor: fieldErrors.email ? '#F87171' : '#25385C' },
                    '&:hover fieldset': { borderColor: fieldErrors.email ? '#F87171' : '#54D1D6' },
                    '&.Mui-focused fieldset': { borderColor: fieldErrors.email ? '#F87171' : '#54D1D6' },
                  },
                  '& .MuiFormHelperText-root': { color: '#F87171', fontSize: '0.75rem', mt: 0.5 },
                }}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1 block text-xs font-semibold text-slate-300">
                Senha de Acesso *
              </label>
              <TextField
                id="login-password"
                fullWidth
                size="small"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                slotProps={{
                  input: {
                    startAdornment: <LockIcon sx={{ color: '#8E9EB5', mr: 1, fontSize: 18 }} aria-hidden="true" />,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0E1524',
                    color: '#F1F5F9',
                    borderRadius: '0.5rem',
                    '& fieldset': { borderColor: fieldErrors.password ? '#F87171' : '#25385C' },
                    '&:hover fieldset': { borderColor: fieldErrors.password ? '#F87171' : '#54D1D6' },
                    '&.Mui-focused fieldset': { borderColor: fieldErrors.password ? '#F87171' : '#54D1D6' },
                  },
                  '& .MuiFormHelperText-root': { color: '#F87171', fontSize: '0.75rem', mt: 0.5 },
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-unni-accent py-3 text-sm font-semibold text-unni-accentText transition-all hover:bg-unni-accentHover active:scale-[0.99] disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span>{loading ? 'Processando...' : isRegister ? 'Cadastrar e Entrar' : 'Entrar no Sistema'}</span>
              <ArrowIcon sx={{ fontSize: 18 }} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
