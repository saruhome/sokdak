-- slang(속어) 카테고리 첫 단어 3개 (2026-08-30, 운영자 지시: 성인인증+프리미엄 플로우 테스트용).
-- 규칙: 욕설+직장 단어는 slang 주 + work 보조. 열람은 프리미엄 AND 성인 확인 필요(앱 게이트).

begin;

insert into public.words (id, word, romanization, category, secondary_category, short_desc, pronunciation, meanings, origin, usage, related_words, likes, saves, translations) values
('101', '좆소', 'Jot-So', 'slang', 'work', '열악한 중소기업을 비하하는 거친 속어', '[졷-쏘]',
 '[{"type":"명사","definition":"급여·복지가 열악한 중소기업을 비하해 부르는 비속어. 순화형 ''좋좋소''보다 훨씬 거친 원형 표현.","examples":[{"kor":"이런 좆소는 빨리 탈출해야 해.","eng":"You need to escape this shitty small company fast.","ja":"こんなクソ中小企業は早く脱出しないと。","es":"Hay que escapar rápido de esta empresucha de mierda.","vi":"Phải thoát khỏi cái công ty rác này sớm.","de":"Aus so einem Drecksladen muss man schnell raus."}]}]'::jsonb,
 '비속어 ''좆''+''중소기업''의 합성 — 발음을 순화한 ''좋소''(웹드라마 ''좋좋소'')의 원형',
 '직장인 커뮤니티에서 중소기업의 열악한 환경을 거칠게 비하할 때. 공적인 자리에서는 쓰면 안 되는 비속어.',
 array['좋좋소','넵병'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Shitty small company (vulgar)"},{"lang":"🇯🇵 JA","text":"クソ中小企業(卑語)"},{"lang":"🇨🇳 ZH","text":"垃圾小公司(粗俗)"},{"lang":"🇻🇳 VI","text":"Công ty nhỏ tồi tệ (thô tục)"},{"lang":"🇪🇸 ES","text":"Empresucha de mierda (vulgar)"},{"lang":"🇩🇪 DE","text":"Mieser Drecksladen (vulgär)"}]'::jsonb),
('102', '존맛탱', 'Jon-Mat-Taeng', 'slang', 'daily', '아주 맛있다는 뜻의 속어 — JMT', '[존-맏-탱]',
 '[{"type":"형용사/명사","definition":"''매우 맛있다''를 강조하는 속어. 영문 이니셜 JMT로도 널리 쓰인다.","examples":[{"kor":"이 집 떡볶이 존맛탱이야.","eng":"The tteokbokki here is insanely good.","ja":"ここのトッポッキ、めちゃくちゃうまい。","es":"El tteokbokki de aquí está buenísimo de locos.","vi":"Tteokbokki quán này ngon dã man.","de":"Das Tteokbokki hier ist der Wahnsinn."}]}]'::jsonb,
 '비속어 ''존나''(매우)+''맛''+접미 ''탱''의 합성',
 '음식이 아주 맛있을 때 쓰는 캐주얼한 속어. 어원이 거칠어 격식 있는 자리에서는 부적절.',
 array['JMT','맛집'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Insanely delicious (vulgar origin)"},{"lang":"🇯🇵 JA","text":"超うまい(俗語)"},{"lang":"🇨🇳 ZH","text":"超好吃(俗)"},{"lang":"🇻🇳 VI","text":"Ngon dã man (thô tục)"},{"lang":"🇪🇸 ES","text":"Riquísimo (origen vulgar)"},{"lang":"🇩🇪 DE","text":"Wahnsinnig lecker (derb)"}]'::jsonb),
('103', '존버', 'Jon-Beo', 'slang', 'work', '악착같이 버틴다는 뜻의 속어', '[존-버]',
 '[{"type":"명사/동사","definition":"''끝까지 악착같이 버틴다''는 뜻의 속어. 주식·코인 커뮤니티에서 대중화되어 직장 생활 전반으로 확산.","examples":[{"kor":"월급날까지 존버한다.","eng":"Holding out hard until payday.","ja":"給料日までひたすら耐える。","es":"Aguantando a muerte hasta el día de pago.","vi":"Cố cầm cự tới ngày lĩnh lương.","de":"Bis zum Zahltag eisern durchhalten."}]}]'::jsonb,
 '비속어 ''존나''+''버티기''의 줄임',
 '힘든 상황(직장·투자 등)을 끝까지 버틸 때 쓰는 속어. 어원이 거칠어 공식 석상에는 부적합.',
 array['버티기'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Grinding it out (vulgar origin)"},{"lang":"🇯🇵 JA","text":"ひたすら耐える(俗語)"},{"lang":"🇨🇳 ZH","text":"死扛(俗)"},{"lang":"🇻🇳 VI","text":"Cố cầm cự (thô tục)"},{"lang":"🇪🇸 ES","text":"Aguantar a tope (origen vulgar)"},{"lang":"🇩🇪 DE","text":"Eisern durchhalten (derb)"}]'::jsonb);

commit;

-- 적용 후 확인: select count(*) from public.words where category = 'slang'; → 3