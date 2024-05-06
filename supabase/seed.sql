DELETE FROM auth.audit_log_entries;
DELETE FROM auth.users;

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at") VALUES
	('00000000-0000-0000-0000-000000000000', '6c1fa005-558c-4c2c-be08-54ad99cf4f3d', 'authenticated', 'authenticated', 'azedval@gmail.com', '$2a$10$tWXdD964vHxMDwR8OcQrF.qe9c0uEo/AfFlOA4xObCwAZ/UynEecC', '2024-04-18 10:24:57.973897+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-04-18 10:24:57.968968+00', '2024-04-18 10:24:57.974096+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
	('00000000-0000-0000-0000-000000000000', 'e7fe05d3-e79a-43e1-82c2-c73ca1f67da4', 'authenticated', 'authenticated', 'fox@mail.com', '$2a$10$c9Z6ouZ.dCRz.tONJrP/wuy4LlfVLweXLeV.dvkxTQ8yWMyU9h.HK', '2024-04-18 10:25:16.463237+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-04-18 10:25:16.460258+00', '2024-04-18 10:25:16.463437+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
	('00000000-0000-0000-0000-000000000000', '4686d99d-32f7-4fe7-8df1-aa7bce0b5079', 'authenticated', 'authenticated', 'den.arger@gmail.com', '$2a$10$AkQkpddk6xdvCzX5e.J2WelZQ/YzkU724zYMKkW.dEO9SdklwscBm', '2024-04-18 09:32:29.567731+00', NULL, '', NULL, '', NULL, '', '', NULL, '2024-04-18 12:43:20.373857+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-04-18 09:32:29.562223+00', '2024-04-18 12:43:20.375625+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
	('00000000-0000-0000-0000-000000000000', 'e6a1ea58-6f44-4c73-865c-34f9ebf0f9ed', 'authenticated', 'authenticated', 'timur.yancev08@gmail.com', '$2a$10$eIS3.Wt0x.MTfV6.oG9B7eycRo4uIxcVv1/bIMekYRuyD/TlILkHK', '2024-04-18 13:09:51.639592+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-04-18 13:09:51.635578+00', '2024-04-18 13:09:51.639802+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);

INSERT INTO "public"."projects" ("name", "user_id") VALUES
  ('Test Project', '6c1fa005-558c-4c2c-be08-54ad99cf4f3d'),
  ('Test Project', 'e7fe05d3-e79a-43e1-82c2-c73ca1f67da4'),
  ('Test Project', '4686d99d-32f7-4fe7-8df1-aa7bce0b5079'),
  ('Test Project', 'e6a1ea58-6f44-4c73-865c-34f9ebf0f9ed');

INSERT INTO "public"."tokens" ("id","user_id","name") VALUES
('11111111-1111-1111-1111-111111111111', 'e7fe05d3-e79a-43e1-82c2-c73ca1f67da4', '11111111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111112', '6c1fa005-558c-4c2c-be08-54ad99cf4f3d', '11111111-1111-1111-1111-111111111112'),
('11111111-1111-1111-1111-111111111113', '4686d99d-32f7-4fe7-8df1-aa7bce0b5079', '11111111-1111-1111-1111-111111111113'),
('11111111-1111-1111-1111-111111111114', 'e6a1ea58-6f44-4c73-865c-34f9ebf0f9ed', '11111111-1111-1111-1111-111111111114');

INSERT INTO "public"."books" ("name","project_id") VALUES
('Tit','1'),
('Tit','2'),
('Tit','3'),
('Tit','4');

INSERT INTO "public"."checks" ("id","name","book_id","finished_at") VALUES
('11111111-1111-1111-1111-111111111111','Community','1','2025-05-02 12:21:55.090001+00'),
('11111111-1111-1111-1111-111111111112','Community','2','2025-05-02 12:21:55.090001+00'),
('11111111-1111-1111-1111-111111111113','Community','3','2025-05-02 12:21:55.090001+00'),
('11111111-1111-1111-1111-111111111114','Community','4','2025-05-02 12:21:55.090001+00');

INSERT INTO "public"."inspectors" ("id","name","check_id") VALUES
('11111111-1111-1111-1111-111111111111','Abraham','11111111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111112','Abraham','11111111-1111-1111-1111-111111111112'),
('11111111-1111-1111-1111-111111111113','Abraham','11111111-1111-1111-1111-111111111113'),
('11111111-1111-1111-1111-111111111114','Abraham','11111111-1111-1111-1111-111111111114');
