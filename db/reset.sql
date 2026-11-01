truncate table projects, services, inquiries, analytics, site_settings restart identity;

drop table if exists pillars;

alter table services drop column if exists cinema_type;
