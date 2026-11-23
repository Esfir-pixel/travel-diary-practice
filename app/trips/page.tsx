import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TripCard } from '@/components/TripCard';
import { buttonVariants } from '@/components/ui/button';
import { Plus, Map } from 'lucide-react';
import type { TripWithProfile } from '@/utils/types';

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: trips } = await supabase
    .from('trips')
    .select('*, profiles(id, email, full_name)')
    .order('created_at', { ascending: false });

  const list = (trips ?? []) as TripWithProfile[];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="relative mb-10 overflow-hidden rounded-3xl border bg-gradient-to-br from-[oklch(0.96_0.03_130)] via-[oklch(0.97_0.02_110)] to-[oklch(0.95_0.04_160)] p-8 sm:p-12">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[oklch(0.76_0.08_115)]/10 blur-2xl" />

        <div className="relative flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
              Дневник путешествий
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
              Путешествия<br />сообщества
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {list.length} {list.length === 1 ? 'запись' : 'записей'} — делись своими маршрутами и вдохновляй других
            </p>
          </div>

          {user && (
            <Link href="/trips/new" className={buttonVariants({ size: 'lg' })}>
              <Plus className="h-5 w-5 mr-2" />
              Добавить путешествие
            </Link>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-muted/30">
          <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Пока нет ни одного путешествия</p>
          {user && (
            <Link href="/trips/new" className={buttonVariants({ variant: 'outline' })}>
              Стать первым
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((trip, i) => (
            <div
              key={trip.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <TripCard trip={trip} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}