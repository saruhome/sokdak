-- Body translations for all 33 words: short_desc / usage / origin i18n
-- ({en, ja, es, vi, de}) plus definition_i18n merged into each meanings entry.
-- Korean source text is untouched. Vulgar slang entries (101-103) keep their
-- register and warnings in every language. Values use $j$ dollar-quoting so
-- apostrophes need no escaping; no ASCII double quotes inside JSON strings.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

update public.words set
  short_desc_i18n = $j${"en":"A super-sociable person who fits right into any group","ja":"とても社交的で、どんなグループにもすぐなじむ人","es":"Persona muy sociable que encaja en cualquier grupo","vi":"Người cực kỳ hòa đồng, nhóm nào cũng hợp","de":"Ein sehr geselliger Mensch, der in jede Gruppe passt"}$j$,
  usage_i18n = $j${"en":"Used on social media and in daily conversation with a complimentary nuance.","ja":"SNSや日常会話で、褒め言葉のニュアンスで使われる。","es":"Se usa en redes y conversaciones cotidianas con matiz de elogio.","vi":"Dùng trên mạng xã hội và trong đời thường với sắc thái khen ngợi.","de":"In sozialen Medien und im Alltag mit lobendem Unterton verwendet."}$j$,
  origin_i18n = $j${"en":"핵 (prefix: mega) + 인싸 (short for insider)","ja":"「핵」(接頭辞:非常に)+「인싸」(insiderの略)","es":"핵 (prefijo: muy) + 인싸 (abreviatura de insider)","vi":"핵 (tiền tố: cực) + 인싸 (viết tắt của insider)","de":"핵 (Präfix: mega) + 인싸 (kurz für Insider)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Compound of 핵 (mega) and 인싸 (insider): someone who mingles as the life of any group.","ja":"「핵」(非常に)と「인싸」(insider)の合成語。どんな集まりでも中心人物として活発になじむ人。","es":"Combinación de 핵 (muy) e 인싸 (insider): alguien que se integra como figura central de cualquier grupo.","vi":"Ghép từ 핵 (cực) và 인싸 (insider): người hòa nhập sôi nổi như nhân vật trung tâm của mọi nhóm.","de":"Zusammensetzung aus 핵 (mega) und 인싸 (Insider): jemand, der überall als zentrale Figur mitmischt."}$j$::jsonb)
where id = '1';

update public.words set
  short_desc_i18n = $j${"en":"God-tier perfection","ja":"神がかったほど完璧な状態","es":"Perfección de nivel divino","vi":"Hoàn hảo như thần thánh","de":"Gottgleiche Perfektion"}$j$,
  usage_i18n = $j${"en":"Used in K-pop fandom, gaming, and daily life for something outstandingly good.","ja":"K-POPファンダムやゲーム、日常で、極めて素晴らしいときに使う。","es":"En el fandom K-pop, los videojuegos y el día a día, cuando algo es excelente.","vi":"Dùng trong fandom K-pop, game và đời thường khi điều gì đó xuất sắc.","de":"In K-Pop-Fandom, Gaming und Alltag für etwas herausragend Gutes."}$j$,
  origin_i18n = $j${"en":"Blend of 갓 (God) and 완벽 (perfection)","ja":"「갓」(God)+「완벽」(完璧)の合成","es":"Combinación de 갓 (God) y 완벽 (perfección)","vi":"Ghép 갓 (God) với 완벽 (hoàn hảo)","de":"Zusammensetzung aus 갓 (God) und 완벽 (Perfektion)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Compound of God (갓) and 완벽 (perfect): perfection that reaches divine level.","ja":"God(갓)と完璧(완벽)の合成語。神の域に達した完璧さ。","es":"Compuesto de God (갓) y 완벽 (perfecto): una perfección que roza lo divino.","vi":"Từ ghép của God (갓) và 완벽 (hoàn hảo): sự hoàn hảo đạt tới cảnh giới thần thánh.","de":"Zusammensetzung aus God (갓) und 완벽 (perfekt): Perfektion auf göttlichem Niveau."}$j$::jsonb)
where id = '2';

update public.words set
  short_desc_i18n = $j${"en":"Groundless bashing; criticism forced without reason","ja":"根拠のない無理やりな批判","es":"Críticas forzadas y sin fundamento","vi":"Chê bai vô căn cứ, cố tình dìm","de":"Grundloses, erzwungenes Schlechtmachen"}$j$,
  usage_i18n = $j${"en":"Born in K-pop fandom; now used across the internet.","ja":"K-POPファンダム発祥で、今はネット全般で使われる。","es":"Nació en el fandom K-pop; hoy se usa en todo internet.","vi":"Bắt nguồn từ fandom K-pop, nay dùng khắp mạng.","de":"Aus dem K-Pop-Fandom, heute im ganzen Netz verbreitet."}$j$,
  origin_i18n = $j${"en":"억 from 억지로 (forcibly) + 까 from 깐다 (to bash)","ja":"「억지로」(無理やり)の「억」+「깐다」(けなす)の「까」","es":"억 de 억지로 (a la fuerza) + 까 de 깐다 (criticar)","vi":"억 từ 억지로 (gượng ép) + 까 từ 깐다 (chê bai)","de":"억 aus 억지로 (gewaltsam) + 까 aus 깐다 (niedermachen)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Short for 억지로 깐다 (to bash forcibly): criticizing someone without any reasonable grounds.","ja":"「억지로 깐다」(無理やりけなす)の略。合理的な根拠なしに無理やり非難する行為。","es":"Abreviatura de 억지로 깐다 (criticar a la fuerza): atacar sin fundamento razonable.","vi":"Rút gọn của 억지로 깐다 (cố tình chê): chỉ trích mà không có căn cứ hợp lý.","de":"Kurz für 억지로 깐다 (zwanghaft niedermachen): Kritik ohne vernünftige Grundlage."}$j$::jsonb)
where id = '3';

update public.words set
  short_desc_i18n = $j${"en":"The office habit of typing 넵! instead of a plain yes","ja":"メッセンジャーで「네」の代わりに「넵!」を連発する会社員の症状","es":"El hábito oficinista de responder 넵! en vez de un simple sí","vi":"Thói quen dân công sở gõ 넵! thay cho chữ vâng thường","de":"Die Büro-Angewohnheit, statt eines schlichten Ja immer 넵! zu tippen"}$j$,
  usage_i18n = $j${"en":"Self-deprecating office-life humor in worker communities.","ja":"会社員コミュニティで、オフィスライフの自嘲表現として使われる。","es":"Humor autocrítico sobre la vida de oficina en comunidades laborales.","vi":"Cách tự giễu đời công sở trong các cộng đồng dân văn phòng.","de":"Selbstironischer Büro-Humor in Arbeitnehmer-Communitys."}$j$,
  origin_i18n = $j${"en":"넵 (a cuter, eager yes) + 병 (disease; compulsive habit)","ja":"「넵」(「はい」の愛嬌ある形)+「병」(病:強迫的な癖)","es":"넵 (un sí entusiasta) + 병 (enfermedad; hábito compulsivo)","vi":"넵 (kiểu vâng dễ thương) + 병 (bệnh; thói quen cưỡng chế)","de":"넵 (ein eifriges Ja) + 병 (Krankheit; zwanghafte Gewohnheit)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Reflexively typing 넵! in work chats — an expression of excessive positivity and obedience.","ja":"メッセンジャーで反射的に「넵!」と打ってしまう現象。過剰な肯定と服従の表れ。","es":"Teclear 넵! por reflejo en el chat del trabajo: exceso de positividad y obediencia.","vi":"Gõ 넵! theo phản xạ trong chat công việc — biểu hiện tích cực và phục tùng quá mức.","de":"Das reflexhafte 넵! im Arbeitschat — Ausdruck übertriebener Zustimmung und Gehorsamkeit."}$j$::jsonb)
where id = '4';

update public.words set
  short_desc_i18n = $j${"en":"To be royally pissed off; extremely annoyed","ja":"ものすごく腹が立つ、極度にムカつく","es":"Estar muy cabreado; enfadadísimo","vi":"Tức điên, cực kỳ bực mình","de":"Königlich genervt; extrem wütend"}$j$,
  usage_i18n = $j${"en":"Common among people in their teens to 30s, online and offline.","ja":"10〜30代でオンライン・オフライン問わず使われる。","es":"Común entre los 10 y los 30 años, en línea y fuera.","vi":"Phổ biến ở lứa 10-30 tuổi, cả trên mạng lẫn ngoài đời.","de":"Verbreitet bei 10- bis 30-Jährigen, online wie offline."}$j$,
  origin_i18n = $j${"en":"킹 (King, intensifier prefix) + 열받다 (to get angry)","ja":"「킹」(King、強調接頭辞)+「열받다」(頭にくる)","es":"킹 (King, prefijo intensificador) + 열받다 (enfadarse)","vi":"킹 (King, tiền tố nhấn mạnh) + 열받다 (nổi giận)","de":"킹 (King, verstärkendes Präfix) + 열받다 (wütend werden)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Compound of the top-tier intensifier 킹 (king) and 열받다 (to get angry).","ja":"最上級の強調接頭辞「킹」(king)と「열받다」の合成。","es":"Compuesto del intensificador 킹 (king) y 열받다 (enfadarse).","vi":"Ghép tiền tố nhấn mạnh 킹 (king) với 열받다 (nổi giận).","de":"Zusammensetzung aus dem Verstärker 킹 (King) und 열받다 (wütend werden)."}$j$::jsonb)
where id = '5';

update public.words set
  short_desc_i18n = $j${"en":"The mood suddenly turns cold","ja":"急に場の空気が白ける","es":"El ambiente se enfría de golpe","vi":"Không khí bỗng dưng lạnh ngắt","de":"Die Stimmung kippt schlagartig"}$j$,
  usage_i18n = $j${"en":"Describes the vibe at gatherings or in social media comments.","ja":"集まりやSNSのコメントなどで、雰囲気を描写するのに使う。","es":"Describe el ambiente en reuniones o comentarios de redes.","vi":"Miêu tả bầu không khí trong buổi gặp hay bình luận mạng xã hội.","de":"Beschreibt die Stimmung bei Treffen oder in Social-Media-Kommentaren."}$j$,
  origin_i18n = $j${"en":"First syllables of 갑자기 (suddenly) + 분위기 (mood) + 싸해짐 (turning icy)","ja":"「갑자기」(急に)+「분위기」(雰囲気)+「싸해짐」(白けること)の頭文字","es":"Sílabas iniciales de 갑자기 (de repente) + 분위기 (ambiente) + 싸해짐 (enfriarse)","vi":"Chữ đầu của 갑자기 (đột nhiên) + 분위기 (bầu không khí) + 싸해짐 (lạnh đi)","de":"Anfangssilben von 갑자기 (plötzlich) + 분위기 (Stimmung) + 싸해짐 (frostig werden)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Abbreviation of 갑자기 분위기 싸해짐 — the mood suddenly went cold.","ja":"「갑자기 분위기 싸해짐」(急に雰囲気が白ける)の略。","es":"Abreviatura de 갑자기 분위기 싸해짐: el ambiente se enfrió de repente.","vi":"Rút gọn của 갑자기 분위기 싸해짐 — không khí đột nhiên lạnh ngắt.","de":"Abkürzung von 갑자기 분위기 싸해짐 — die Stimmung kippte plötzlich."}$j$::jsonb)
where id = '6';

update public.words set
  short_desc_i18n = $j${"en":"You know — assumes the listener already knows","ja":"相手がすでに知っている前提で使う表現","es":"Ya sabes — da por hecho que el otro lo sabe","vi":"Biết mà — mặc định người nghe đã biết","de":"Du weißt schon — setzt voraus, dass der andere es kennt"}$j$,
  usage_i18n = $j${"en":"Skips explanations between close friends and builds rapport.","ja":"親しい間柄で説明を省き、共感を作る。","es":"Entre amigos, omite explicaciones y crea complicidad.","vi":"Giữa bạn thân, lược bỏ giải thích và tạo sự đồng cảm.","de":"Spart unter Vertrauten Erklärungen und schafft Verbundenheit."}$j$,
  origin_i18n = $j${"en":"Colloquial shortening of (너도) 알잖아 — you know it too","ja":"「(너도) 알잖아」(君も知ってるでしょ)の口語的省略","es":"Reducción coloquial de (너도) 알잖아: tú también lo sabes","vi":"Rút gọn khẩu ngữ của (너도) 알잖아 — cậu cũng biết mà","de":"Umgangssprachliche Kurzform von (너도) 알잖아 — du kennst das doch"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Short for 너도 알잖아 — you know it too.","ja":"「너도 알잖아」(君も知ってるでしょ)の略。","es":"Abreviatura de 너도 알잖아: tú también lo sabes.","vi":"Rút gọn của 너도 알잖아 — cậu cũng biết mà.","de":"Kurz für 너도 알잖아 — du weißt es doch auch."}$j$::jsonb)
where id = '8';

update public.words set
  short_desc_i18n = $j${"en":"Legendary; good enough to go down in history","ja":"伝説的な、歴史に残るほど素晴らしい","es":"Legendario; digno de pasar a la historia","vi":"Huyền thoại; xuất sắc đáng ghi vào lịch sử","de":"Legendär; gut genug für die Geschichtsbücher"}$j$,
  usage_i18n = $j${"en":"All-purpose praise across K-pop, gaming, and sports.","ja":"K-POP、ゲーム、スポーツ全般で使われる万能の褒め言葉。","es":"Elogio comodín en K-pop, videojuegos y deportes.","vi":"Lời khen đa dụng trong K-pop, game và thể thao.","de":"Universallob in K-Pop, Gaming und Sport."}$j$,
  origin_i18n = $j${"en":"English legend → K-pop fandom → mainstream use","ja":"英語のlegend → K-POPファンダム → 一般に拡散","es":"Del inglés legend → fandom K-pop → uso general","vi":"Từ tiếng Anh legend → fandom K-pop → phổ biến rộng","de":"Englisch legend → K-Pop-Fandom → Alltagsgebrauch"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Korean rendering of the English word legend: something great enough to make history.","ja":"英語legendの韓国語発音。歴史に残るほど素晴らしい何か。","es":"Pronunciación coreana del inglés legend: algo tan bueno que hace historia.","vi":"Cách đọc tiếng Hàn của từ legend: điều tuyệt vời tới mức đi vào lịch sử.","de":"Koreanische Aussprache von legend: etwas, das Geschichte schreibt."}$j$::jsonb)
where id = '9';

update public.words set
  short_desc_i18n = $j${"en":"Binge-watching a series from episode one, in order","ja":"コンテンツを最初から最後まで順番に全部見ること","es":"Ver un contenido entero y en orden, de principio a fin","vi":"Cày trọn bộ từ tập đầu đến tập cuối theo thứ tự","de":"Eine Serie komplett und in Reihenfolge durchschauen"}$j$,
  usage_i18n = $j${"en":"Spread rapidly once streaming platforms went mainstream.","ja":"配信サービスの普及以降、急速に広まった。","es":"Se extendió rápido con la popularización del streaming.","vi":"Lan nhanh từ khi các nền tảng streaming phổ biến.","de":"Verbreitete sich rasant mit dem Streaming-Boom."}$j$,
  origin_i18n = $j${"en":"Short for 정방향 주행 (driving forward) — the opposite of 역주행","ja":"「정방향 주행」(順方向走行)の略 — 역주행(逆走)の反対概念","es":"Abreviatura de 정방향 주행 (conducir hacia delante), lo contrario de 역주행","vi":"Rút gọn của 정방향 주행 (chạy xuôi chiều) — ngược với 역주행","de":"Kurz für 정방향 주행 (vorwärts fahren) — das Gegenteil von 역주행"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Watching a drama or anime from episode 1 to the latest, all in order.","ja":"ドラマやアニメを1話から最新話まで順番に全部見る行為。","es":"Ver un drama o anime del episodio 1 al último, en orden.","vi":"Xem drama hay anime từ tập 1 đến tập mới nhất, theo đúng thứ tự.","de":"Ein Drama oder Anime von Folge 1 bis zur neuesten in Reihenfolge schauen."}$j$::jsonb)
where id = '10';

update public.words set
  short_desc_i18n = $j${"en":"A massive win; way better than expected","ja":"とてつもない得、予想よりずっといい結果","es":"Una ganancia enorme; mucho mejor de lo esperado","vi":"Món hời cực lớn, kết quả tốt hơn hẳn mong đợi","de":"Ein Riesengewinn; viel besser als erwartet"}$j$,
  usage_i18n = $j${"en":"An exclamation for shopping scores, deals, and lucky breaks.","ja":"買い物や取引、幸運な場面で使う感嘆表現。","es":"Exclamación para compras, tratos y golpes de suerte.","vi":"Câu cảm thán khi mua hời, giao dịch tốt hay gặp may.","de":"Ausruf bei Schnäppchen, Deals und Glücksfällen."}$j$,
  origin_i18n = $j${"en":"개 (slang intensifier prefix) + 이득 (gain)","ja":"「개」(強調接頭辞)+「이득」(利得)","es":"개 (prefijo intensificador de jerga) + 이득 (ganancia)","vi":"개 (tiền tố nhấn mạnh kiểu lóng) + 이득 (lợi)","de":"개 (Slang-Verstärkerpräfix) + 이득 (Gewinn)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"개 (very; intensifier) + 이득 (gain): when you score far more than expected.","ja":"「개」(非常に:強調)+「이득」。期待以上の恩恵や利益を得たとき。","es":"개 (muy; intensificador) + 이득 (beneficio): cuando obtienes más de lo esperado.","vi":"개 (rất; nhấn mạnh) + 이득 (lợi ích): khi nhận được lợi vượt mong đợi.","de":"개 (sehr; Verstärker) + 이득 (Gewinn): wenn man weit mehr bekommt als erwartet."}$j$::jsonb)
where id = '11';

update public.words set
  short_desc_i18n = $j${"en":"Watching a concert or game live, in person","ja":"コンサートや試合を直接行って見ること","es":"Ver un concierto o partido en persona","vi":"Đi xem trực tiếp buổi diễn hay trận đấu","de":"Ein Konzert oder Spiel live vor Ort sehen"}$j$,
  usage_i18n = $j${"en":"Essential K-pop fandom vocabulary for concerts and events.","ja":"K-POPファンダムのコンサート・イベント必須用語。","es":"Término esencial del fandom K-pop para conciertos y eventos.","vi":"Thuật ngữ thiết yếu của fandom K-pop về concert, sự kiện.","de":"Unverzichtbares Fandom-Vokabular für Konzerte und Events."}$j$,
  origin_i18n = $j${"en":"Short for 직접 관람 (watching in person)","ja":"「직접 관람」(直接観覧)の略","es":"Abreviatura de 직접 관람 (asistir en persona)","vi":"Rút gọn của 직접 관람 (xem trực tiếp)","de":"Kurz für 직접 관람 (persönlich zuschauen)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Short for 직접 관람: going to the venue and watching live.","ja":"「직접 관람」の略。コンサートや公演会場に直接行って見ること。","es":"Abreviatura de 직접 관람: ir al recinto y verlo en vivo.","vi":"Rút gọn của 직접 관람: đến tận nơi xem trực tiếp.","de":"Kurz für 직접 관람: hingehen und live dabei sein."}$j$::jsonb)
where id = '12';

update public.words set
  short_desc_i18n = $j${"en":"Your favorite member; the one you love most (your bias)","ja":"いちばん好きなメンバー、最愛の対象(推し)","es":"Tu miembro favorito; lo que más amas (tu bias)","vi":"Thành viên yêu thích nhất; đối tượng cưng nhất (bias)","de":"Das Lieblingsmitglied; wen man am meisten liebt (der Bias)"}$j$,
  usage_i18n = $j${"en":"Core K-pop fandom term, now extended to everyday favorites.","ja":"K-POPファンダムの中核用語。最近は日常の好みにも拡大。","es":"Término clave del fandom K-pop, hoy también para gustos cotidianos.","vi":"Thuật ngữ cốt lõi của fandom K-pop, nay mở rộng sang sở thích thường ngày.","de":"Zentraler Fandom-Begriff, inzwischen auch für Alltagsfavoriten."}$j$,
  origin_i18n = $j${"en":"Koreanized from the Japanese 推し (oshi)","ja":"日本語の「推し」に由来して韓国化した表現","es":"Coreanización del japonés 推し (oshi)","vi":"Bắt nguồn từ tiếng Nhật 推し (oshi), đã Hàn hóa","de":"Koreanisiert aus dem japanischen 推し (Oshi)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Short for 최고로 사랑함 (loved the most): the idol member you like best.","ja":"「최고로 사랑함」(最高に愛する)の略。K-POPで自分が一番好きなアイドルメンバーを指す。","es":"Abreviatura de 최고로 사랑함 (amar al máximo): el miembro idol que más te gusta.","vi":"Rút gọn của 최고로 사랑함 (yêu nhất): thành viên idol bạn thích nhất.","de":"Kurz für 최고로 사랑함 (am meisten geliebt): das Idol-Mitglied, das man am liebsten mag."}$j$::jsonb)
where id = '13';

update public.words set
  short_desc_i18n = $j${"en":"When older content belatedly climbs back into popularity","ja":"昔のコンテンツが後から人気を得る現象","es":"Cuando un contenido antiguo se vuelve popular tardíamente","vi":"Nội dung cũ bất ngờ nổi tiếng trở lại","de":"Wenn älterer Content verspätet populär wird"}$j$,
  usage_i18n = $j${"en":"Mostly about music charts, streaming, and viral posts.","ja":"音楽チャートや配信、SNSのバイラルでよく使われる。","es":"Sobre listas musicales, streaming y contenido viral.","vi":"Chủ yếu nói về BXH âm nhạc, streaming và nội dung viral.","de":"Vor allem bei Musikcharts, Streaming und viralen Posts."}$j$,
  origin_i18n = $j${"en":"Short for 역방향 주행 (driving in reverse) — opposite of 정주행","ja":"「역방향 주행」(逆方向走行)の略 — 정주행(順方向)の反対","es":"Abreviatura de 역방향 주행 (conducir en reversa), lo contrario de 정주행","vi":"Rút gọn của 역방향 주행 (chạy ngược chiều) — ngược với 정주행","de":"Kurz für 역방향 주행 (rückwärts fahren) — Gegenteil von 정주행"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"When an old song, drama, or film suddenly gets popular long after release.","ja":"古い歌やドラマ、映画が突然後から人気を集める現象。","es":"Cuando una canción, drama o película antigua triunfa mucho después.","vi":"Bài hát, phim cũ bỗng nhiên hot trở lại sau thời gian dài.","de":"Wenn ein alter Song oder Film plötzlich lange nach Erscheinen durchstartet."}$j$::jsonb)
where id = '14';

update public.words set
  short_desc_i18n = $j${"en":"For real; really — an emphasis word","ja":"マジで、本当に — 強調の感嘆詞","es":"En serio; de verdad — palabra de énfasis","vi":"Thật sự, thiệt luôn — từ nhấn mạnh","de":"Echt jetzt; wirklich — ein Verstärkerwort"}$j$,
  usage_i18n = $j${"en":"Widely used by teens and twenty-somethings to stress 진짜 (really).","ja":"10〜20代で「진짜」(本当)の強調として広く使われる。","es":"Muy usado entre jóvenes para enfatizar 진짜 (de verdad).","vi":"Giới trẻ 10-20 dùng rộng rãi để nhấn mạnh 진짜 (thật).","de":"Bei Teens und Twens als Verstärkung von 진짜 (wirklich) verbreitet."}$j$,
  origin_i18n = $j${"en":"From the 레알 (Real) in Real Madrid — settled into meaning real/true","ja":"レアル・マドリード(Real Madrid)の「레알(real)」の発音に由来し、「本当」の意味で定着","es":"Del 레알 (Real) de Real Madrid; se asentó con el sentido de verdadero","vi":"Từ cách đọc 레알 (Real) trong Real Madrid, cố định với nghĩa thật","de":"Vom 레알 (Real) in Real Madrid — etablierte sich in der Bedeutung echt"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Likely from the Spanish word Real; used to stress really, truly.","ja":"スペイン語のRealに由来するとされる。「진짜」「정말」を強調するときに使う。","es":"Probablemente del español Real; enfatiza de verdad.","vi":"Được cho là từ tiếng Tây Ban Nha Real; dùng để nhấn mạnh thật sự.","de":"Vermutlich vom spanischen Real; verstärkt wirklich, echt."}$j$::jsonb)
where id = '15';

update public.words set
  short_desc_i18n = $j${"en":"An exclamation of surprise or bafflement","ja":"驚きや戸惑いを表す感嘆詞","es":"Exclamación de sorpresa o desconcierto","vi":"Thán từ thể hiện ngạc nhiên, sững sờ","de":"Ausruf der Überraschung oder Fassungslosigkeit"}$j$,
  usage_i18n = $j${"en":"One of the most widely used Korean exclamations, by all ages.","ja":"老若男女を問わず最も広く使われる韓国語の感嘆詞のひとつ。","es":"Una de las exclamaciones coreanas más usadas por todas las edades.","vi":"Một trong những thán từ tiếng Hàn phổ biến nhất, mọi lứa tuổi.","de":"Einer der meistgenutzten koreanischen Ausrufe, in jedem Alter."}$j$,
  origin_i18n = $j${"en":"Exact origin unknown; spread as internet slang in the early 2000s.","ja":"正確な起源は不明。2000年代初めにネットスラングとして普及。","es":"Origen exacto desconocido; se difundió como jerga de internet a inicios de los 2000.","vi":"Nguồn gốc không rõ; lan truyền như tiếng lóng mạng đầu những năm 2000.","de":"Genaue Herkunft unbekannt; verbreitete sich Anfang der 2000er als Netzslang."}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"A one-syllable exclamation covering shock, disbelief, and embarrassment.","ja":"驚き、あきれ、戸惑いを一音節で表す感嘆詞。","es":"Exclamación de una sílaba para sorpresa, incredulidad y apuro.","vi":"Thán từ một âm tiết diễn tả ngạc nhiên, ngán ngẩm, bối rối.","de":"Ein einsilbiger Ausruf für Schock, Ungläubigkeit und Verlegenheit."}$j$::jsonb)
where id = '16';

update public.words set
  short_desc_i18n = $j${"en":"Real, genuine, true — stresses authenticity","ja":"本物、本心、真の — 本物であることを強調","es":"Real, genuino, verdadero — subraya autenticidad","vi":"Thật, chân thành, đích thực — nhấn mạnh tính thật","de":"Echt, aufrichtig, wahr — betont Echtheit"}$j$,
  usage_i18n = $j${"en":"Active in compounds like 찐친 (true friend) and 찐사랑 (true love).","ja":"「찐친」(本当の友達)、「찐사랑」など合成語でも活発に使われる。","es":"Activo en compuestos como 찐친 (amigo de verdad) y 찐사랑 (amor verdadero).","vi":"Hay dùng trong từ ghép như 찐친 (bạn thật sự), 찐사랑 (tình yêu đích thực).","de":"Häufig in Komposita wie 찐친 (wahrer Freund) und 찐사랑 (wahre Liebe)."}$j$,
  origin_i18n = $j${"en":"A coined pronunciation intensifying the 진 of 진짜 (real)","ja":"「진짜」(本当)の発音を強めた新造発音","es":"Pronunciación acuñada que intensifica el 진 de 진짜 (real)","vi":"Cách phát âm mới, nhấn mạnh âm 진 của 진짜 (thật)","de":"Neugeprägte, verstärkte Aussprache des 진 aus 진짜 (echt)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Intensified form of 진짜 (real): something genuine, without pretense.","ja":"「진짜」の強調形。飾らず本心から、または真の意味での何かを表す。","es":"Forma intensificada de 진짜 (real): algo genuino, sin fingimiento.","vi":"Dạng nhấn mạnh của 진짜 (thật): điều chân thành, không giả tạo.","de":"Verstärkte Form von 진짜 (echt): etwas Aufrichtiges ohne Verstellung."}$j$::jsonb)
where id = '17';

update public.words set
  short_desc_i18n = $j${"en":"Short-form video content","ja":"短尺動画コンテンツの形式","es":"Formato de vídeo corto","vi":"Định dạng video ngắn","de":"Kurzvideo-Format"}$j$,
  usage_i18n = $j${"en":"Became everyday vocabulary with TikTok, Reels, and Shorts.","ja":"TikTok・リール・Shortsの普及とともに日常語化。","es":"Se volvió cotidiano con TikTok, Reels y Shorts.","vi":"Thành từ thông dụng nhờ TikTok, Reels và Shorts.","de":"Mit TikTok, Reels und Shorts zum Alltagswort geworden."}$j$,
  origin_i18n = $j${"en":"Borrowed from English short-form content","ja":"英語のshort-form contentからの借用","es":"Préstamo del inglés short-form content","vi":"Mượn từ tiếng Anh short-form content","de":"Entlehnt aus dem Englischen short-form content"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Korean spelling of short-form: videos roughly 15 seconds to 3 minutes long.","ja":"short-formの韓国語表記。15秒〜3分程度の短い動画コンテンツ。","es":"Grafía coreana de short-form: vídeos de unos 15 segundos a 3 minutos.","vi":"Cách viết tiếng Hàn của short-form: video ngắn khoảng 15 giây đến 3 phút.","de":"Koreanische Schreibung von short-form: Videos von etwa 15 Sekunden bis 3 Minuten."}$j$::jsonb)
where id = '18';

update public.words set
  short_desc_i18n = $j${"en":"Content spreading fast across the internet","ja":"ネットで急速に広がるコンテンツ現象","es":"Contenido que se propaga rápido por internet","vi":"Hiện tượng nội dung lan nhanh trên mạng","de":"Content, der sich rasant im Netz verbreitet"}$j$,
  usage_i18n = $j${"en":"A key term in marketing, social media, and influencer content.","ja":"マーケティング、SNS、インフルエンサー関連の中核用語。","es":"Término clave en marketing, redes e influencers.","vi":"Thuật ngữ cốt lõi trong marketing, mạng xã hội, influencer.","de":"Schlüsselbegriff in Marketing, Social Media und Influencer-Content."}$j$,
  origin_i18n = $j${"en":"Borrowed from English viral","ja":"英語viralからの借用","es":"Préstamo del inglés viral","vi":"Mượn từ tiếng Anh viral","de":"Entlehnt aus dem Englischen viral"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Korean spelling of viral: content getting explosively shared on social media.","ja":"viralの韓国語表記。コンテンツがSNSで爆発的に共有される現象。","es":"Grafía coreana de viral: contenido compartido de forma explosiva en redes.","vi":"Cách viết tiếng Hàn của viral: nội dung được chia sẻ bùng nổ trên mạng xã hội.","de":"Koreanische Schreibung von viral: explosionsartig geteilter Content."}$j$::jsonb)
where id = '19';

update public.words set
  short_desc_i18n = $j${"en":"A disaster you brought on yourself","ja":"自分で招いた災い","es":"Un desastre que te buscaste tú mismo","vi":"Tai họa tự mình chuốc lấy","de":"Ein selbst heraufbeschworenes Desaster"}$j$,
  usage_i18n = $j${"en":"Self-deprecating situational humor; spread quickly after 2023.","ja":"自嘲的な状況描写。2023年以降急速に広がった新語。","es":"Humor autocrítico situacional; se extendió rápido desde 2023.","vi":"Miêu tả tự giễu; lan nhanh từ 2023.","de":"Selbstironische Lagebeschreibung; verbreitete sich ab 2023 rasant."}$j$,
  origin_i18n = $j${"en":"First syllables of 스스로 (by oneself) + 불러온 (brought on) + 재앙 (disaster)","ja":"「스스로」(自ら)+「불러온」(招いた)+「재앙」(災い)の頭文字","es":"Sílabas iniciales de 스스로 (uno mismo) + 불러온 (provocado) + 재앙 (desastre)","vi":"Chữ đầu của 스스로 (tự mình) + 불러온 (chuốc lấy) + 재앙 (tai họa)","de":"Anfangssilben von 스스로 (selbst) + 불러온 (herbeigeführt) + 재앙 (Desaster)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Short for 스스로 불러온 재앙: a bad situation caused by your own actions.","ja":"「스스로 불러온 재앙」の略。自分の行動が原因で起きた悪い状況。","es":"Abreviatura de 스스로 불러온 재앙: una mala situación causada por tus propios actos.","vi":"Rút gọn của 스스로 불러온 재앙: tình huống xấu do chính mình gây ra.","de":"Kurz für 스스로 불러온 재앙: eine schlimme Lage durch eigenes Handeln."}$j$::jsonb)
where id = '20';

update public.words set
  short_desc_i18n = $j${"en":"Too much (or unnecessary) information","ja":"多すぎる、または不要な情報","es":"Demasiada información (o innecesaria)","vi":"Thông tin quá nhiều hoặc không cần thiết","de":"Zu viel (oder unnötige) Information"}$j$,
  usage_i18n = $j${"en":"Widely used when someone overshares personal details.","ja":"個人的な情報を過剰に共有する場面で広く使われる。","es":"Muy usado cuando alguien comparte detalles de más.","vi":"Dùng rộng rãi khi ai đó chia sẻ quá đà chuyện cá nhân.","de":"Weit verbreitet, wenn jemand zu viel Privates teilt."}$j$,
  origin_i18n = $j${"en":"Acronym of Too Much Information, turned into Korean slang","ja":"Too Much Informationの略語で、韓国で新語化","es":"Sigla de Too Much Information, convertida en jerga coreana","vi":"Viết tắt của Too Much Information, thành tiếng lóng Hàn","de":"Akronym von Too Much Information, in Korea zum Slang geworden"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Short for Too Much Information: personal details nobody asked to know.","ja":"Too Much Informationの略。別に知りたくもない過剰な個人情報や細部。","es":"Sigla de Too Much Information: detalles personales que nadie pidió saber.","vi":"Viết tắt của Too Much Information: chi tiết cá nhân chẳng ai muốn biết.","de":"Kurz für Too Much Information: private Details, nach denen niemand gefragt hat."}$j$::jsonb)
where id = '21';

update public.words set
  short_desc_i18n = $j${"en":"인정 (agreed) — when you admit something is right","ja":"인정(認める) — 同意したり正しいと認めるとき","es":"인정 (reconocido) — cuando admites que algo es cierto","vi":"인정 (công nhận) — khi đồng ý hoặc thừa nhận là đúng","de":"인정 (zugestanden) — wenn man etwas als richtig anerkennt"}$j$,
  usage_i18n = $j${"en":"Quick agreement in chats and comments.","ja":"チャットやコメントでの素早い同意・承認表現。","es":"Acuerdo rápido en chats y comentarios.","vi":"Cách đồng ý nhanh trong chat và bình luận.","de":"Schnelle Zustimmung in Chats und Kommentaren."}$j$,
  origin_i18n = $j${"en":"Just the initial consonants ㅇ and ㅈ of 인정 (admit)","ja":"「인정」の初声ㅇとㅈだけを取った表記","es":"Solo las consonantes iniciales ㅇ y ㅈ de 인정 (admitir)","vi":"Chỉ lấy phụ âm đầu ㅇ và ㅈ của 인정 (công nhận)","de":"Nur die Anfangskonsonanten ㅇ und ㅈ von 인정 (anerkennen)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Initial-consonant shorthand for 인정: admitting the other person is right.","ja":"「인정」の初声略語。相手の言葉が正しい、事実だと認めるとき。","es":"Abreviatura por consonantes iniciales de 인정: reconocer que el otro tiene razón.","vi":"Viết tắt phụ âm đầu của 인정: thừa nhận đối phương nói đúng.","de":"Anfangskonsonanten-Kürzel für 인정: zugeben, dass der andere recht hat."}$j$::jsonb)
where id = '22';

update public.words set
  short_desc_i18n = $j${"en":"For real — strong agreement or emphasis","ja":"マジ、本当 — 強い同意や強調","es":"En serio — acuerdo fuerte o énfasis","vi":"Thật sự — đồng tình mạnh hoặc nhấn mạnh","de":"Echt jetzt — starke Zustimmung oder Betonung"}$j$,
  usage_i18n = $j${"en":"One of the most frequent abbreviations in Korean chats.","ja":"チャットで最も頻繁に使われる略語のひとつ。","es":"Una de las abreviaturas más frecuentes en chats coreanos.","vi":"Một trong những từ viết tắt hay gặp nhất khi chat.","de":"Eine der häufigsten Abkürzungen im Chat."}$j$,
  origin_i18n = $j${"en":"Initial consonants of 리얼 (real)","ja":"「리얼」(real)の初声のみ","es":"Consonantes iniciales de 리얼 (real)","vi":"Phụ âm đầu của 리얼 (real)","de":"Anfangskonsonanten von 리얼 (real)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Initial-consonant shorthand for 리얼 (real): stresses for real, truly.","ja":"「리얼」(real)の初声略語。「本当に」「マジで」を強調する表現。","es":"Abreviatura por consonantes de 리얼 (real): enfatiza de verdad.","vi":"Viết tắt phụ âm đầu của 리얼 (real): nhấn mạnh thật sự, thật đấy.","de":"Anfangskonsonanten-Kürzel für 리얼 (real): betont wirklich, echt."}$j$::jsonb)
where id = '23';

update public.words set
  short_desc_i18n = $j${"en":"Laughter written with bare consonants (the Korean haha)","ja":"笑いを表す初声表現(韓国版www)","es":"Risa escrita con consonantes (el jaja coreano)","vi":"Tiếng cười viết bằng phụ âm (kiểu haha Hàn Quốc)","de":"Lachen in bloßen Konsonanten (das koreanische Haha)"}$j$,
  usage_i18n = $j${"en":"The oldest must-know emoticon substitute in Korean digital chat.","ja":"韓国語のデジタルコミュニケーションで最も古い必須の絵文字代替表現。","es":"El sustituto de emoticono más veterano e imprescindible del chat coreano.","vi":"Cách thay thế emoji lâu đời và thiết yếu nhất trong chat tiếng Hàn.","de":"Der älteste unverzichtbare Emoticon-Ersatz im koreanischen Chat."}$j$,
  origin_i18n = $j${"en":"The original initial-consonant expression, used since early internet chat","ja":"ネットチャット初期から使われる元祖初声表現","es":"La expresión por consonantes original, usada desde los inicios del chat","vi":"Biểu đạt phụ âm đầu nguyên bản, dùng từ thời chat sơ khai","de":"Der Ur-Konsonantenausdruck, seit den Anfängen des Chats in Gebrauch"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Consonant spelling of 크크 (a chuckle). More ㅋ means louder laughter.","ja":"「크크」の初声表記。軽く笑うときや面白いときに使う。数が多いほど大笑いの意味。","es":"Grafía consonántica de 크크 (risita). Cuantas más ㅋ, más fuerte la risa.","vi":"Cách viết phụ âm của 크크 (cười khúc khích). Càng nhiều ㅋ là cười càng to.","de":"Konsonantenschreibung von 크크 (Kichern). Je mehr ㅋ, desto lauter das Lachen."}$j$::jsonb)
where id = '24';

update public.words set
  short_desc_i18n = $j${"en":"Crying eyes — an emoticon of sadness or regret","ja":"悲しみや残念さを表す文字絵文字(泣き顔)","es":"Ojos llorosos: emoticono de tristeza o pena","vi":"Đôi mắt khóc — biểu tượng buồn bã, tiếc nuối","de":"Weinende Augen — Zeichen für Trauer oder Bedauern"}$j$,
  usage_i18n = $j${"en":"A casual way to show sadness, sympathy, or disappointment.","ja":"悲しみ、同情、残念さをカジュアルに表すとき。","es":"Forma casual de mostrar tristeza, pena o decepción.","vi":"Cách thể hiện buồn, thương cảm, tiếc nuối một cách nhẹ nhàng.","de":"Lässige Art, Trauer, Mitgefühl oder Enttäuschung zu zeigen."}$j$,
  origin_i18n = $j${"en":"Two teardrop shapes (ㅠ) — tears from both eyes","ja":"涙の形(ㅠ)が二つ → 両目から涙","es":"Dos lágrimas (ㅠ): llanto de ambos ojos","vi":"Hai hình giọt lệ (ㅠ) — nước mắt từ hai mắt","de":"Zwei Tränenformen (ㅠ) — Tränen aus beiden Augen"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Letters shaped like crying eyes; conveys sadness, regret, disappointment.","ja":"泣いている様子を字形で表現。悲しみ、残念さ、失望を表す。","es":"Letras con forma de ojos llorando; transmite tristeza y decepción.","vi":"Chữ cái hình đôi mắt khóc; thể hiện buồn bã, tiếc nuối, thất vọng.","de":"Buchstaben wie weinende Augen; steht für Trauer und Enttäuschung."}$j$::jsonb)
where id = '25';

update public.words set
  short_desc_i18n = $j${"en":"A joyful shout when something great happens","ja":"うれしいときや盛り上がったときの感嘆詞","es":"Grito de alegría cuando pasa algo genial","vi":"Tiếng reo vui khi có chuyện phấn khích","de":"Ein Freudenschrei, wenn etwas Tolles passiert"}$j$,
  usage_i18n = $j${"en":"A meme exclamation for happy moments; essential MZ-generation meme since 2020.","ja":"うれしい出来事のときに使うミーム感嘆詞。2020年以降MZ世代の必須ミーム。","es":"Exclamación-meme para momentos felices; meme esencial de la generación MZ desde 2020.","vi":"Thán từ meme cho khoảnh khắc vui; meme quốc dân của thế hệ MZ từ 2020.","de":"Meme-Ausruf für Glücksmomente; seit 2020 Pflicht-Meme der MZ-Generation."}$j$,
  origin_i18n = $j${"en":"From a 야호 (yahoo) shout in an Infinite Challenge hiking episode; spread as the 무야호 meme","ja":"無限に挑戦の登山特集で叫ばれた「야호」に由来し、「무야호」ミームとして拡散","es":"De un grito de 야호 (yahoo) en un episodio de Infinite Challenge; se extendió como el meme 무야호","vi":"Từ tiếng hô 야호 trong tập leo núi của Infinite Challenge; lan thành meme 무야호","de":"Vom 야호-Ruf in einer Infinite-Challenge-Wanderfolge; als 무야호-Meme verbreitet"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"A meme born from an Infinite Challenge scene: a loud cheer for happy news.","ja":"無限に挑戦のワンシーンから生まれたミーム表現。うれしいことがあったとき大声で叫ぶ感嘆詞。","es":"Meme nacido de una escena de Infinite Challenge: un grito de celebración.","vi":"Meme sinh ra từ một cảnh trong Infinite Challenge: tiếng hô to khi có tin vui.","de":"Ein Meme aus einer Infinite-Challenge-Szene: ein lauter Jubelruf."}$j$::jsonb)
where id = '26';

update public.words set
  short_desc_i18n = $j${"en":"A satirical name for a shabby small company","ja":"劣悪な中小企業を風刺的に呼ぶ言葉","es":"Nombre satírico para una pequeña empresa precaria","vi":"Cách gọi châm biếm công ty nhỏ tồi tàn","de":"Eine satirische Bezeichnung für eine miese Kleinfirma"}$j$,
  usage_i18n = $j${"en":"Used in worker communities to satirize life at small companies with poor pay, benefits, and systems.","ja":"会社員コミュニティで、給料・福利厚生・体制が劣悪な中小企業生活を自嘲・風刺するときに使う。","es":"En comunidades laborales, satiriza la vida en pymes con mal sueldo y organización.","vi":"Trong cộng đồng dân văn phòng, để tự giễu cuộc sống ở công ty nhỏ lương thấp, phúc lợi kém.","de":"In Arbeitnehmer-Communitys, um das Leben in Kleinfirmen mit schlechter Bezahlung zu persiflieren."}$j$,
  origin_i18n = $j${"en":"From the 2021 web drama 좋좋소 (Lee Gwajang channel), short for its title phrase — a softened, satirical take on a much cruder slang word for small companies","ja":"ウェブドラマ「좋좋소」(2021、イ課長チャンネル)のタイトルの略 — 中小企業を蔑む荒い隠語の発音をやわらげた風刺表現","es":"Del web drama 좋좋소 (2021, canal Lee Gwajang), abreviatura de su título: versión suavizada y satírica de una jerga mucho más cruda","vi":"Từ web drama 좋좋소 (2021, kênh Lee Gwajang), rút gọn tựa phim — bản nói giảm mang tính châm biếm của một tiếng lóng thô tục hơn","de":"Aus dem Webdrama 좋좋소 (2021, Kanal Lee Gwajang), Kurzform des Titels — die entschärfte, satirische Form eines weit derberen Slangworts"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"A satirical term for small companies with poor pay, benefits, and processes.","ja":"給料・福利厚生・業務体制が劣悪な中小企業を風刺的に指す言葉。","es":"Término satírico para pymes con salario, beneficios y organización precarios.","vi":"Từ châm biếm chỉ công ty nhỏ có lương, phúc lợi, quy trình tệ.","de":"Ein satirischer Begriff für Kleinfirmen mit schlechter Bezahlung und Organisation."}$j$::jsonb)
where id = '27';

update public.words set
  short_desc_i18n = $j${"en":"What women call an older male, a boyfriend, or a favorite male star","ja":"女性が年上の男性・恋人・好きな男性芸能人を呼ぶ呼称","es":"Cómo llaman las mujeres a un hombre mayor, novio o ídolo favorito","vi":"Cách phụ nữ gọi đàn ông lớn tuổi hơn, bạn trai hoặc thần tượng nam","de":"Anrede von Frauen für ältere Männer, den Freund oder einen Star"}$j$,
  usage_i18n = $j${"en":"Used for real older brothers, boyfriends, and male idols alike. Careful in formal settings or with strangers — it can be misread.","ja":"実の兄・恋人・好きな男性芸能人への呼称として幅広く使用。公的な場や初対面では誤解のもとになるので注意。","es":"Vale para hermanos mayores, novios e ídolos. Ojo en contextos formales o con desconocidos: puede malinterpretarse.","vi":"Dùng cho anh ruột, người yêu lẫn idol nam. Cẩn thận ở nơi trang trọng hay với người lạ — dễ gây hiểu lầm.","de":"Für echte ältere Brüder, Freunde und Idole gebräuchlich. Vorsicht im formellen Rahmen oder bei Fremden — leicht misszuverstehen."}$j$,
  origin_i18n = $j${"en":"A kinship term from the colloquial form of 오라버니; extended to romantic and fandom use","ja":"「오라버니」の口語形から来た親族呼称 — 恋人やK-POPファンダムの愛称へ意味が拡張","es":"Término de parentesco del coloquial 오라버니; ampliado al uso romántico y de fandom","vi":"Từ xưng hô thân tộc từ dạng khẩu ngữ của 오라버니; mở rộng sang người yêu và fandom","de":"Verwandtschaftswort aus der Umgangsform von 오라버니; erweitert auf Beziehung und Fandom"}$j$,
  meanings = jsonb_set(jsonb_set(jsonb_set(meanings,
    '{0,definition_i18n}', $j${"en":"The basic term a woman uses for her older brother or an older male.","ja":"女性が実の兄や年上の男性を呼ぶ基本の呼称。","es":"El término básico con que una mujer llama a su hermano mayor o a un hombre mayor que ella.","vi":"Cách gọi cơ bản của phụ nữ với anh trai hoặc đàn ông lớn tuổi hơn.","de":"Die Grundanrede einer Frau für den älteren Bruder oder einen älteren Mann."}$j$::jsonb),
    '{1,definition_i18n}', $j${"en":"A term of endearment for a boyfriend.","ja":"恋人同士で女性が彼氏を呼ぶ愛称。","es":"Apelativo cariñoso para el novio.","vi":"Cách gọi trìu mến dành cho bạn trai.","de":"Ein Kosename für den Freund."}$j$::jsonb),
    '{2,definition_i18n}', $j${"en":"How female fans affectionately address a male celebrity they love.","ja":"女性ファンが好きな男性芸能人を愛情を込めて呼ぶ表現。","es":"Cómo las fans llaman con cariño a su artista masculino favorito.","vi":"Cách fan nữ trìu mến gọi nghệ sĩ nam mình yêu thích.","de":"Wie weibliche Fans ihren Lieblingsstar liebevoll ansprechen."}$j$::jsonb)
where id = '28';

update public.words set
  short_desc_i18n = $j${"en":"A disciplined, diligent life — God + life","ja":"計画的で勤勉な生活 — God+人生","es":"Una vida disciplinada y productiva: God + vida","vi":"Cuộc sống kỷ luật, chăm chỉ — God + đời","de":"Ein diszipliniertes, fleißiges Leben — God + Leben"}$j$,
  usage_i18n = $j${"en":"Trending alongside social media challenges and diary decorating (다꾸).","ja":"SNSチャレンジや手帳デコ(다꾸)とともに流行。","es":"De moda junto a los retos de redes y la decoración de agendas (다꾸).","vi":"Thịnh hành cùng các challenge mạng xã hội và trang trí sổ tay (다꾸).","de":"Im Trend zusammen mit Social-Media-Challenges und Tagebuch-Deko (다꾸)."}$j$,
  origin_i18n = $j${"en":"Blend of 갓 (God) and 인생 (life)","ja":"「갓」(God)+「인생」(人生)の合成","es":"Combinación de 갓 (God) y 인생 (vida)","vi":"Ghép 갓 (God) với 인생 (cuộc đời)","de":"Zusammensetzung aus 갓 (God) und 인생 (Leben)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"God + life: a diligent, productive life of early mornings, exercise, and strict self-care.","ja":"Godと人生の合成語。早起きして運動や勉強など自己管理を徹底する勤勉で生産的な生活。","es":"God + vida: una vida productiva de madrugar, ejercicio y autodisciplina.","vi":"God + cuộc đời: sống chăm chỉ, dậy sớm, tập luyện, học hành, tự quản bản thân nghiêm ngặt.","de":"God + Leben: ein produktives Leben mit frühem Aufstehen, Sport und strikter Selbstdisziplin."}$j$::jsonb)
where id = '29';

update public.words set
  short_desc_i18n = $j${"en":"Beating a joke to death long after it stopped being funny","ja":"もう面白くないネタを延々と擦り続けること","es":"Exprimir un chiste mucho después de dejar de ser gracioso","vi":"Nhai đi nhai lại trò đùa đã hết vui","de":"Einen Witz totreiten, der längst nicht mehr zündet"}$j$,
  usage_i18n = $j${"en":"Called out when a joke or meme gets repeated way too much.","ja":"ユーモアやミームが過剰に繰り返されるときの指摘に使う。","es":"Se usa para señalar chistes o memes repetidos en exceso.","vi":"Dùng để nhắc khi một trò đùa hay meme bị lặp lại quá đà.","de":"Wird angemerkt, wenn ein Witz oder Meme übermäßig wiederholt wird."}$j$,
  origin_i18n = $j${"en":"From online communities like DC Inside; originally gaming slang","ja":"DCインサイドなどのネットコミュニティ発、元はゲーム隠語","es":"De comunidades como DC Inside; en origen jerga gamer","vi":"Từ các cộng đồng mạng như DC Inside; gốc là tiếng lóng game","de":"Aus Online-Communitys wie DC Inside; ursprünglich Gaming-Slang"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"When a joke that should have ended after one round is repeated until all the fun is gone.","ja":"一回で終わるべき冗談やネタを飽きるまで繰り返し、かえってつまらなくなる状態。","es":"Cuando un chiste que debía quedarse en una vez se repite hasta perder toda la gracia.","vi":"Trò đùa đáng lẽ dừng ở một lần bị lặp đến phát ngán, mất hết cái hay.","de":"Wenn ein Witz, der nach einmal hätte enden sollen, bis zum Überdruss wiederholt wird."}$j$::jsonb)
where id = '30';

update public.words set
  short_desc_i18n = $j${"en":"Someone who asks others instead of searching — finger princess","ja":"検索せず人に聞く人 — フィンガープリンセス","es":"Quien pregunta a otros en vez de buscar: finger princess","vi":"Người đi hỏi thay vì tự tìm kiếm — finger princess","de":"Wer andere fragt, statt selbst zu suchen — Finger Princess"}$j$,
  usage_i18n = $j${"en":"Used with a teasing tone in online communities and open chats.","ja":"ネットコミュニティやオープンチャットで、ややからかいのニュアンスで使われる。","es":"Con tono burlón en comunidades y chats abiertos.","vi":"Mang sắc thái trêu chọc trong cộng đồng mạng và chat mở.","de":"Mit leicht spöttischem Unterton in Communitys und offenen Chats."}$j$,
  origin_i18n = $j${"en":"Korean-style shortening of the English finger princess","ja":"英語finger princessを韓国式に略した新語","es":"Acortamiento a la coreana del inglés finger princess","vi":"Cách rút gọn kiểu Hàn của finger princess","de":"Koreanische Kurzform des englischen finger princess"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Short for finger princess: someone who asks others even for things one search away.","ja":"finger princessの略。一回検索すればわかることも自分で調べず人に聞く人。","es":"Abreviatura de finger princess: quien pregunta incluso lo que se resuelve con una búsqueda.","vi":"Rút gọn của finger princess: người đi hỏi cả những thứ chỉ cần một lần tìm kiếm.","de":"Kurz für finger princess: jemand, der selbst Dinge erfragt, die eine Suche entfernt sind."}$j$::jsonb)
where id = '31';

update public.words set
  short_desc_i18n = $j${"en":"A crude slur for a lousy small company","ja":"劣悪な中小企業を蔑む荒っぽい俗語","es":"Insulto crudo para una pequeña empresa pésima","vi":"Tiếng lóng thô tục miệt thị công ty nhỏ tồi tệ","de":"Ein derbes Schimpfwort für eine üble Kleinfirma"}$j$,
  usage_i18n = $j${"en":"Used in worker communities to crudely bash bad small-company conditions. A vulgarity — never for formal settings.","ja":"会社員コミュニティで中小企業の劣悪な環境を荒く蔑むときに使う。公の場では使ってはいけない卑俗語。","es":"En comunidades laborales para despotricar de las malas pymes. Vulgarismo: jamás en contextos formales.","vi":"Dùng trong cộng đồng dân văn phòng để chửi môi trường công ty nhỏ tệ hại. Từ tục — tuyệt đối không dùng nơi trang trọng.","de":"In Arbeitnehmer-Communitys für derbes Lästern über üble Kleinfirmen. Vulgär — nie im formellen Rahmen."}$j$,
  origin_i18n = $j${"en":"Vulgar 좆 + 중소기업 (small company) — the crude original that 좋좋소 softens","ja":"卑俗語「좆」+「중소기업」の合成 — 発音を和らげた「좋소」(ウェブドラマ「좋좋소」)の原形","es":"Vulgar 좆 + 중소기업 (pyme): la forma cruda que 좋좋소 suaviza","vi":"Từ tục 좆 + 중소기업 (công ty nhỏ) — dạng gốc thô tục mà 좋좋소 nói giảm","de":"Vulgäres 좆 + 중소기업 (Kleinfirma) — die derbe Urform, die 좋좋소 entschärft"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"A vulgar slur for small companies with terrible pay and benefits — far cruder than the softened 좋좋소.","ja":"給料・福利厚生が劣悪な中小企業を蔑む卑俗語。純化形「좋좋소」よりはるかに荒い原形表現。","es":"Vulgarismo que denigra a las pymes con pésimo sueldo: mucho más crudo que el suavizado 좋좋소.","vi":"Từ tục miệt thị công ty nhỏ lương thấp phúc lợi kém — thô hơn hẳn dạng nói giảm 좋좋소.","de":"Ein vulgäres Schmähwort für Kleinfirmen mit mieser Bezahlung — weit derber als das entschärfte 좋좋소."}$j$::jsonb)
where id = '101';

update public.words set
  short_desc_i18n = $j${"en":"Slang for insanely delicious — aka JMT","ja":"めちゃくちゃおいしいという俗語 — JMT","es":"Jerga para delicioso a rabiar: JMT","vi":"Tiếng lóng nghĩa là ngon xỉu — JMT","de":"Slang für wahnsinnig lecker — auch JMT"}$j$,
  usage_i18n = $j${"en":"Casual slang for amazing food. Its vulgar root makes it unfit for formal settings.","ja":"料理がとてもおいしいときのカジュアルな俗語。語源が荒いためフォーマルな場には不向き。","es":"Jerga casual para comida buenísima. Su raíz vulgar la hace impropia de contextos formales.","vi":"Tiếng lóng suồng sã khen món ăn quá ngon. Gốc từ thô tục nên không hợp chỗ trang trọng.","de":"Lässiger Slang für großartiges Essen. Wegen der vulgären Wurzel nichts für formelle Anlässe."}$j$,
  origin_i18n = $j${"en":"Vulgar intensifier 존나 + 맛 (taste) + suffix 탱","ja":"卑俗語「존나」(すごく)+「맛」(味)+接尾辞「탱」の合成","es":"Intensificador vulgar 존나 + 맛 (sabor) + sufijo 탱","vi":"Từ tục 존나 (cực kỳ) + 맛 (vị) + hậu tố 탱","de":"Vulgärer Verstärker 존나 + 맛 (Geschmack) + Suffix 탱"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Slang stressing that food is extremely tasty; widely written as the initials JMT.","ja":"「とてもおいしい」を強調する俗語。ローマ字イニシャルJMTでも広く使われる。","es":"Jerga que enfatiza lo riquísimo de una comida; muy usada como iniciales JMT.","vi":"Tiếng lóng nhấn mạnh món ăn cực ngon; cũng viết phổ biến là JMT.","de":"Slang für extrem leckeres Essen; weit verbreitet auch als Initialen JMT."}$j$::jsonb)
where id = '102';

update public.words set
  short_desc_i18n = $j${"en":"Slang for grimly holding on no matter what","ja":"意地でも耐え抜くという俗語","es":"Jerga para aguantar a toda costa","vi":"Tiếng lóng nghĩa là gồng mình trụ đến cùng","de":"Slang für verbissenes Durchhalten"}$j$,
  usage_i18n = $j${"en":"For gutting out hard situations like work or investments. Vulgar root — not for official settings.","ja":"仕事や投資などつらい状況を最後まで耐えるときに使う俗語。語源が荒く公式の場には不適切。","es":"Para resistir situaciones duras (trabajo, inversiones). Raíz vulgar: no apto para actos oficiales.","vi":"Dùng khi gồng chịu hoàn cảnh khó (công việc, đầu tư). Gốc thô tục — không hợp chỗ chính thức.","de":"Fürs Durchbeißen in harten Lagen wie Job oder Investments. Vulgäre Wurzel — nichts für offizielle Anlässe."}$j$,
  origin_i18n = $j${"en":"Short for the vulgar 존나 + 버티기 (holding out)","ja":"卑俗語「존나」+「버티기」(耐えること)の略","es":"Abreviatura del vulgar 존나 + 버티기 (resistir)","vi":"Rút gọn của từ tục 존나 + 버티기 (cầm cự)","de":"Kurzform aus vulgärem 존나 + 버티기 (durchhalten)"}$j$,
  meanings = jsonb_set(meanings, '{0,definition_i18n}', $j${"en":"Slang for holding on stubbornly to the end; popularized in stock and crypto communities, then spread to work life.","ja":"「最後まで意地でも耐える」という俗語。株・コインのコミュニティで大衆化し、会社生活全般に拡散。","es":"Jerga por resistir con uñas y dientes; se popularizó en foros de bolsa y cripto y pasó a la vida laboral.","vi":"Tiếng lóng nghĩa là lì lợm trụ đến cùng; phổ biến từ cộng đồng chứng khoán, coin rồi lan sang đời công sở.","de":"Slang für stures Durchhalten bis zum Ende; über Aktien- und Krypto-Communitys populär geworden, dann im Arbeitsleben verbreitet."}$j$::jsonb)
where id = '103';
