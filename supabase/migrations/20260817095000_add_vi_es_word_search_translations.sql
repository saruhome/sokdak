-- Adds Vietnamese and Spanish search labels for all current production dictionary records.
-- The update preserves all non-VI/ES translations and is safe to rerun: it replaces only
-- the two owned language entries with this reviewed dataset.

WITH translations_to_upsert (id, vi, es) AS (
  VALUES
    ('1',  'Siêu hướng ngoại / người cực kỳ hòa đồng', 'Súper sociable / el alma del grupo'),
    ('2',  'Hoàn hảo tuyệt đối / đỉnh cao', 'Perfecto a nivel dios / impecable'),
    ('3',  'Ghét vô lý / chỉ trích vô căn cứ', 'Hate sin fundamento / crítica forzada'),
    ('4',  'Nghiện trả lời vâng! / bệnh dạ vâng', 'Síndrome de responder sí a todo'),
    ('5',  'Cực kỳ bực mình / tức điên', 'Muy frustrado / enfadadísimo'),
    ('6',  'Bầu không khí bỗng ngượng ngùng / im bặt', 'Silencio incómodo repentino / matar el ambiente'),
    ('7',  'Dạo này bạn xem gì? / đang xem gì?', '¿Qué estás viendo últimamente?'),
    ('8',  'Bạn biết mà, đúng không?', 'Ya sabes, ¿no?'),
    ('9',  'Huyền thoại / đỉnh cao', 'Legendario / nivel leyenda'),
    ('10', 'Cày phim từ đầu đến cuối', 'Maratón de una serie desde el inicio'),
    ('11', 'Lời to / quá hời', 'Chollo enorme / ganancia brutal'),
    ('12', 'Xem trực tiếp tại chỗ / xem concert trực tiếp', 'Asistir en persona / ir al concierto'),
    ('13', 'Bias số một / người mình thích nhất', 'Bias favorito / integrante favorito'),
    ('14', 'Bỗng nổi lại sau thời gian dài', 'Resurgir y hacerse viral después'),
    ('15', 'Thật sự / thiệt luôn', 'En serio / de verdad'),
    ('16', 'Trời ơi / không thể tin được', '¡No puede ser! / ¡Dios mío!'),
    ('17', 'Chính hiệu / thật sự', 'De verdad / auténtico'),
    ('18', 'Video ngắn', 'Video corto'),
    ('19', 'Lan truyền / trở nên viral', 'Hacerse viral'),
    ('20', 'Tự chuốc lấy thảm họa', 'Desastre por culpa propia'),
    ('21', 'Quá nhiều thông tin / chuyện riêng không cần biết', 'Demasiada información / detalles de más'),
    ('22', 'Công nhận / đồng ý', 'Totalmente de acuerdo / te lo concedo'),
    ('23', 'Thật luôn / chuẩn thật', 'Literalmente / de verdad'),
    ('24', 'Haha / lol', 'Jaja / lol'),
    ('25', 'T_T / khóc quá', 'T_T / llorando'),
    ('26', 'Yahuu! / tiếng hét phấn khích', '¡Yuju! / grito de emoción'),
    ('27', 'Miễn là ổn / tích cực gượng ép', 'Todo bien por compromiso / positividad forzada'),
    ('28', 'Oppa / cách gọi thân mật nam idol yêu thích', 'Oppa / forma cariñosa de llamar a un ídolo masculino'),
    ('29', 'Sống kỷ luật và năng suất / lối sống tích cực', 'Vida disciplinada y productiva / hábitos saludables'),
    ('30', 'Lặp lại trò đùa đến chán / làm quá', 'Quemar un chiste / alargarlo demasiado'),
    ('31', 'Người lười tự tìm rồi đi hỏi / công chúa ngón tay', 'Persona que no busca y pregunta todo / pereza de buscar')
),
merged_translations AS (
  SELECT
    w.id,
    (
      SELECT jsonb_agg(entry ORDER BY sort_order)
      FROM (
        SELECT existing_translation AS entry, ordinality::integer AS sort_order
        FROM jsonb_array_elements(COALESCE(w.translations, '[]'::jsonb)) WITH ORDINALITY
          AS existing(existing_translation, ordinality)
        WHERE existing_translation ->> 'lang' NOT IN ('🇻🇳 VI', '🇪🇸 ES')

        UNION ALL

        SELECT jsonb_build_object('lang', '🇻🇳 VI', 'text', source.vi), 1000001

        UNION ALL

        SELECT jsonb_build_object('lang', '🇪🇸 ES', 'text', source.es), 1000002
      ) AS translation_entries
    ) AS translations
  FROM public.words AS w
  INNER JOIN translations_to_upsert AS source ON source.id = w.id
)
UPDATE public.words AS w
SET translations = merged_translations.translations
FROM merged_translations
WHERE w.id = merged_translations.id;

DO $$
DECLARE
  vi_count integer;
  es_count integer;
BEGIN
  SELECT count(*) INTO vi_count
  FROM public.words
  WHERE translations @> '[{"lang":"🇻🇳 VI"}]'::jsonb;

  SELECT count(*) INTO es_count
  FROM public.words
  WHERE translations @> '[{"lang":"🇪🇸 ES"}]'::jsonb;

  IF vi_count <> 31 OR es_count <> 31 THEN
    RAISE EXCEPTION 'Expected 31 VI and 31 ES translations, found VI=% and ES=%', vi_count, es_count;
  END IF;
END;
$$;
