-- ㄱㅅ(감사 초성) 추가 (2026-09-03, 운영자 지시).
-- 기존 consonant 항목과 동일하게 격식있는 자리 주의 문구 포함.
--
-- NOTE: an earlier attempt in this session (production version
-- 20260903141626, add_gieut_siot_consonant_v2) ran with a subquery bug that
-- silently matched zero rows — it is recorded on the server but has no
-- matching file here since it changed nothing.

begin;

insert into public.slang_candidates (run_id, term, normalized_term, meaning_ko, meaning_en_draft, example, sources, review_note, draft_payload, status) values
(gen_random_uuid(),'ㄱㅅ','ㄱㅅ','''감사''의 초성, 채팅에서 짧게 고마움을 표할 때 쓰는 표현.','The consonant shorthand for ''gamsa'' (thanks).','도와줘서 ㄱㅅ',
 '["https://namu.wiki/w/%EC%B4%88%EC%84%B1%EC%B2%B4/%EB%AA%A9%EB%A1%9D"]'::jsonb,
 '무해한 초성체. 운영자 직접 지시로 즉시 승격.',
 '{"word":"ㄱㅅ","romanization":"G-S","category":"consonant","short_desc":"''감사''를 줄인 초성 표현","short_desc_i18n":{"en":"A consonant shorthand for ''thanks''","ja":"「感謝」の初声表現","es":"Abreviatura de consonantes para ''gracias''","vi":"Ký tự phụ âm cho ''cảm ơn''","de":"Ein Konsonantenkürzel für ''Danke''"},"pronunciation":"[기역시옷]","meanings":[{"type":"초성체","definition":"''감사''의 초성만 딴 표현. 채팅이나 댓글에서 빠르게 고마움을 표할 때 쓴다.","definition_i18n":{"en":"Consonants from ''gamsa'' (thanks); used to quickly express gratitude in chat or comments.","ja":"「感謝」の初声のみの表現。チャットやコメントで手早く感謝を伝える時に使う。","es":"Consonantes de ''gamsa'' (gracias); se usa para expresar gratitud rápidamente en chat o comentarios.","vi":"Phụ âm từ ''gamsa'' (cảm ơn); dùng để bày tỏ lòng biết ơn nhanh trong chat, bình luận.","de":"Konsonanten von ''gamsa'' (Danke); wird verwendet, um in Chat oder Kommentaren schnell Dankbarkeit auszudrücken."},"examples":[{"kor":"도와줘서 ㄱㅅ","eng":"Thx for the help","ja":"手伝ってくれてサンキュー","es":"Gracias por ayudar","vi":"Cảm ơn đã giúp nha","de":"Danke fürs Helfen"}]}],"origin":"''감사''의 초성만 남긴 인터넷 초성체. 게시판·메신저 문화에서 정착.","origin_i18n":{"en":"Consonants left from ''gamsa'' (thanks); settled into use through online board and messenger culture.","ja":"「感謝」の初声のみを残したネット表現。掲示板・メッセンジャー文化で定着。","es":"Consonantes de ''gamsa'' (gracias); asentado en foros y la cultura de mensajería.","vi":"Phụ âm còn lại từ ''gamsa'' (cảm ơn); định hình qua văn hóa diễn đàn, tin nhắn.","de":"Konsonanten von ''gamsa'' (Danke); etabliert durch Online-Foren und Messenger-Kultur."},"usage":"짧게 고마움을 표할 때 쓴다. 윗사람이나 회사 등 격식 있는 자리에서 쓰면 버릇없게 들릴 수 있다.","usage_i18n":{"en":"Used to briefly express thanks. Using it with superiors or in a formal workplace can come across as rude.","ja":"手短に感謝を伝える時に使う。目上の人や会社など公式な場で使うと失礼に聞こえることがある。","es":"Se usa para expresar agradecimiento brevemente. Usarlo con superiores o en un entorno laboral formal puede sonar irrespetuoso.","vi":"Dùng để bày tỏ cảm ơn ngắn gọn. Dùng với cấp trên hay ở công sở trang trọng có thể nghe thiếu lễ phép.","de":"Wird verwendet, um kurz Dank auszudrücken. Bei Vorgesetzten oder in einem formellen Arbeitsumfeld kann es respektlos wirken."},"related_words":["ㅊㅋ","감사"],"translations":[{"lang":"🇺🇸 EN","text":"Thx"},{"lang":"🇯🇵 JA","text":"サンキュー"},{"lang":"🇨🇳 ZH","text":"感谢的缩写"},{"lang":"🇻🇳 VI","text":"Cảm ơn (tắt)"},{"lang":"🇪🇸 ES","text":"Gracias"},{"lang":"🇩🇪 DE","text":"Danke"}]}'::jsonb,
 'published');

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select '180', dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (select draft_payload as dp from public.slang_candidates where term='ㄱㅅ' order by created_at desc limit 1) t;

commit;
