ALTER TABLE public.books
ADD COLUMN created_at timestamp with time zone not null default now();
