CREATE TABLE IF NOT EXISTS
  public."TestCI" (
    id bigint generated by default as identity,
    created_at timestamp with time zone not null default now(),
    constraint TestCI_pkey primary key (id)
  ) tablespace pg_default;