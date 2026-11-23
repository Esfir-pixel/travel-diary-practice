import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Map, Plus, User } from 'lucide-react';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { full_name: string | null; email: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/trips" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.72_0.07_160)] shadow-sm group-hover:shadow-md transition-shadow">
            <Map className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">Дневник</span>
            <span className="text-xs text-muted-foreground font-normal -mt-0.5">путешествий</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/trips" className={buttonVariants({ variant: 'ghost' })}>
            Лента
          </Link>

          {user ? (
            <>
              <Link href="/my-trips" className={buttonVariants({ variant: 'ghost' })}>
                Мои путешествия
              </Link>
              <Link href="/trips/new" className={buttonVariants()}>
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Link>
              <Link
                href="/my-trips"
                className={buttonVariants({ variant: 'ghost' })}
                title={profile?.email ?? ''}
              >
                <User className="h-4 w-4 mr-1" />
                {profile?.full_name || 'Профиль'}
              </Link>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit">
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
                Войти
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}