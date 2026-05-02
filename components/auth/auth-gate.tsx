'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { hasSupabase, supabase } from '@/lib/supabase';

const getRedirectUrl = () => {
  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  if (isLocalhost) return window.location.origin;

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  const url = configuredSiteUrl || (vercelUrl ? `https://${vercelUrl}` : window.location.origin);

  return url.replace(/\/$/, '');
};

const getAuthErrorMessage = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const errorCode = params.get('error_code');
  const errorDescription = params.get('error_description');

  if (!params.get('error')) return '';

  if (errorCode === 'otp_expired') {
    return 'Ссылка для входа недействительна или уже была использована. Запросите новую ссылку.';
  }

  return errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : 'Не удалось войти. Запросите новую ссылку.';
};

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Проверяем доступ...');

  useEffect(() => {
    if (!hasSupabase || !supabase) return;

    const authError = getAuthErrorMessage();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setStatus(authError);

      if (authError) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(authError);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!hasSupabase) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-4">
          <h1 className="break-words text-xl font-semibold">Supabase не настроен</h1>
          <p className="mt-2 break-words text-sm text-slate-500">
            Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY в окружение.
          </p>
        </Card>
      </main>
    );
  }
  if (session) return <>{children}</>;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !email.trim()) return;

    setStatus('Отправляем ссылку...');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: getRedirectUrl()
      }
    });

    setStatus(error ? error.message : 'Проверьте почту и откройте ссылку для входа.');
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm p-4">
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <h1 className="break-words text-xl font-semibold">Вход в семейное дерево</h1>
            <p className="mt-1 break-words text-sm text-slate-500">Введите email, приглашённый в Supabase Auth.</p>
          </div>
          <Input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit" className="w-full">Получить ссылку</Button>
          {status && <p className="break-words text-sm text-slate-500">{status}</p>}
        </form>
      </Card>
    </main>
  );
}
