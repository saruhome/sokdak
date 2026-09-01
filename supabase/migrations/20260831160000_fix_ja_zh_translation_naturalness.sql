-- 긁?/꾸안꾸의 translations 칩(JA·ZH)에 한글 원문이 그대로 섞여 부자연스러웠던 것 수정.
-- 다른 항목들의 관례(가타카나 음역 또는 원문 반복 없이 번역만)를 따름.
update public.words
set translations = (
  select jsonb_agg(
    case when t->>'lang' = '🇯🇵 JA'
      then jsonb_set(t, '{text}', '"痛いとこ突いた?(言い返し文句)"')
      else t end
  )
  from jsonb_array_elements(translations) t
)
where id = '116';

update public.words
set translations = (
  select jsonb_agg(
    case
      when t->>'lang' = '🇯🇵 JA' then jsonb_set(t, '{text}', '"頑張ってなさそうで実は計算(クアンク)"')
      when t->>'lang' = '🇨🇳 ZH' then jsonb_set(t, '{text}', '"看似不化妆的精致妆"')
      else t end
  )
  from jsonb_array_elements(translations) t
)
where id = '124';
