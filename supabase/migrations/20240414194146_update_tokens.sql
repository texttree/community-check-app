drop function if exists "public"."add_token"();

drop function if exists "public"."add_token"(p_name text);

drop function if exists "public"."delete_token"(token_name text);

drop function if exists "public"."get_tokens"();

alter table "public"."tokens" alter column "created_at" set not null;

alter table "public"."tokens" alter column "name" set not null;

alter table "public"."tokens" enable row level security;

CREATE UNIQUE INDEX tokens_user_id_name_idx ON public.tokens USING btree (user_id, name);
