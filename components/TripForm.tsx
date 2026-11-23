'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTrip, updateTrip } from '@/app/actions';
import type { Trip } from '@/utils/types';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
      Загрузка карты…
    </div>
  ),
});

type Props = {
  initial?: Trip;
  submitLabel?: string;
};

export function TripForm({ initial, submitLabel = 'Сохранить' }: Props) {
  const [lat, setLat] = useState<number | null>(initial?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(initial?.longitude ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const res = initial
        ? await updateTrip(initial.id, formData)
        : await createTrip(formData);
      if (res && 'error' in res && res.error) setError(res.error);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('NEXT_REDIRECT')) setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Название путешествия *</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={initial?.title}
          placeholder="Например: Выходные в Казани"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          maxLength={5000}
          defaultValue={initial?.description ?? ''}
          placeholder="Что запомнилось, что посетили, советы другим путешественникам…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location_name">Локация *</Label>
        <Input
          id="location_name"
          name="location_name"
          required
          defaultValue={initial?.location_name}
          placeholder="Город, страна или конкретное место"
        />
      </div>

      <input type="hidden" name="latitude" value={lat ?? ''} />
      <input type="hidden" name="longitude" value={lng ?? ''} />

      <div className="space-y-2">
        <Label>Отметьте точку на карте (необязательно)</Label>
        <MapPicker
          latitude={lat}
          longitude={lng}
          onChange={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
        />
        {lat !== null && lng !== null && (
          <p className="text-xs text-muted-foreground">
            Координаты: {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Дата начала</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={initial?.start_date ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Дата окончания</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={initial?.end_date ?? ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost">Стоимость (₽)</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial?.cost ?? ''}
            placeholder="50000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="safety_rating">Безопасность (1–5)</Label>
          <select
            id="safety_rating"
            name="safety_rating"
            defaultValue={initial?.safety_rating?.toString() ?? ''}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Не указано</option>
            <option value="1">1 — Опасно</option>
            <option value="2">2 — Настороженно</option>
            <option value="3">3 — Нормально</option>
            <option value="4">4 — Безопасно</option>
            <option value="5">5 — Очень безопасно</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover">Обложка (одно фото)</Label>
        <Input id="cover" name="cover" type="file" accept="image/*" />
        {initial?.cover_url && (
          <p className="text-xs text-muted-foreground">
            Текущая обложка уже загружена. Новое фото заменит её.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_public"
          name="is_public"
          defaultChecked={initial?.is_public ?? true}
          className="h-4 w-4"
        />
        <Label htmlFor="is_public" className="cursor-pointer">
          Показывать в общей ленте
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Сохранение…' : submitLabel}
        </Button>
        <Link
          href="/my-trips"
          className={buttonVariants({ variant: 'outline' })}
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}