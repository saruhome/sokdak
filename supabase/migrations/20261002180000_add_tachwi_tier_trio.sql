-- ㅌㅊ 등급 3종 승격 (2026-10-02, 운영자 지시 "ㅅㅌㅊ, ㅎㅌㅊ, ㅍㅌㅊ 추가"):
--   597 ㅅㅌㅊ(상타취) · 598 ㅍㅌㅊ(평타취) · 599 ㅎㅌㅊ(하타취)
-- 검증:
--   597·598 — slang_candidates 후보 행 존재, 둘 다 [표준사전: 없음] 판정.
--             어원 미확정(① 2011.9 일간베스트 얼굴평가 '평타취' 파생설 ② 게임 용어 '평타'와
--             기원이 다르다는 반박설). draft의 origin에 양설을 병기해 둔 상태 그대로 승격한다.
--   599 ㅎㅌㅊ — 후보 행이 없다. 운영자가 세 등급을 묶어 넣으라고 지시해, 쌍인 597·598의
--             구조·어투·i18n 범위를 그대로 따라 리터럴로 작성했다. 뜻(하위권)은 597·598
--             draft가 이미 ㅎㅌㅊ를 "하타취, 하위권"으로 상호 참조하고 있어 그 서술과 일치시켰다.
--             어원은 쌍과 동일하게 미확정으로 서술한다.
--   세 항목 모두 사람 외모 평가에서 퍼진 말이라 usage에 무례해질 수 있다는 주의를 담았다.
--
-- 데이터 출처: 597·598은 slang_candidates.draft_payload 원본을 그대로 옮긴다(손 전사 없음).
-- ponytail: draft_payload 참조 방식 — 후보 행이 지워지면 597·598 insert가 빈다.
--           그때 리터럴 INSERT로 전개할 것(현 운영에선 후보 행을 지우지 않음).
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

insert into public.words (
  id, word, romanization, category, secondary_category,
  short_desc, short_desc_i18n, pronunciation, meanings,
  origin, origin_i18n, "usage", usage_i18n, related_words, likes, saves, translations
)
select v.id,
  p->>'word', p->>'romanization', p->>'category', p->>'secondary_category',
  p->>'short_desc', p->'short_desc_i18n', p->>'pronunciation', p->'meanings',
  p->>'origin', p->'origin_i18n', p->>'usage', p->'usage_i18n',
  coalesce((select array_agg(x) from jsonb_array_elements_text(p->'related_words') x), '{}'::text[]),
  0, 0, p->'translations'
from (values ('597','ㅅㅌㅊ'),('598','ㅍㅌㅊ')) v(id, term)
join public.slang_candidates c on c.term = v.term,
lateral (select c.draft_payload p) q
on conflict (id) do nothing;

insert into public.words (
  id, word, romanization, category, secondary_category,
  short_desc, short_desc_i18n, pronunciation, meanings,
  origin, origin_i18n, "usage", usage_i18n, related_words, likes, saves, translations
) values
('599', 'ㅎㅌㅊ', 'Ha-Ta-Chwi', 'consonant', 'frequently-used',
 '하타취 — 평균보다 아래, 하위권이라는 평가',
 '{"en":"하타취 — \"bottom tier\", rated below average","ja":"하타취 — 平均より下、下位クラスという評価","es":"하타취 — \"nivel bajo\", por debajo de la media","vi":"하타취 — \"hạng dưới\", dưới mức trung bình","de":"하타취 — \"untere Liga\", unter dem Durchschnitt"}'::jsonb,
 '[하-타-취]',
 '[{"type":"명사/서술어","definition":"''하타취(하타치)''의 초성만 딴 말. 사람·물건·작품 등을 셋으로 나눠 매길 때 가장 아래 등급. ㅅㅌㅊ(상타취, 상위권)·ㅍㅌㅊ(평타취, 평균)과 짝을 이루며, 셋 중 유일하게 대놓고 부정적인 평가다.","definition_i18n":{"en":"Initial consonants of 하타취. The bottom band when rating a person, product or work on a three-step scale; it pairs with ㅅㅌㅊ (top) and ㅍㅌㅊ (average), and is the only one of the three that is openly negative.","ja":"「하타취」の初声だけを取った表現。人・物・作品などを三段階で評価するときの最下位。ㅅㅌㅊ(上位)、ㅍㅌㅊ(平均)と対になり、三つの中で唯一はっきり否定的な評価。","es":"Consonantes iniciales de 하타취. La banda inferior al puntuar a una persona, producto u obra en tres niveles; va con ㅅㅌㅊ (alto) y ㅍㅌㅊ (media), y es la única de las tres abiertamente negativa.","vi":"Phụ âm đầu của 하타취. Bậc thấp nhất khi chấm người, đồ vật hay tác phẩm theo ba mức; đi cùng ㅅㅌㅊ (hạng trên) và ㅍㅌㅊ (trung bình), và là mức duy nhất mang nghĩa chê thẳng.","de":"Anfangskonsonanten von 하타취. Die unterste Stufe, wenn man Person, Produkt oder Werk dreistufig bewertet; Gegenstücke sind ㅅㅌㅊ (oben) und ㅍㅌㅊ (Durchschnitt) — als einzige der drei offen negativ."},"examples":[{"kor":"가격 생각하면 이건 ㅎㅌㅊ지.","eng":"For the price, this is bottom tier.","ja":"値段を考えたらこれは下位クラスでしょ。","es":"Para lo que cuesta, esto es de nivel bajo.","vi":"So với giá thì cái này thuộc hạng dưới.","de":"Für den Preis ist das untere Liga."},{"kor":"이번 화는 솔직히 ㅎㅌㅊ였어.","eng":"This episode was honestly bottom tier.","ja":"今回の話は正直、下位クラスだった。","es":"Este capítulo, sinceramente, fue de nivel bajo.","vi":"Tập này thật lòng là hạng dưới.","de":"Diese Folge war ehrlich gesagt untere Liga."}]}]'::jsonb,
 '''하타취''의 초성 ㅎ·ㅌ·ㅊ만 남긴 말. ㅅㅌㅊ·ㅍㅌㅊ와 같은 계열이며 어원은 확정되지 않았다. 세 등급 중 ''평타취''가 먼저 생기고 상타취·하타취가 파생됐다는 설이 있으나 이를 반박하는 설도 있다(상세는 ㅅㅌㅊ 항목 참고). ''타취''가 무엇의 줄임인지도 어느 출처에서도 확정되지 않았다.',
 '{"en":"Initial consonants of 하타취, in the same family as ㅅㅌㅊ and ㅍㅌㅊ; the etymology is unsettled. One account holds that 평타취 came first and 상타취/하타취 were derived from it, but that account is disputed (see the ㅅㅌㅊ entry). What 타취 abbreviates is not established in any source.","ja":"「하타취」の初声。ㅅㅌㅊ·ㅍㅌㅊと同じ系列で語源は未確定。三段階のうち평타취が先に生まれ상타취·하타취が派生したという説があるが、反論する説もある(詳細はㅅㅌㅊの項参照)。「타취」が何の略かもどの出典でも確定していない。","es":"Consonantes iniciales de 하타취, de la misma familia que ㅅㅌㅊ y ㅍㅌㅊ; la etimología no está establecida. Una versión sostiene que 평타취 surgió primero y de ahí 상타취/하타취, pero está en disputa (ver la entrada ㅅㅌㅊ). Tampoco está claro de qué es abreviatura 타취.","vi":"Phụ âm đầu của 하타취, cùng họ với ㅅㅌㅊ và ㅍㅌㅊ; nguồn gốc chưa xác định. Có thuyết cho rằng 평타취 xuất hiện trước rồi mới sinh ra 상타취/하타취, nhưng thuyết này bị phản bác (xem mục ㅅㅌㅊ). 타취 viết tắt của gì cũng chưa rõ.","de":"Anfangskonsonanten von 하타취, aus derselben Familie wie ㅅㅌㅊ und ㅍㅌㅊ; die Herkunft ist ungeklärt. Eine Darstellung sagt, 평타취 sei zuerst entstanden und 상타취/하타취 davon abgeleitet, doch sie ist umstritten (siehe ㅅㅌㅊ). Auch wofür 타취 steht, ist nicht belegt."}'::jsonb,
 '셋 중 가장 세게 들리는 말이다. 작품·음식·물건을 깎아내릴 때 쓰고, 사람의 외모나 능력에 대고 쓰면 모욕이 된다(원래 얼굴 평가 댓글에서 퍼진 말이기 때문). 아쉬움을 부드럽게 말하려면 ''좀 아쉽네'', ''기대보단 별로''처럼 풀어 쓰는 편이 안전하다.',
 '{"en":"The harshest of the three. Fine for panning a work, a dish or a product, but aimed at someone''s looks or ability it is an insult — it spread from face-rating comments. To soften disappointment, plain wording like 좀 아쉽네 (a bit of a letdown) is safer.","ja":"三つの中で最もきつい言葉。作品・食べ物・物をけなすときに使い、人の外見や能力に向けると侮辱になる(元々顔評価のコメントから広まったため)。やんわり伝えたいなら「좀 아쉽네」のように普通に言う方が安全。","es":"La más dura de las tres. Vale para criticar una obra, un plato o un producto, pero dirigida al aspecto o la capacidad de alguien es un insulto: nació de comentarios que puntuaban caras. Para suavizar la decepción, es más seguro decir 좀 아쉽네.","vi":"Nặng nhất trong ba mức. Dùng để chê tác phẩm, món ăn hay đồ vật thì được, nhưng nhắm vào ngoại hình hay năng lực của ai đó thì thành xúc phạm — nó lan ra từ bình luận chấm điểm khuôn mặt. Muốn nói nhẹ hơn thì dùng 좀 아쉽네 cho an toàn.","de":"Das härteste der drei. Für Werke, Essen oder Produkte in Ordnung, auf Aussehen oder Können einer Person gemünzt jedoch eine Beleidigung — es stammt aus Kommentaren zu Gesichtsbewertungen. Wer Enttäuschung sanft ausdrücken will, sagt besser schlicht 좀 아쉽네."}'::jsonb,
 array['ㅅㅌㅊ','ㅍㅌㅊ','노잼','사바사'], 0, 0,
 '[{"lang":"🇺🇸 EN","text":"Bottom tier / Below average"},{"lang":"🇯🇵 JA","text":"下位クラス / 平均以下"},{"lang":"🇨🇳 ZH","text":"下等/低于平均"},{"lang":"🇻🇳 VI","text":"Hạng dưới / Dưới trung bình"},{"lang":"🇪🇸 ES","text":"Nivel bajo / Por debajo de la media"},{"lang":"🇩🇪 DE","text":"Untere Liga / Unterdurchschnittlich"}]'::jsonb)
on conflict (id) do nothing;

update public.slang_candidates
set status = 'published',
    review_note = coalesce(review_note, '') || ' | 승인 2026-10-02 (words id 승격, ㅎㅌㅊ 함께 추가)'
where term in ('ㅅㅌㅊ','ㅍㅌㅊ') and status = 'native_review_pending';

commit;

-- 적용 후 확인: select count(*) from public.words; → 515
