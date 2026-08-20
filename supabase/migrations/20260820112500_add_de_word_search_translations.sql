-- Preserve every existing translation and replace only the German entry for each owned word.
WITH translations_to_upsert (id, de) AS (
  VALUES
    ('1',  'Absolute Insiderin / absoluter Insider'),
    ('2',  'Gottgleich / absolut perfekt'),
    ('3',  'Unbegründeter Hass / erzwungene Kritik'),
    ('4',  'Zwanghaftes „Ja, klar!“ / ständiges Jasagen'),
    ('5',  'Extrem genervt / total sauer'),
    ('6',  'Plötzliche peinliche Stille / Stimmungskiller'),
    ('7',  'Was schaust du gerade?'),
    ('8',  'Du weißt doch, oder?'),
    ('9',  'Legendär / auf GOAT-Niveau'),
    ('10', 'Eine Serie von Folge 1 an durchschauen'),
    ('11', 'Mega-Schnäppchen / riesiger Gewinn'),
    ('12', 'Live vor Ort dabei sein (Konzert)'),
    ('13', 'Ultimativer Bias / Lieblingsmitglied'),
    ('14', 'Später wieder durchstarten und viral gehen'),
    ('15', 'Echt / im Ernst'),
    ('16', 'Krass! / Oh mein Gott! / Echt jetzt?'),
    ('17', 'Echt / authentisch'),
    ('18', 'Kurzformat-Video'),
    ('19', 'Viral gehen'),
    ('20', 'Selbstverschuldetes Desaster'),
    ('21', 'Zu viele Informationen / unnötige private Details'),
    ('22', 'Anerkannt / Zustimmung / Stimme zu'),
    ('23', 'Echt / im Ernst'),
    ('24', 'haha / lol'),
    ('25', 'T_T / weinen'),
    ('26', 'Juhu! / begeisterter Ausruf'),
    ('27', '„Klingt gut“ (widerwillig) / aufgesetzte Positivität'),
    ('28', 'Oppa / liebevolle Anrede für einen männlichen Lieblingsidol'),
    ('29', 'Diszipliniert und produktiv leben / positiver Lebensstil'),
    ('30', 'Einen Witz zu Tode reiten'),
    ('31', '„Fingerprinzessin“ / zu faul zum Suchen')
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
        WHERE existing_translation ->> 'lang' <> '🇩🇪 DE'

        UNION ALL

        SELECT jsonb_build_object('lang', '🇩🇪 DE', 'text', source.de), 1000003
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
  de_count integer;
BEGIN
  SELECT count(*) INTO de_count
  FROM public.words
  WHERE translations @> '[{"lang":"🇩🇪 DE"}]'::jsonb;

  IF de_count <> 31 THEN
    RAISE EXCEPTION 'Expected 31 DE translations, found DE=%', de_count;
  END IF;
END;
$$;
