create table if not exists public.partner_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  enabled boolean not null default false,
  starts_at timestamptz null,
  ends_at timestamptz null,
  destination_url text not null,
  promo_code text null,
  cta_text text not null default 'Shop now',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partner_campaigns enable row level security;

create or replace function public.set_partner_campaigns_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_partner_campaigns_updated_at on public.partner_campaigns;
create trigger trg_partner_campaigns_updated_at
before update on public.partner_campaigns
for each row
execute function public.set_partner_campaigns_updated_at();

insert into public.partner_campaigns (slug, name, enabled, destination_url, promo_code, cta_text)
values (
  'ouma',
  'Ouma Horse',
  true,
  'https://www.oumahorse.com',
  null,
  'Visit partner'
)
on conflict (slug) do nothing;
