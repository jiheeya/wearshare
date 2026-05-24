-- profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  location text,
  created_at timestamptz default now()
);

-- items
create table items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in ('uniform', 'graduation', 'cosplay', 'other')),
  size text not null,
  images text[] default '{}',
  handover_days int not null default 1,
  deposit_amount int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- availabilities
create table availabilities (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  check (end_date >= start_date)
);

-- rentals
create table rentals (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  borrower_id uuid not null references profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','pending','approved','rejected','returned','completed')),
  message text,
  deposit_amount int not null default 0,
  payment_key text,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','refunded')),
  created_at timestamptz default now(),
  check (end_date >= start_date)
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table items enable row level security;
alter table availabilities enable row level security;
alter table rentals enable row level security;

-- profiles policies
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- items policies
create policy "items_select" on items for select using (true);
create policy "items_insert" on items for insert with check (auth.uid() = owner_id);
create policy "items_update" on items for update using (auth.uid() = owner_id);
create policy "items_delete" on items for delete using (auth.uid() = owner_id);

-- availabilities policies
create policy "availabilities_select" on availabilities for select using (true);
create policy "availabilities_insert" on availabilities for insert
  with check (auth.uid() = (select owner_id from items where id = item_id));
create policy "availabilities_update" on availabilities for update
  using (auth.uid() = (select owner_id from items where id = item_id));
create policy "availabilities_delete" on availabilities for delete
  using (auth.uid() = (select owner_id from items where id = item_id));

-- rentals policies
create policy "rentals_select" on rentals for select
  using (
    auth.uid() = borrower_id
    or auth.uid() = (select owner_id from items where id = item_id)
  );
create policy "rentals_insert" on rentals for insert
  with check (auth.uid() = borrower_id);
create policy "rentals_update_borrower" on rentals for update
  using (auth.uid() = borrower_id)
  with check (status in ('returned'));
create policy "rentals_update_owner" on rentals for update
  using (auth.uid() = (select owner_id from items where id = item_id));
