delete from site_settings where key in ('projects_count', 'years_active', 'clients_count');

do $$
declare
  r record;
  doc jsonb;
begin
  for r in select key, value from site_settings where key in ('copy_home', 'copy_shared') and coalesce(value, '') <> '' loop
    begin
      doc := r.value::jsonb;
    exception when others then
      raise notice 'skipped % (value is not valid json)', r.key;
      continue;
    end;
    if r.key = 'copy_home' then
      doc := doc - 'why_stats';
    else
      doc := doc #- '{cta,deco_a_type}' #- '{cta,deco_b_type}' #- '{cta,deco_c_type}' #- '{cta,deco_d_type}' #- '{section_media,type}';
    end if;
    update site_settings set value = case when doc = '{}'::jsonb then '' else doc::text end where key = r.key;
  end loop;
end $$;

do $$
declare
  n bigint;
begin
  if to_regclass('public.pillars') is not null then
    execute 'select count(*) from pillars' into n;
    if n = 0 then
      drop table pillars;
    else
      raise notice 'pillars kept: it still has % rows, export them first then drop table pillars', n;
    end if;
  end if;
end $$;

alter table services drop column if exists cinema_type;
