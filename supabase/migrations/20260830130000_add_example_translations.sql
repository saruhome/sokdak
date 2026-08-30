-- 예문 다국어화 (2026-08-30): 모든 단어의 meanings.examples에 ja/es/vi/de 번역 추가.
-- kor/eng 원본은 구조적으로 건드리지 않는다 — VALUES 행의 번역 jsonb를 || 병합만 한다.
-- 앱은 UI 언어에 맞는 키를 표시하고 없으면 eng로 폴백한다(word detail).
-- 번역 초안: Claude 생성 — ja는 베타 테스터(일본어 교사) 검수 예정.

begin;

with tr(word, m_idx, e_idx, extra) as (
  values
  ('TMI', 1, 1, '{"ja":"TMIだけど、昨日一晩中泣いてたんだ。","es":"Es demasiada información, pero ayer lloré toda la noche.","vi":"Hơi thừa thông tin, nhưng hôm qua mình khóc cả đêm.","de":"Zu viel Info, aber ich habe gestern die ganze Nacht geweint."}'::jsonb),
  ('TMI', 1, 2, '{"ja":"それ、ちょっとTMIじゃない?","es":"¿Eso no es demasiada información?","vi":"Cái đó hơi thừa thông tin không?","de":"Ist das nicht ein bisschen zu viel Info?"}'::jsonb),
  ('갑분싸', 1, 1, '{"ja":"その一言で急に空気が冷めた。","es":"Después de ese comentario, el ambiente se enfrió de golpe.","vi":"Sau câu nói đó, không khí bỗng lạnh ngắt.","de":"Nach dem Satz war die Stimmung schlagartig im Keller."}'::jsonb),
  ('갑분싸', 1, 2, '{"ja":"急に空気を凍らせたのは誰?","es":"¿Quién mató el ambiente de repente?","vi":"Ai vừa làm tụt mood vậy?","de":"Wer hat gerade die Stimmung gekillt?"}'::jsonb),
  ('갓벽', 1, 1, '{"ja":"このアルバム、マジで神完璧。","es":"Este álbum es divinamente perfecto.","vi":"Album này đỉnh hoàn hảo thật sự.","de":"Dieses Album ist göttlich perfekt."}'::jsonb),
  ('갓벽', 1, 2, '{"ja":"今日の発表、完全に神完璧だったよ!","es":"¡Tu presentación de hoy fue absolutamente perfecta!","vi":"Bài thuyết trình hôm nay của cậu hoàn hảo tuyệt đối!","de":"Deine Präsentation heute war absolut perfekt!"}'::jsonb),
  ('갓생', 1, 1, '{"ja":"今日から神生活、6時起き!","es":"Desde hoy vivo mi vida perfecta: ¡arriba a las 6!","vi":"Từ hôm nay sống đời tự luật, dậy lúc 6 giờ!","de":"Ab heute lebe ich diszipliniert – Aufstehen um 6!"}'::jsonb),
  ('갓생', 1, 2, '{"ja":"休みの間、神生活チャレンジ一緒にやらない?","es":"¿Hacemos juntos el reto de vida disciplinada estas vacaciones?","vi":"Nghỉ này cùng làm thử thách sống kỷ luật không?","de":"Machen wir in den Ferien zusammen eine Disziplin-Challenge?"}'::jsonb),
  ('개이득', 1, 1, '{"ja":"1+1だって?超お得じゃん!","es":"¿Dos por uno? ¡Menuda ganga!","vi":"Mua 1 tặng 1 á? Hời to rồi!","de":"Eins plus eins gratis? Was für ein Schnäppchen!"}'::jsonb),
  ('개이득', 1, 2, '{"ja":"返品も交換もできるなんて超お得だね。","es":"¿Con devolución y cambio? Qué chollo.","vi":"Vừa hoàn tiền vừa đổi được, quá hời.","de":"Rückgabe und Umtausch möglich – ein Riesengewinn."}'::jsonb),
  ('넵병', 1, 1, '{"ja":"課長にまた「ネップ!」って返しちゃった、完全にネップ病。","es":"Otra vez le respondí «¡Sí, señor!» al jefe: síndrome total.","vi":"Lại Dạ vâng! với sếp rồi, đúng là bệnh dạ vâng.","de":"Schon wieder ein zackiges „Jawohl!“ an den Chef – typisches Jawohl-Syndrom."}'::jsonb),
  ('넵병', 1, 2, '{"ja":"仕事してないのに「ネップ!」だけは一人前だね。","es":"No da ni golpe, pero no para de decir «¡Sí, señor!».","vi":"Lười làm mà cứ Dạ vâng! liên tục.","de":"Kaum am Arbeiten, aber ständig „Jawohl!“ tippen."}'::jsonb),
  ('뇌절', 1, 1, '{"ja":"そのネタもう擦りすぎ、やめて。","es":"Ese chiste ya está muy quemado, para.","vi":"Trò đùa đó nhai lại quá rồi, thôi đi.","de":"Der Witz ist schon totgeritten, hör auf."}'::jsonb),
  ('뇌절', 1, 2, '{"ja":"シーズン2までやるのはさすがに擦りすぎじゃない?","es":"¿Llevarlo a una segunda temporada no es exprimirlo demasiado?","vi":"Kéo tới mùa 2 thì hơi quá đà không?","de":"Noch eine zweite Staffel – ist das nicht übertrieben?"}'::jsonb),
  ('ㄹㅇ', 1, 1, '{"ja":"リアルそれな、完全に共感。","es":"Tal cual, totalmente de acuerdo.","vi":"Chuẩn luôn, đồng cảm cực.","de":"Echt wahr, voll meine Meinung."}'::jsonb),
  ('ㄹㅇ', 1, 2, '{"ja":"それガチで大変そう。","es":"Eso sí que debe de ser duro.","vi":"Cái đó chắc cực thật sự.","de":"Das ist bestimmt echt hart."}'::jsonb),
  ('레알', 1, 1, '{"ja":"レアル?それマジ?","es":"¿En serio? ¿Eso es verdad?","vi":"Thật á? Chuyện đó có thật không?","de":"Echt jetzt? Stimmt das wirklich?"}'::jsonb),
  ('레알', 1, 2, '{"ja":"これガチでうまい。","es":"Esto está buenísimo de verdad.","vi":"Cái này ngon thật sự luôn.","de":"Das schmeckt wirklich richtig gut."}'::jsonb),
  ('레전드', 1, 1, '{"ja":"あのステージ、マジでレジェンドだった。","es":"Esa actuación fue legendaria.","vi":"Sân khấu đó đúng là huyền thoại.","de":"Dieser Auftritt war absolut legendär."}'::jsonb),
  ('무야호', 1, 1, '{"ja":"今日は早く帰れる、ムヤホー!","es":"¡Hoy salgo antes del trabajo, yujuuu!","vi":"Hôm nay được về sớm, muyaho!","de":"Heute früher Feierabend – juhuu!"}'::jsonb),
  ('무야호', 1, 2, '{"ja":"合格した!!ムヤホー~~","es":"¡¡Aprobé!! ¡Yujuuu!","vi":"Đậu rồi!! Muyaho~~","de":"Bestanden!! Juhuu~~"}'::jsonb),
  ('바이럴', 1, 1, '{"ja":"あの動画、完全にバズったよね。","es":"Ese video se hizo totalmente viral.","vi":"Video đó viral khắp nơi rồi.","de":"Das Video ist total viral gegangen."}'::jsonb),
  ('바이럴', 1, 2, '{"ja":"バイラルマーケティングで売上が爆発した。","es":"El marketing viral disparó las ventas.","vi":"Marketing viral làm doanh thu bùng nổ.","de":"Durch virales Marketing ist der Umsatz explodiert."}'::jsonb),
  ('숏폼', 1, 1, '{"ja":"最近はショート動画が主流で、長い動画はあまり見ない。","es":"Ahora mandan los videos cortos; ya casi nadie ve los largos.","vi":"Dạo này video ngắn là xu hướng, ít ai xem video dài.","de":"Kurzvideos sind gerade das Ding – lange Videos schaut kaum noch jemand."}'::jsonb),
  ('스불재', 1, 1, '{"ja":"寝坊して遅刻したんでしょ、完全に自業自得。","es":"Llegaste tarde por quedarte dormido: desastre autoinfligido.","vi":"Ngủ nướng nên trễ còn gì, đúng là tự mình chuốc họa.","de":"Verschlafen und zu spät – selbst eingebrockt."}'::jsonb),
  ('ㅇㅈ', 1, 1, '{"ja":"その言葉が正しいのは認める。","es":"Reconozco que eso es verdad.","vi":"Công nhận câu đó đúng.","de":"Muss man zugeben, das stimmt."}'::jsonb),
  ('ㅇㅈ', 1, 2, '{"ja":"認める、私もそう思う。","es":"De acuerdo, yo también lo pienso.","vi":"Công nhận, mình cũng nghĩ vậy.","de":"Stimmt, finde ich auch."}'::jsonb),
  ('알잖아', 1, 1, '{"ja":"なんでか知ってるでしょ、これ以上説明しなくていいよね?","es":"Ya sabes por qué, ¿no hace falta que lo explique, verdad?","vi":"Cậu biết lý do mà, khỏi giải thích thêm nhé?","de":"Du weißt doch, warum – muss ich das noch erklären?"}'::jsonb),
  ('억까', 1, 1, '{"ja":"あれはただの言いがかり、筋の通らない批判だよ。","es":"Eso es puro odio sin fundamento, una crítica sin sentido.","vi":"Đó chỉ là chê bai vô căn cứ, chỉ trích vô lý.","de":"Das ist doch nur grundloses Bashing, völlig unsinnige Kritik."}'::jsonb),
  ('억까', 1, 2, '{"ja":"いくらファンでも言いがかりはやめて。","es":"Aunque seas fan, no critiques sin fundamento.","vi":"Dù là fan cũng đừng chê bai vô căn cứ.","de":"Auch als Fan solltest du nicht grundlos bashen."}'::jsonb),
  ('역주행', 1, 1, '{"ja":"あの曲、完全に逆走ヒットだよね。何年も前の曲なのに。","es":"Esa canción está triunfando años después de salir.","vi":"Bài đó hot ngược hẳn luôn, ra mấy năm rồi mà.","de":"Der Song feiert Jahre später ein Comeback in den Charts."}'::jsonb),
  ('역주행', 1, 2, '{"ja":"ドラマが放送終了後に人気が出ることも多い。","es":"Muchas series se vuelven virales después de terminar.","vi":"Nhiều phim sau khi kết thúc mới nổi lại.","de":"Viele Serien werden erst nach dem Finale richtig populär."}'::jsonb),
  ('오빠', 1, 1, '{"ja":"オッパ、ご飯食べた?","es":"Oppa, ¿ya comiste?","vi":"Oppa, anh ăn cơm chưa?","de":"Oppa, hast du schon gegessen?"}'::jsonb),
  ('오빠', 1, 2, '{"ja":"うちの兄は大学生です。","es":"Mi hermano mayor es universitario.","vi":"Anh trai mình là sinh viên đại học.","de":"Mein älterer Bruder ist Student."}'::jsonb),
  ('오빠', 2, 1, '{"ja":"オッパが迎えに行くよ。(彼氏の発言)","es":"Voy a recogerte. (dice el novio)","vi":"Oppa sẽ đến đón em. (bạn trai nói)","de":"Ich hole dich ab. (sagt der Freund)"}'::jsonb),
  ('오빠', 2, 2, '{"ja":"オッパと映画観に行かない?","es":"¿Quieres ir al cine conmigo (tu oppa)?","vi":"Đi xem phim với oppa không?","de":"Willst du mit mir (deinem Oppa) ins Kino?"}'::jsonb),
  ('오빠', 3, 1, '{"ja":"オッパ最高!","es":"¡Oppa, eres el mejor!","vi":"Oppa đỉnh nhất!","de":"Oppa, du bist der Beste!"}'::jsonb),
  ('오빠', 3, 2, '{"ja":"オッパのコンサート、生で観たいな。","es":"Quiero ver el concierto de oppa en persona.","vi":"Muốn đi xem concert của oppa tận nơi.","de":"Ich will Oppas Konzert live sehen."}'::jsonb),
  ('정주행', 1, 1, '{"ja":"今週『ウ・ヨンウ弁護士』を一気見した。","es":"Esta semana me vi Woo, una abogada extraordinaria del tirón.","vi":"Tuần này mình cày hết phim Nữ luật sư kỳ lạ Woo Young Woo.","de":"Diese Woche habe ich Extraordinary Attorney Woo komplett durchgeschaut."}'::jsonb),
  ('좋좋소', 1, 1, '{"ja":"うちの会社、完全にブラック中小企業だよ。","es":"Mi empresa es una pyme de mala muerte.","vi":"Công ty mình đúng kiểu công ty nhỏ tệ hại.","de":"Meine Firma ist eine typische miese Klitsche."}'::jsonb),
  ('좋좋소', 1, 2, '{"ja":"ブラック中小企業からの脱出が今年の目標。","es":"Mi meta este año es escapar de esta pyme cutre.","vi":"Mục tiêu năm nay là thoát khỏi công ty tệ này.","de":"Mein Ziel dieses Jahr: raus aus dieser Klitsche."}'::jsonb),
  ('직관', 1, 1, '{"ja":"今回のコンサート、現地参戦できた!","es":"¡Conseguí ver el concierto en persona!","vi":"Đi xem concert tận nơi thành công!","de":"Ich habe es live ins Konzert geschafft!"}'::jsonb),
  ('직관', 1, 2, '{"ja":"現地参戦のチャンス、チケッティング挑戦してみて。","es":"Toca verlo en vivo: intenta pillar entradas.","vi":"Cơ hội xem trực tiếp đây, thử săn vé đi.","de":"Zeit für live – versuch, Tickets zu ergattern."}'::jsonb),
  ('찐', 1, 1, '{"ja":"この子が私のガチ親友だよ。","es":"Este es mi amigo de verdad.","vi":"Đây là bạn thân thật sự của mình.","de":"Das ist mein echter bester Freund."}'::jsonb),
  ('찐', 1, 2, '{"ja":"ガチでおいしい。","es":"Está bueno de verdad.","vi":"Ngon thật sự.","de":"Das ist wirklich richtig lecker."}'::jsonb),
  ('최애', 1, 1, '{"ja":"私の最推しは絶対ジミン。","es":"Mi favorito absoluto es Jimin, sin duda.","vi":"Bias của mình chắc chắn là Jimin.","de":"Mein absoluter Favorit ist Jimin, ganz klar."}'::jsonb),
  ('최애', 1, 2, '{"ja":"推しの誕生日の準備で忙しい。","es":"Ando liado preparando el cumpleaños de mi favorito.","vi":"Bận rộn chuẩn bị sinh nhật cho bias.","de":"Ich bin mit dem Geburtstag meines Idols beschäftigt."}'::jsonb),
  ('ㅋㅋ', 1, 1, '{"ja":"それマジでウケる(笑)","es":"Eso es muy gracioso jaja","vi":"Cái đó buồn cười thật kkk","de":"Das ist echt lustig haha"}'::jsonb),
  ('ㅋㅋ', 1, 2, '{"ja":"wwww 完全にツボった。","es":"Jajaja me muero de risa.","vi":"Kkkk cười xỉu luôn.","de":"Hahaha, ich sterbe vor Lachen."}'::jsonb),
  ('킹받다', 1, 1, '{"ja":"あーマジでムカつく、なんでそんなこと言うの?","es":"Uf, qué rabia, ¿por qué dice eso?","vi":"Trời, tức ghê, sao lại nói vậy chứ?","de":"Boah, das nervt richtig – warum sagt er so was?"}'::jsonb),
  ('킹받다', 1, 2, '{"ja":"遅刻したのにバスも逃してマジでムカついた。","es":"Llegaba tarde y encima perdí el bus: rabia máxima.","vi":"Đã trễ còn lỡ xe buýt, tức điên luôn.","de":"Schon zu spät und dann noch den Bus verpasst – zum Ausrasten."}'::jsonb),
  ('핑프', 1, 1, '{"ja":"それ検索すればすぐ出るのに、指プリンセスみたいに聞かないで。","es":"Eso sale con una búsqueda, no preguntes como una princesa del dedo.","vi":"Cái đó tìm phát ra ngay, sao cứ hỏi như công chúa lười tra vậy.","de":"Das findet man mit einer Suche – frag nicht wie eine Fingerprinzessin."}'::jsonb),
  ('핵인싸', 1, 1, '{"ja":"あの子はどこへ行っても超陽キャで、友達がすごく多い。","es":"Va donde va y es el alma de la fiesta; tiene un montón de amigos.","vi":"Cậu ấy đi đâu cũng là tâm điểm, bạn bè cực nhiều.","de":"Egal wo, er ist überall der Mittelpunkt und hat mega viele Freunde."}'::jsonb),
  ('핵인싸', 1, 2, '{"ja":"今回の合宿でミンジュンが完全に超陽キャだった。","es":"En el viaje de grupo, Minjun fue el alma de la fiesta.","vi":"Chuyến MT này Minjun đúng là linh hồn của hội.","de":"Beim Gruppenausflug war Minjun der absolute Stimmungsmacher."}'::jsonb),
  ('헐', 1, 1, '{"ja":"え!そんなことがあったの?","es":"¿¡En serio!? ¿Eso pasó?","vi":"Hả, có chuyện đó thật á?","de":"Was?! Das ist wirklich passiert?"}'::jsonb),
  ('헐', 1, 2, '{"ja":"え……マジでショック。","es":"Madre mía... qué fuerte.","vi":"Trời... sốc thật sự.","de":"Krass … das schockiert mich echt."}'::jsonb),
  ('ㅠㅠ', 1, 1, '{"ja":"雨でピクニックが中止になった(泣)","es":"Se canceló el picnic por la lluvia T_T","vi":"Mưa nên buổi dã ngoại bị hủy huhu","de":"Wegen Regen ist das Picknick ausgefallen T_T"}'::jsonb),
  ('ㅠㅠ', 1, 2, '{"ja":"今日は本当に大変だった(泣)","es":"Hoy fue durísimo T_T","vi":"Hôm nay mệt quá huhu","de":"Heute war so anstrengend T_T"}'::jsonb)
)
update public.words w
set meanings = (
  select jsonb_agg(
           me.m || jsonb_build_object(
             'examples',
             (select jsonb_agg(ex.e || coalesce(t.extra, '{}'::jsonb) order by ex.e_idx)
              from jsonb_array_elements(me.m->'examples') with ordinality as ex(e, e_idx)
              left join tr t on t.word = w.word and t.m_idx = me.m_idx and t.e_idx = ex.e_idx)
           )
           order by me.m_idx)
  from jsonb_array_elements(w.meanings::jsonb) with ordinality as me(m, m_idx)
)
where w.word in (select distinct tr.word from tr);

commit;

-- 적용 후 확인:
--   select count(*) from public.words,
--     jsonb_array_elements(meanings::jsonb) m, jsonb_array_elements(m->'examples') e
--   where e ? 'ja' and e ? 'es' and e ? 'vi' and e ? 'de';  → 58