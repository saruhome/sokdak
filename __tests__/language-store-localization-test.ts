import { tFor, type Language } from '@/constants/languageStore';

describe('languageStore critical localization strings', () => {
  const categoryNoResults: Record<Language, string> = {
    ko: '“MZ”에 대한 검색 결과가 없어요',
    en: 'No results found for “MZ”.',
    ja: '「MZ」の検索結果はありません。',
    vi: 'Không tìm thấy kết quả cho “MZ”.',
    es: 'No se encontraron resultados para “MZ”.',
    de: 'Keine Ergebnisse für „MZ“ gefunden.',
    tr: '"MZ" için sonuç bulunamadı.',
  };

  it.each(Object.entries(categoryNoResults))(
    'renders a complete category no-results sentence in %s',
    (language, expected) => {
      expect(tFor(language as Language, 'noCategoryResults').replace('{query}', 'MZ')).toBe(expected);
    },
  );

  it('keeps the streak chip a full template in every locale — no bare-suffix concatenation', () => {
    /* 과거 {count}{suffix} 연결이 라틴 문자에서 "1Tage"를 만들었다 — 템플릿에 {n}이 있어야
     * 각 언어가 어순·띄어쓰기를 스스로 결정한다 (예: 'Tag {n}', '{n}일째') */
    for (const language of ['ko', 'en', 'ja', 'vi', 'es', 'de', 'tr'] as Language[]) {
      const template = tFor(language, 'streakDayCount');
      expect(template).toContain('{n}');
      expect(template.replace('{n}', '3')).not.toMatch(/\d[A-Za-z]/);
    }
  });

  it('uses clear category-search labels in every supported locale', () => {
    const expected: Record<Language, string> = {
      ko: '검색어 지우기',
      en: 'Clear category search',
      ja: '検索語を消去',
      vi: 'Xóa nội dung tìm kiếm danh mục',
      es: 'Limpiar búsqueda de categorías',
      de: 'Kategoriesuche löschen',
      tr: 'Kategori aramasını temizle',
    };

    (Object.entries(expected) as [Language, string][]).forEach(([language, label]) => {
      expect(tFor(language, 'clearCategorySearch')).toBe(label);
    });
  });

  it('describes translation-meaning matches rather than generic matches', () => {
    const expected: Record<Language, string> = {
      ko: '번역 의미 일치:',
      en: 'Matches translation:',
      ja: '翻訳の意味と一致:',
      vi: 'Khớp với nghĩa dịch:',
      es: 'Coincide con la traducción:',
      de: 'Entspricht der Übersetzung:',
      tr: 'Çeviriyle eşleşiyor:',
    };

    (Object.entries(expected) as [Language, string][]).forEach(([language, label]) => {
      expect(tFor(language, 'translationSearchMatch')).toBe(label);
    });
  });
});
