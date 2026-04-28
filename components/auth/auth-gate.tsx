'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { hasSupabase, supabase } from '@/lib/supabase';

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Проверяем доступ...');

  useEffect(() => {
    if (!hasSupabase || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setStatus('');
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus('');
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
        emailRedirectTo: window.location.origin
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
