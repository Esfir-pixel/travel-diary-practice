'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Trip } from '@/utils/types';


// ВСПОМОГАТЕЛЬНАЯ: загрузка одного файла в Storage

async function uploadTripImage(
  file: File,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('trip-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from('trip-images').getPublicUrl(path);
  return data.publicUrl;
}


// СОЗДАНИЕ ПУТЕШЕСТВИЯ

export async function createTrip(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || null;
  const location_name = String(formData.get('location_name') || '').trim();
  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null;
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null;
  const costRaw = formData.get('cost');
  const cost = costRaw ? Number(costRaw) : null;
  const safetyRaw = formData.get('safety_rating');
  const safety_rating = safetyRaw ? Number(safetyRaw) : null;
  const start_date = String(formData.get('start_date') || '') || null;
  const end_date = String(formData.get('end_date') || '') || null;
  const is_public = formData.get('is_public') === 'on';

  if (!title || !location_name) {
    return { error: 'Название и локация обязательны' };
  }

  // Обложка
  const coverFile = formData.get('cover') as File | null;
  const cover_url = coverFile
    ? await uploadTripImage(coverFile, user.id, supabase)
    : null;

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title,
      description,
      location_name,
      latitude,
      longitude,
      cost,
      safety_rating,
      start_date,
      end_date,
      cover_url,
      is_public,
    })
    .select('id')
    .single();

  if (error) {
    console.error('createTrip:', error);
    return { error: error.message };
  }

  revalidatePath('/trips');
  revalidatePath('/my-trips');
  redirect(`/trips/${trip.id}`);
}


// ОБНОВЛЕНИЕ ПУТЕШЕСТВИЯ

export async function updateTrip(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const updates: Partial<Trip> = {
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || '').trim() || null,
    location_name: String(formData.get('location_name') || '').trim(),
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
    cost: formData.get('cost') ? Number(formData.get('cost')) : null,
    safety_rating: formData.get('safety_rating')
      ? Number(formData.get('safety_rating'))
      : null,
    start_date: String(formData.get('start_date') || '') || null,
    end_date: String(formData.get('end_date') || '') || null,
    is_public: formData.get('is_public') === 'on',
  };

  const coverFile = formData.get('cover') as File | null;
  if (coverFile && coverFile.size > 0) {
    const url = await uploadTripImage(coverFile, user.id, supabase);
    if (url) updates.cover_url = url;
  }

  const { error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/trips');
  revalidatePath(`/trips/${id}`);
  revalidatePath('/my-trips');
  redirect(`/trips/${id}`);
}


// УДАЛЕНИЕ ПУТЕШЕСТВИЯ

export async function deleteTrip(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/trips');
  revalidatePath('/my-trips');
  redirect('/my-trips');
}


// ДОБАВЛЕНИЕ ФОТО В ГАЛЕРЕЮ

export async function addTripPhoto(tripId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const file = formData.get('photo') as File | null;
  const caption = String(formData.get('caption') || '').trim() || null;

  if (!file || file.size === 0) return { error: 'Файл не выбран' };

  const url = await uploadTripImage(file, user.id, supabase);
  if (!url) return { error: 'Не удалось загрузить фото' };

  // Проверим, что путешествие принадлежит пользователю (RLS всё равно защитит)
  const { error } = await supabase.from('trip_photos').insert({
    trip_id: tripId,
    url,
    caption,
  });

  if (error) return { error: error.message };

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}


// УДАЛЕНИЕ ФОТО

export async function deleteTripPhoto(photoId: number, tripId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('trip_photos')
    .delete()
    .eq('id', photoId);

  if (error) return { error: error.message };

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}


// АУТЕНТИФИКАЦИЯ

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect('/trips');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const full_name = String(formData.get('full_name') || '');

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });
  if (error) return { error: error.message };

  redirect('/trips');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/trips');
}