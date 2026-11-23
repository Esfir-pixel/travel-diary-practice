'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const res = await signIn(formData);
      if (res?.error) setError(res.error);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('NEXT_REDIRECT')) setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Вход</h1>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Вход…' : 'Войти'}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}