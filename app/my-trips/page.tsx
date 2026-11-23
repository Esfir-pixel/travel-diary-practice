import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripCard } from '@/components/TripCard';
import { buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { TripWithProfile } from '@/utils/types';

export default async function MyTripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: trips } = await supabase
    .from('trips')
    .select('*, profiles(id, email, full_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const list = (trips ?? []) as TripWithProfile[];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Мои путешествия</h1>
        <Link href="/trips/new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" />
          Добавить
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">Вы ещё не добавили ни одного путешествия</p>
          <Link href="/trips/new" className={buttonVariants()}>
            Создать первое путешествие
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}