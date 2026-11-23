import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripForm } from '@/components/TripForm';
import type { Trip } from '@/utils/types';

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (!trip || trip.user_id !== user.id) notFound();

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Редактировать путешествие</h1>
      <TripForm initial={trip as Trip} submitLabel="Сохранить изменения" />
    </div>
  );
}