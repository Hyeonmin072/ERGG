-- Supabase에 남아 있던 초기 실험용 테이블 제거 (운영은 games / game_details / players 사용).
-- 적용 전: public.game, public.game_detail, public.user 에 대한 FK가 없는지 확인.
DROP TABLE IF EXISTS public.game_detail;
DROP TABLE IF EXISTS public.game;
DROP TABLE IF EXISTS public."user";
