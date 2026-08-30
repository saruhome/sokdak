-- 야르/샤갈 추가 (2026-08-30, 운영자 지시). new-slang 등록 규칙(신규 단어는 intake로).
-- 어원 검증: 둘은 틱톡 챌린지 "샤 샤 샤갈은 기분 나쁠 때, 야 야 야르는 기분 좋을 때"로
-- 묶여 퍼진 감탄사 쌍(2024 태동, 2025-26 정착). 야르는 1990년대 유행어의 재유행
-- (코미디언 류근일 콘텐츠 영향)이며 원 유래는 여러 설만 있어 확정 표기하지 않는다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations) values
('104', '야르', 'Ya-Reu', 'new-slang', '기분 좋을 때 외치는 긍정 감탄사',
 '{"en":"A hype shout for when things go your way","ja":"気分がいいときに叫ぶポジティブな感嘆詞","es":"Grito positivo para cuando algo sale bien","vi":"Tiếng reo tích cực khi có chuyện vui","de":"Ein Jubelruf, wenn etwas gut läuft"}'::jsonb,
 '[야르]',
 '[{"type":"감탄사","definition":"''앗싸'', ''나이스''처럼 기분 좋을 때 쓰는 긍정 감탄사. 1990년대에도 쓰이던 유행어가 2025년 전후 코미디언 류근일의 콘텐츠와 틱톡 챌린지로 되살아났다.","definition_i18n":{"en":"A positive exclamation like woohoo or nice; a 1990s catchphrase revived around 2025 through comedian Ryu Geun-il and a TikTok challenge.","ja":"「やったー」「ナイス」のようなポジティブな感嘆詞。90年代の流行語が2025年前後にコメディアンのコンテンツとTikTokチャレンジで復活。","es":"Exclamación positiva tipo ¡toma ya!; una expresión noventera revivida hacia 2025 por un cómico y un reto de TikTok.","vi":"Thán từ tích cực kiểu tuyệt vời; câu cửa miệng thập niên 90 sống lại quanh 2025 nhờ danh hài và trend TikTok.","de":"Ein positiver Ausruf wie Juhu; ein 90er-Spruch, um 2025 durch einen Komiker und eine TikTok-Challenge wiederbelebt."},"examples":[{"kor":"시험 끝났다, 야르~!","eng":"Exams are over — ya-reu!","ja":"試験終わった、ヤル〜!","es":"¡Se acabaron los exámenes, ya-reu!","vi":"Thi xong rồi, ya-reu~!","de":"Prüfungen vorbei — Ya-reu!"}]}]'::jsonb,
 '유래는 일본어 ''やるな(제법인데)'' 변형설, 과자 광고 감탄사설 등 여러 설이 있고 확정되지 않았다. 2025년 전후 코미디언 류근일 콘텐츠와 ''샤갈''과 짝을 이룬 틱톡 챌린지로 재유행.',
 '{"en":"Origin unsettled (theories: Japanese yaruna, a snack-ad shout). Revived around 2025 by comedian Ryu Geun-il and the TikTok chant pairing it with 샤갈.","ja":"由来は日本語「やるな」説など諸説あり未確定。2025年前後にコメディアン柳根一のコンテンツと「샤갈」とペアのTikTokチャレンジで再流行。","es":"Origen incierto (teorías: japonés yaruna, un anuncio de snacks). Revivió hacia 2025 con el cómico Ryu Geun-il y el reto de TikTok junto a 샤갈.","vi":"Nguồn gốc chưa rõ (giả thuyết: tiếng Nhật yaruna, quảng cáo bánh). Sống lại quanh 2025 nhờ danh hài Ryu Geun-il và trend TikTok cặp với 샤갈.","de":"Herkunft ungeklärt (Theorien: japanisch yaruna, ein Werbespruch). Um 2025 durch Komiker Ryu Geun-il und den TikTok-Chant mit 샤갈 wiederbelebt."}'::jsonb,
 '신나거나 일이 잘 풀렸을 때 혼잣말·추임새로 외친다. ''샤갈''(기분 나쁠 때)과 짝으로 쓰인다.',
 '{"en":"Shouted to yourself when excited or when something works out; pairs with 샤갈 (for bad moods).","ja":"うれしいときやうまくいったときの掛け声。「샤갈」(不機嫌なとき)とペアで使う。","es":"Se grita al emocionarse o cuando algo sale bien; hace pareja con 샤갈 (mal humor).","vi":"Reo lên khi phấn khích hay việc suôn sẻ; đi cặp với 샤갈 (khi bực).","de":"Ruft man bei Freude oder Erfolg; bildet ein Paar mit 샤갈 (schlechte Laune)."}'::jsonb,
 array['샤갈','무야호'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Woohoo! / yay (hype shout)"},{"lang":"🇯🇵 JA","text":"やったー!系の感嘆詞"},{"lang":"🇨🇳 ZH","text":"开心时的感叹词"},{"lang":"🇻🇳 VI","text":"Tiếng reo vui"},{"lang":"🇪🇸 ES","text":"¡Toma ya! (grito de alegría)"},{"lang":"🇩🇪 DE","text":"Juhu-Ausruf"}]'::jsonb),
('105', '샤갈', 'Sya-Gal', 'new-slang', '짜증 날 때 내뱉는 부정 감탄사',
 '{"en":"A grumpy exclamation for when annoyed","ja":"イラッとしたときに吐く否定的な感嘆詞","es":"Exclamación de fastidio","vi":"Thán từ bực bội khi khó chịu","de":"Ein genervter Ausruf"}'::jsonb,
 '[샤갈]',
 '[{"type":"감탄사","definition":"''에휴'', ''아이고''를 대신해 기분 나쁘거나 짜증 날 때 내뱉는 감탄사. ''야르''와 짝을 이루는 틱톡 밈으로, ''샤-샤-샤갈'' 리듬과 억양이 재미의 핵심.","definition_i18n":{"en":"An exclamation replacing ugh or sigh when annoyed; the TikTok-meme partner of 야르 — the sya-sya-syagal rhythm is half the fun.","ja":"イラッとしたとき「はぁ」の代わりに吐く感嘆詞。「야르」とペアのTikTokミームで、シャ・シャ・シャガルのリズムが面白さの核心。","es":"Exclamación que sustituye a uf cuando algo fastidia; pareja memética de 야르 en TikTok — el ritmo sya-sya-syagal es la gracia.","vi":"Thán từ thay cho hầy khi bực mình; cặp meme TikTok với 야르 — nhịp sya-sya-syagal chính là cái vui.","de":"Ein Ausruf statt Ächz bei Frust; der TikTok-Meme-Partner von 야르 — der Sya-sya-syagal-Rhythmus macht den Reiz aus."},"examples":[{"kor":"월요일이라니… 샤갈.","eng":"Monday again… sya-gal.","ja":"また月曜…シャガル。","es":"Otra vez lunes… sya-gal.","vi":"Lại thứ Hai… sya-gal.","de":"Schon wieder Montag … Sya-gal."}]}]'::jsonb,
 '''샤 샤 샤갈은 기분 나쁠 때, 야 야 야르는 기분 좋을 때'' 틱톡 챌린지 노래로 확산(2024 태동, 2025-26 정착). 단어 자체의 어원은 불확실하다.',
 '{"en":"Spread by the TikTok chant — sya-sya-syagal for bad moods, ya-ya-yareu for good moods (born 2024, mainstream by 2025-26). The word itself has no settled etymology.","ja":"「気分が悪いときはシャガル、いいときはヤル」というTikTokチャレンジの歌で拡散(2024年発生、25-26年定着)。単語自体の語源は不明。","es":"Difundido por el canto de TikTok — sya-sya-syagal para el mal humor, ya-ya-yareu para el bueno (nació en 2024, se asentó en 2025-26). La etimología es incierta.","vi":"Lan từ câu hát TikTok — sya-sya-syagal khi bực, ya-ya-yareu khi vui (ra đời 2024, phổ biến 2025-26). Từ nguyên chưa rõ.","de":"Verbreitet über den TikTok-Chant — sya-sya-syagal bei schlechter, ya-ya-yareu bei guter Laune (2024 entstanden, 2025-26 etabliert). Die Wortherkunft ist unklar."}'::jsonb,
 '가볍게 투덜댈 때 내뱉는다. 진지한 불만보다는 리듬 섞인 장난스러운 짜증 표현.',
 '{"en":"A light playful grumble, not a serious complaint — half rhythm, half annoyance.","ja":"軽くぼやくときに使う。真剣な不満というよりリズム混じりのおどけたイライラ表現。","es":"Un refunfuño ligero y juguetón, no una queja seria — mitad ritmo, mitad fastidio.","vi":"Càu nhàu nhẹ nhàng vui vui, không phải phàn nàn nghiêm túc — nửa nhịp điệu nửa bực.","de":"Leises, verspieltes Grummeln, keine ernste Beschwerde — halb Rhythmus, halb Frust."}'::jsonb,
 array['야르'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Ugh (annoyed groan)"},{"lang":"🇯🇵 JA","text":"はぁ…系の感嘆詞"},{"lang":"🇨🇳 ZH","text":"烦躁时的感叹词"},{"lang":"🇻🇳 VI","text":"Tiếng thở dài bực bội"},{"lang":"🇪🇸 ES","text":"Uf (fastidio)"},{"lang":"🇩🇪 DE","text":"Ächz-Ausruf"}]'::jsonb);

commit;

-- 적용 후 확인: select count(*) from public.words; → 34, new-slang 4개
