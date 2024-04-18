DELETE FROM auth.audit_log_entries;
DELETE FROM auth.users;


INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES

	('00000000-0000-0000-0000-000000000000', '08abf809-0989-4486-ac9a-612ae593f020', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"den.arger@gmail.com","user_id":"4686d99d-32f7-4fe7-8df1-aa7bce0b5079","user_phone":""}}', '2024-04-18 09:32:29.566608+00', '');
