-- Seed the new love (연애) category (operator instruction 2026-09-06).
-- 1) Register 남친/여친 as new dictionary entries under love.
-- 2) Tag existing romance-related words: 삼귀다/못해솔로 move their primary
--    category from the new-slang intake bucket to love; 금사빠/심쿵/완내스/
--    오빠/케미 keep their primary home and gain love as secondary.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations) values
('284', '남친', 'Nam-Chin', 'love', '''남자 친구''의 줄임말 — 사귀는 남자',
 '{"en":"Short for 남자 친구 — boyfriend","ja":"「男子(ナムジャ)チング」の略 — 彼氏","es":"Abreviatura de 남자 친구 — novio","vi":"Viết tắt của 남자 친구 — bạn trai","de":"Kurz für 남자 친구 — fester Freund"}'::jsonb,
 '[남친]',
 '[{"type":"명사","definition":"''남자 친구''의 줄임말. 연애 상대인 남자를 가리키며, 그냥 친한 남자인 ''남사친''과는 구분된다.","definition_i18n":{"en":"Short for 남자 친구 (boyfriend). Refers to a romantic partner — distinct from 남사친, a guy who is just a friend.","ja":"「남자 친구(男友達=彼氏)」の略。恋愛相手の男性を指し、ただの男友達「남사친」とは区別される。","es":"Abreviatura de 남자 친구 (novio). Se refiere a la pareja romántica, distinto de 남사친, un amigo sin romance.","vi":"Viết tắt của 남자 친구 (bạn trai). Chỉ người yêu nam — khác với 남사친 là bạn nam đơn thuần.","de":"Kurz für 남자 친구 (fester Freund). Meint den Partner — im Unterschied zu 남사친, einem rein platonischen Freund."},"examples":[{"kor":"주말에 남친이랑 한강 갔다 왔어.","eng":"I went to the Han River with my boyfriend over the weekend.","ja":"週末、彼氏と漢江に行ってきた。","es":"El finde fui al río Han con mi novio.","vi":"Cuối tuần mình đi sông Hàn với bạn trai.","de":"Am Wochenende war ich mit meinem Freund am Han-Fluss."}]}]'::jsonb,
 '''남자 친구''를 두 글자로 줄인 말. 1990년대 말 PC통신·문자 문화에서 굳어져 지금은 표준어처럼 널리 쓰인다.',
 '{"en":"A two-syllable clipping of 남자 친구, settled in late-1990s PC-comm and texting culture; now used practically like a standard word.","ja":"「남자 친구」を2文字に縮めた語。90年代末のパソコン通信・メール文化で定着し、今やほぼ標準語並みに使われる。","es":"Recorte de dos sílabas de 남자 친구, asentado en los chats y SMS de finales de los 90; hoy se usa casi como palabra estándar.","vi":"Dạng rút gọn hai âm tiết của 남자 친구, hình thành từ văn hóa chat cuối thập niên 90; nay dùng phổ biến như từ chuẩn.","de":"Zweisilbige Kurzform von 남자 친구, geprägt in der PC- und SMS-Kultur der späten 90er; heute quasi Standard."}'::jsonb,
 '전 연령이 쓰는 무난한 말. 소개할 때는 ''제 남자 친구''처럼 풀어 말하는 편이 격식 있다.',
 '{"en":"Neutral and used by all ages; in formal introductions the full 남자 친구 sounds more polite.","ja":"全世代が使う無難な語。フォーマルな紹介では「남자 친구」と略さず言う方が丁寧。","es":"Neutral y usado por todas las edades; al presentar formalmente suena mejor la forma completa 남자 친구.","vi":"Từ trung tính mọi lứa tuổi đều dùng; khi giới thiệu trang trọng nên nói đầy đủ 남자 친구.","de":"Neutral und generationsübergreifend; bei förmlichen Vorstellungen klingt die Langform 남자 친구 höflicher."}'::jsonb,
 array['여친','남사친','금사빠'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Boyfriend (short form)"},{"lang":"🇯🇵 JA","text":"彼氏(남자 친구の略)"},{"lang":"🇨🇳 ZH","text":"男朋友(缩略语)"},{"lang":"🇻🇳 VI","text":"Bạn trai (dạng rút gọn)"},{"lang":"🇪🇸 ES","text":"Novio (forma abreviada)"},{"lang":"🇩🇪 DE","text":"Fester Freund (Kurzform)"}]'::jsonb),
('285', '여친', 'Yeo-Chin', 'love', '''여자 친구''의 줄임말 — 사귀는 여자',
 '{"en":"Short for 여자 친구 — girlfriend","ja":"「女子(ヨジャ)チング」の略 — 彼女","es":"Abreviatura de 여자 친구 — novia","vi":"Viết tắt của 여자 친구 — bạn gái","de":"Kurz für 여자 친구 — feste Freundin"}'::jsonb,
 '[여친]',
 '[{"type":"명사","definition":"''여자 친구''의 줄임말. 연애 상대인 여자를 가리키며, 그냥 친한 여자인 ''여사친''과는 구분된다.","definition_i18n":{"en":"Short for 여자 친구 (girlfriend). Refers to a romantic partner — distinct from 여사친, a girl who is just a friend.","ja":"「여자 친구(女友達=彼女)」の略。恋愛相手の女性を指し、ただの女友達「여사친」とは区別される。","es":"Abreviatura de 여자 친구 (novia). Se refiere a la pareja romántica, distinto de 여사친, una amiga sin romance.","vi":"Viết tắt của 여자 친구 (bạn gái). Chỉ người yêu nữ — khác với 여사친 là bạn nữ đơn thuần.","de":"Kurz für 여자 친구 (feste Freundin). Meint die Partnerin — im Unterschied zu 여사친, einer rein platonischen Freundin."},"examples":[{"kor":"여친 생일이라 케이크 예약했어.","eng":"It''s my girlfriend''s birthday, so I ordered a cake.","ja":"彼女の誕生日だからケーキを予約した。","es":"Es el cumple de mi novia, así que reservé una tarta.","vi":"Sinh nhật bạn gái nên mình đặt bánh rồi.","de":"Meine Freundin hat Geburtstag, also habe ich eine Torte bestellt."}]}]'::jsonb,
 '''여자 친구''를 두 글자로 줄인 말. ''남친''과 짝을 이뤄 1990년대 말부터 굳어졌다.',
 '{"en":"A two-syllable clipping of 여자 친구, paired with 남친 since the late 1990s.","ja":"「여자 친구」を2文字に縮めた語。「남친」と対で90年代末から定着。","es":"Recorte de dos sílabas de 여자 친구, en pareja con 남친 desde finales de los 90.","vi":"Dạng rút gọn hai âm tiết của 여자 친구, đi cặp với 남친 từ cuối thập niên 90.","de":"Zweisilbige Kurzform von 여자 친구, seit Ende der 90er das Gegenstück zu 남친."}'::jsonb,
 '전 연령이 쓰는 무난한 말. 격식 자리에서는 ''여자 친구''로 풀어 말한다.',
 '{"en":"Neutral and used by all ages; say the full 여자 친구 in formal settings.","ja":"全世代が使う無難な語。フォーマルな場では「여자 친구」と略さず言う。","es":"Neutral y usado por todas las edades; en contextos formales se dice completo, 여자 친구.","vi":"Từ trung tính mọi lứa tuổi đều dùng; trong bối cảnh trang trọng nói đầy đủ 여자 친구.","de":"Neutral und generationsübergreifend; in förmlichen Situationen die Langform 여자 친구 verwenden."}'::jsonb,
 array['남친','여사친','금사빠'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Girlfriend (short form)"},{"lang":"🇯🇵 JA","text":"彼女(여자 친구の略)"},{"lang":"🇨🇳 ZH","text":"女朋友(缩略语)"},{"lang":"🇻🇳 VI","text":"Bạn gái (dạng rút gọn)"},{"lang":"🇪🇸 ES","text":"Novia (forma abreviada)"},{"lang":"🇩🇪 DE","text":"Feste Freundin (Kurzform)"}]'::jsonb);

-- Existing romance words: move intake-bucket entries to love, tag the rest.
update public.words set category = 'love' where id in ('225', '282');
update public.words set secondary_category = 'love' where id in ('121', '212', '117', '28', '179') and secondary_category is null;

commit;
