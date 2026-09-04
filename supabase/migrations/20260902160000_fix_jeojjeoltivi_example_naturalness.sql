-- 저쩔티비 예문[0]이 헤드워드(저쩔티비) 없이 상대방(어쩔티비) 대사만 붙여놓은 형태라 어색함.
-- 두 단어 관계를 자연스러운 한 문장 서술로 재작성.
update public.words
set meanings = jsonb_set(
  meanings,
  '{0,examples,0}',
  $j$
  {
    "kor": "친구가 늦잠 잤다고 놀려서 어쩔티비 했더니 걔가 바로 저쩔티비 하더라.",
    "eng": "My friend teased me for oversleeping so I said whatever-TV, and they instantly fired back right-back-at-you-TV.",
    "ja": "寝坊したってからかわれたから어쩔티비って言ったら、すぐ저쩔티비って返された。",
    "es": "Mi amigo se burlo de mi porque me quede dormido, asi que le dije lo-que-sea-tele, y me respondio al instante lo-mismo-digo-tele.",
    "vi": "Ban treu minh vi ngu nuong nen minh noi ke-tivi, the la no dap tra ngay ke lai cau do-tivi.",
    "de": "Mein Freund hat mich wegen Verschlafens aufgezogen, also hab ich Egal-TV gesagt, und er hat sofort mit Gleichfalls-TV zurueckgeschossen."
  }
  $j$::jsonb
)
where id = '130';
