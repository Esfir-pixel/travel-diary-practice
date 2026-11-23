
-- ДНЕВНИК ПУТЕШЕСТВИЙ — миграция
-- Добавляется к существующей БД bookstore без изменения старых таблиц

-- 1. ПУТЕШЕСТВИЯ
create table public.trips (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  title         text not null check (char_length(title) between 3 and 120),
  description   text check (char_length(description) <= 5000),
  location_name text not null,
  latitude      double precision check (latitude between -90 and 90),
  longitude     double precision check (longitude between -180 and 180),
  cost          numeric(12,2) check (cost >= 0),
  safety_rating int check (safety_rating between 1 and 5),
  start_date    date,
  end_date      date,
  cover_url     text,
  is_public     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.trips enable row level security;

create index idx_trips_user    on public.trips(user_id);
create index idx_trips_created on public.trips(created_at desc);
create index idx_trips_public  on public.trips(is_public) where is_public = true;

-- Переиспользуем функцию set_updated_at() из bookstore
create trigger trips_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

-- 2. ДОПОЛНИТЕЛЬНЫЕ ФОТО (галерея мест)
create table public.trip_photos (
  id         bigint primary key generated always as identity,
  trip_id    uuid references public.trips(id) on delete cascade not null,
  url        text not null,
  caption    text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.trip_photos enable row level security;
create index idx_trip_photos_trip on public.trip_photos(trip_id, sort_order);

-- 3. RLS-ПОЛИТИКИ
create policy "Public trips readable by all" on public.trips
  for select using (is_public = true or auth.uid() = user_id or public.is_admin());

create policy "Authors insert own trips" on public.trips
  for insert with check (auth.uid() = user_id);

create policy "Authors update own trips" on public.trips
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Authors delete own trips" on public.trips
  for delete using (auth.uid() = user_id);

create policy "Admins manage all trips" on public.trips
  for all using (public.is_admin());

create policy "Photos readable with trip" on public.trip_photos
  for select using (
    exists (
      select 1 from public.trips t
      where t.id = trip_photos.trip_id
        and (t.is_public = true or t.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors manage own trip photos" on public.trip_photos
  for all using (
    exists (
      select 1 from public.trips t
      where t.id = trip_photos.trip_id and t.user_id = auth.uid()
    )
  );

-- 4. GRANT
grant select on public.trips to anon;
grant select, insert, update, delete on public.trips to authenticated;
grant select on public.trip_photos to anon;
grant select, insert, update, delete on public.trip_photos to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- 5. STORAGE БАКЕТ
insert into storage.buckets (id, name, public)
values ('trip-images', 'trip-images', true)
on conflict do nothing;

create policy "Users upload own trip images" on storage.objects
  for insert with check (
    bucket_id = 'trip-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public read trip images" on storage.objects
  for select using (bucket_id = 'trip-images');

create policy "Users delete own trip images" on storage.objects
  for delete using (
    bucket_id = 'trip-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
