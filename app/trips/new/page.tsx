import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripForm } from '@/components/TripForm';

export default async function NewTripPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Новое путешествие</h1>
      <TripForm submitLabel="Создать путешествие" />
    </div>
  );
}