import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Wallet, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCost, formatRelativeDate, safetyLabel } from '@/lib/utils';
import type { TripWithProfile } from '@/utils/types';

type Props = {
  trip: TripWithProfile;
};

export function TripCard({ trip }: Props) {
  return (
    <Link href={`/trips/${trip.id}`} className="group">
      <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {trip.cover_url ? (
            <Image
              src={trip.cover_url}
              alt={trip.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          {!trip.is_public && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Приватное
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{trip.title}</h3>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{trip.location_name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatRelativeDate(trip.start_date)}
              </span>
            )}
            {trip.cost !== null && (
              <span className="flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" />
                {formatCost(trip.cost)}
              </span>
            )}
            {trip.safety_rating !== null && (
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {safetyLabel(trip.safety_rating)}
              </span>
            )}
          </div>

          {trip.profiles?.full_name || trip.profiles?.email ? (
            <p className="text-xs text-muted-foreground pt-1 border-t">
              Автор: {trip.profiles.full_name || trip.profiles.email}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}