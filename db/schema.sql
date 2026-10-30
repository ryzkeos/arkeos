alter table projects add column if not exists url text;
alter table services add column if not exists price text;

alter table site_settings enable row level security;
alter table projects enable row level security;
alter table services enable row level security;
alter table inquiries enable row level security;
alter table analytics enable row level security;

drop policy if exists site_settings_anon_select on site_settings;
create policy site_settings_anon_select on site_settings for select to anon using (true);
drop policy if exists site_settings_auth_all on site_settings;
create policy site_settings_auth_all on site_settings for all to authenticated using (true) with check (true);

drop policy if exists projects_anon_select on projects;
create policy projects_anon_select on projects for select to anon using (visible = true);
drop policy if exists projects_auth_all on projects;
create policy projects_auth_all on projects for all to authenticated using (true) with check (true);

drop policy if exists services_anon_select on services;
create policy services_anon_select on services for select to anon using (visible = true);
drop policy if exists services_auth_all on services;
create policy services_auth_all on services for all to authenticated using (true) with check (true);

drop policy if exists inquiries_anon_insert on inquiries;
create policy inquiries_anon_insert on inquiries for insert to anon with check (true);
drop policy if exists inquiries_auth_select on inquiries;
create policy inquiries_auth_select on inquiries for select to authenticated using (true);
drop policy if exists inquiries_auth_update on inquiries;
create policy inquiries_auth_update on inquiries for update to authenticated using (true) with check (true);
drop policy if exists inquiries_auth_delete on inquiries;
create policy inquiries_auth_delete on inquiries for delete to authenticated using (true);

drop policy if exists analytics_anon_insert on analytics;
create policy analytics_anon_insert on analytics for insert to anon with check (true);
drop policy if exists analytics_auth_select on analytics;
create policy analytics_auth_select on analytics for select to authenticated using (true);

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
create policy media_auth_insert on storage.objects for insert to authenticated with check (bucket_id = 'media');
drop policy if exists media_auth_update on storage.objects;
create policy media_auth_update on storage.objects for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
drop policy if exists media_auth_delete on storage.objects;
create policy media_auth_delete on storage.objects for delete to authenticated using (bucket_id = 'media');
