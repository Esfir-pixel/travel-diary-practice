import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TripMap } from '@/components/TripMap';
import { formatCost, formatDate, safetyLabel } from '@/lib/utils';
import { MapPin, Calendar, Wallet, Shield, ArrowLeft } from 'lucide-react';
import type { TripWithDetails } from '@/utils/types';

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from('trips')
    .select('*, profiles(id, email, full_name), trip_photos(*)')
    .eq('id', id)
    .single();

  if (!trip) notFound();

  const t = trip as TripWithDetails;
  const isAuthor = user?.id === t.user_id;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/trips" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад к ленте
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground mt-1">
              Автор: {t.profiles?.full_name || t.profiles?.email || 'Неизвестный'}
            </p>
          </div>
          {!t.is_public && <Badge variant="secondary">Приватное</Badge>}
        </div>
      </div>

      {t.cover_url && (
        <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-6">
          <Image src={t.cover_url} alt={t.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 800px" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{t.location_name}</span>
        </div>
        {t.start_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(t.start_date)}
              {t.end_date && ` — ${formatDate(t.end_date)}`}
            </span>
          </div>
        )}
        {t.cost !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span>{formatCost(t.cost)}</span>
          </div>
        )}
        {t.safety_rating !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>{safetyLabel(t.safety_rating)}</span>
          </div>
        )}
      </div>

      {t.latitude !== null && t.longitude !== null && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">На карте</h2>
          <TripMap latitude={t.latitude} longitude={t.longitude} />
        </div>
      )}

      {t.description && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Описание</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{t.description}</p>
        </div>
      )}

      {t.trip_photos && t.trip_photos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Галерея</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {t.trip_photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                <Image src={photo.url} alt={photo.caption ?? ''} fill className="object-cover" sizes="300px" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isAuthor && (
        <div className="flex gap-2 pt-4 border-t">
          <Link href={`/trips/${t.id}/edit`} className={buttonVariants({ variant: 'outline' })}>
            Редактировать
          </Link>
          <Link href="/my-trips" className={buttonVariants({ variant: 'ghost' })}>
            Мои путешествия
          </Link>
        </div>
      )}
    </div>
  );
}