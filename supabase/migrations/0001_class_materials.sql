-- 0001_class_materials.sql  (anf-website, shares the CRM Supabase project)
--
-- Code-locked class materials. An attendee scans the QR, lands on /class,
-- enters the code you showed in class, and the matching worksheet unlocks.
--
-- Mirrors the private-event unlock pattern: the table is NOT readable by the
-- anon key. The only way in is the security-definer RPC, which returns just
-- the worksheet slug + title when the code matches. So the codes are never
-- exposed in the browser bundle, and you can change a code without a redeploy.

create table if not exists public.class_materials (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,   -- which worksheet to render, e.g. 'getting-real-ai'
  title       text not null,
  access_code text not null,          -- the code you give attendees; change per class
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.class_materials enable row level security;
-- Intentionally NO anon select policy: the table is only reachable via the RPC.

-- Returns the worksheet slug + title when the code matches an active row,
-- otherwise nothing. Case-insensitive and trimmed.
create or replace function public.class_unlock(p_code text)
returns table (slug text, title text)
language sql
security definer
set search_path = public
as $$
  select m.slug, m.title
  from public.class_materials m
  where m.is_active
    and lower(trim(m.access_code)) = lower(trim(p_code))
  limit 1;
$$;

grant execute on function public.class_unlock(text) to anon, authenticated;

-- Seed the Getting Real With AI workbook. CHANGE THE CODE before you teach:
--   update public.class_materials set access_code = 'YOURCODE' where slug = 'getting-real-ai';
insert into public.class_materials (slug, title, access_code)
values ('getting-real-ai', 'Getting Real With AI Workbook', 'REALAI')
on conflict (slug) do nothing;
