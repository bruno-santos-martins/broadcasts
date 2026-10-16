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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@unnichat.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
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
          <div className="mb-6 flex rounded-xl bg-[#0E1524] p-1 border border-[#25385C]">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`w-1/2 rounded-lg py-2 text-xs font-semibold transition-all ${
                !isRegister
                  ? 'bg-[#1E2E4E] text-unni-accent shadow-sm border border-[#2E4674]'
                  : 'bg-transparent text-[#8E9EB5] border border-transparent hover:text-white'
              }`}
            >
              Acessar Conta
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`w-1/2 rounded-lg py-2 text-xs font-semibold transition-all ${
                isRegister
                  ? 'bg-[#1E2E4E] text-unni-accent shadow-sm border border-[#2E4674]'
                  : 'bg-transparent text-[#8E9EB5] border border-transparent hover:text-white'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Nome Completo
                </label>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <PersonIcon sx={{ color: '#8E9EB5', mr: 1, fontSize: 18 }} />,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0E1524',
                      color: '#F1F5F9',
                      borderRadius: '0.5rem',
                      '& fieldset': { borderColor: '#25385C' },
                      '&:hover fieldset': { borderColor: '#54D1D6' },
                      '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                    },
                  }}
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                E-mail Corporativo
              </label>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <EmailIcon sx={{ color: '#8E9EB5', mr: 1, fontSize: 18 }} />,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0E1524',
                    color: '#F1F5F9',
                    borderRadius: '0.5rem',
                    '& fieldset': { borderColor: '#25385C' },
                    '&:hover fieldset': { borderColor: '#54D1D6' },
                    '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                  },
                }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Senha de Acesso
              </label>
              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <LockIcon sx={{ color: '#8E9EB5', mr: 1, fontSize: 18 }} />,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0E1524',
                    color: '#F1F5F9',
                    borderRadius: '0.5rem',
                    '& fieldset': { borderColor: '#25385C' },
                    '&:hover fieldset': { borderColor: '#54D1D6' },
                    '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                  },
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-unni-accent py-3 text-sm font-semibold text-unni-accentText transition-all hover:bg-unni-accentHover active:scale-[0.99] disabled:opacity-50 shadow-sm"
            >
              <span>{loading ? 'Processando...' : isRegister ? 'Cadastrar e Entrar' : 'Entrar no Sistema'}</span>
              <ArrowIcon sx={{ fontSize: 18 }} />
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-unni-input/60 p-3 text-center text-xs text-unni-muted border border-unni-border/50">
            <span>Ambiente com dados mockados. Credencial padrão pré-preenchida.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
