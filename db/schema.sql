create table if not exists site_settings (
  key text primary key,
  value text
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  media text,
  color text,
  url text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  price text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  project_type text,
  budget text,
  timeline text,
  message text,
  status text not null default 'unread',
  created_at timestamptz not null default now()
);

create table if not exists analytics (
  id bigint generated always as identity primary key,
  page text,
  created_at timestamptz not null default now()
);

alter table projects add column if not exists url text;
alter table services add column if not exists price text;

alter table site_settings enable row level security;
alter table projects enable row level security;
alter table services enable row level security;
alter table inquiries enable row level security;
alter table analytics enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

drop policy if exists site_settings_anon_select on site_settings;
create policy site_settings_anon_select on site_settings for select to anon, authenticated using (true);
drop policy if exists site_settings_auth_all on site_settings;
create policy site_settings_auth_all on site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_anon_select on projects;
create policy projects_anon_select on projects for select to anon, authenticated using (visible = true);
drop policy if exists projects_auth_all on projects;
create policy projects_auth_all on projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists services_anon_select on services;
create policy services_anon_select on services for select to anon, authenticated using (visible = true);
drop policy if exists services_auth_all on services;
create policy services_auth_all on services for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists inquiries_anon_insert on inquiries;
create policy inquiries_anon_insert on inquiries for insert to anon with check (true);
drop policy if exists inquiries_auth_select on inquiries;
create policy inquiries_auth_select on inquiries for select to authenticated using (public.is_admin());
drop policy if exists inquiries_auth_update on inquiries;
create policy inquiries_auth_update on inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists inquiries_auth_delete on inquiries;
create policy inquiries_auth_delete on inquiries for delete to authenticated using (public.is_admin());

drop policy if exists analytics_anon_insert on analytics;
create policy analytics_anon_insert on analytics for insert to anon with check (true);
drop policy if exists analytics_auth_select on analytics;
create policy analytics_auth_select on analytics for select to authenticated using (public.is_admin());

alter table inquiries alter column status set default 'unread';
alter table inquiries drop constraint if exists inquiries_name_len;
alter table inquiries add constraint inquiries_name_len check (char_length(name) <= 100) not valid;
alter table inquiries drop constraint if exists inquiries_email_len;
alter table inquiries add constraint inquiries_email_len check (char_length(email) <= 254) not valid;
alter table inquiries drop constraint if exists inquiries_message_len;
alter table inquiries add constraint inquiries_message_len check (char_length(message) <= 5000) not valid;
alter table inquiries drop constraint if exists inquiries_status_valid;
alter table inquiries add constraint inquiries_status_valid check (status in ('unread','read')) not valid;

insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists media_auth_insert on storage.objects;
create policy media_auth_insert on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_auth_update on storage.objects;
create policy media_auth_update on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_auth_delete on storage.objects;
create policy media_auth_delete on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

alter table services add column if not exists icon_url text;
alter table services add column if not exists cinema_url text;

alter table projects add column if not exists featured boolean not null default false;

notify pgrst, 'reload schema';
