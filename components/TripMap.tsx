'use client';

import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
      Загрузка карты…
    </div>
  ),
});

type Props = {
  latitude: number;
  longitude: number;
};

export function TripMap({ latitude, longitude }: Props) {
  return <MapPicker latitude={latitude} longitude={longitude} onChange={() => {}} />;
}