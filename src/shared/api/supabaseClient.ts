/**
 * 도메인 분리 1단계 facade — 새 코드는 이 경로에서 Supabase client를 import한다.
 * 실제 client 생성은 아직 constants/supabase.ts에 있고(secureAuthStorage·database.types와
 * 함께 이동해야 해서 별도 단계), 이 파일은 새 경계를 먼저 고정하는 re-export다.
 */
export { supabase } from '../../../constants/supabase';
