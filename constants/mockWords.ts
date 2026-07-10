/**
 * 속닥 Mock 단어 데이터
 * 실제 API/DB 연결 전 개발용 더미 데이터
 */
export type Word = {
  id: string;
  word: string;
  category: string;
  shortDesc: string;
  pronunciation?: string;
  meanings: Array<{
    type: string;      // 품사
    definition: string;
    examples: Array<{ kor: string; eng: string }>;
  }>;
  origin?: string;
  usage: string;       // 사용 맥락
  relatedWords: string[];
  likes: number;
  saves: number;
  translations: { lang: string; text: string }[];
};

export const MOCK_WORDS: Word[] = [
  {
    id: '1',
    word: '핵인싸',
    category: '일상',
    pronunciation: '[핵-인-싸]',
    shortDesc: '매우 사교적이고 무리에 잘 어울리는 사람',
    meanings: [
      {
        type: '명사',
        definition: '\'핵\'(매우, 아주)과 \'인싸\'(insider)의 합성어. 어떤 무리에서든 핵심 인물로서 사교적으로 활발하게 어울리는 사람.',
        examples: [
          { kor: '걔는 어딜 가도 핵인싸야, 친구가 엄청 많아.', eng: 'They\'re a total social butterfly wherever they go, with tons of friends.' },
          { kor: '이번 MT에서 민준이가 완전 핵인싸였어.', eng: 'Minjun was the life of the party at this MT.' },
        ],
      },
    ],
    origin: '\'핵\'(접두사: 매우, 아주) + \'인싸\'(insider의 줄임말)',
    usage: 'SNS, 일상 대화에서 주로 사용. 칭찬의 뉘앙스로 쓰임.',
    relatedWords: ['인싸', '아싸', '핵아싸', '인싸력'],
    likes: 243,
    saves: 89,
    translations: [
      { lang: '🇺🇸 EN', text: 'The ultimate insider / Social butterfly' },
      { lang: '🇯🇵 JA', text: '超陽キャ / 超インサイダー' },
      { lang: '🇨🇳 ZH', text: '超级社交达人' },
    ],
  },
  {
    id: '2',
    word: '갓벽',
    category: '일상',
    pronunciation: '[갇-벽]',
    shortDesc: '신이 내린 듯 완벽한 상태',
    meanings: [
      {
        type: '형용사/명사',
        definition: '\'God\'(갓)과 \'완벽\'의 합성어. 신의 경지에 달한 완벽함을 표현할 때 사용.',
        examples: [
          { kor: '이 앨범 진짜 갓벽이다, 모든 곡이 다 좋아.', eng: 'This album is absolutely godlike — every track is amazing.' },
          { kor: '오늘 네 발표 완전 갓벽했어!', eng: 'Your presentation today was absolutely perfect!' },
        ],
      },
    ],
    origin: '\'갓\'(God의 한글 표기) + \'완벽\'의 앞글자 탈락',
    usage: 'K-POP 팬덤, 게임, 일상에서 무언가가 극도로 훌륭할 때 사용.',
    relatedWords: ['갓', '완벽', '킹받다', '레전드'],
    likes: 187,
    saves: 62,
    translations: [
      { lang: '🇺🇸 EN', text: 'Godlike / Absolutely perfect' },
      { lang: '🇯🇵 JA', text: '神すぎる / 神完璧' },
      { lang: '🇨🇳 ZH', text: '神级完美' },
    ],
  },
  {
    id: '3',
    word: '억까',
    category: 'K-POP',
    pronunciation: '[억-까]',
    shortDesc: '억지로 까는 행위, 근거 없는 비난',
    meanings: [
      {
        type: '명사/동사',
        definition: '\'억지로 깐다\'의 줄임말. 합리적인 근거 없이 억지로 누군가를 비난하거나 비하하는 행위.',
        examples: [
          { kor: '저건 그냥 억까잖아, 말이 안 되는 비판이야.', eng: 'That\'s just baseless hate — the criticism makes no sense.' },
          { kor: '아무리 팬이어도 억까는 하지 마.', eng: 'Even if you\'re a fan, don\'t engage in baseless criticism.' },
        ],
      },
    ],
    origin: '\'억지로\'의 \'억\' + \'깐다\'(비판하다)의 \'까\'',
    usage: 'K-POP 팬덤 커뮤니티에서 비롯되었으나 현재는 일반 온라인에서도 광범위하게 사용.',
    relatedWords: ['까다', '팬덤', '악플', '부정적 여론몰이'],
    likes: 312,
    saves: 104,
    translations: [
      { lang: '🇺🇸 EN', text: 'Baseless hate / Forced criticism' },
      { lang: '🇯🇵 JA', text: '言いがかり / 無理やりdis' },
      { lang: '🇨🇳 ZH', text: '无理由黑 / 强行踩' },
    ],
  },
  {
    id: '4',
    word: '넵병',
    category: '일상',
    pronunciation: '[넵-뼝]',
    shortDesc: '메신저에서 \'네\' 대신 \'넵!\'을 남발하는 직장인 증상',
    meanings: [
      {
        type: '명사',
        definition: '메신저에서 \'네\'라고 대답해야 할 상황에 반사적으로 \'넵!\'을 입력하는 현상. 과도한 긍정과 복종을 표현.',
        examples: [
          { kor: '과장님한테 또 넵! 했어, 완전 넵병이야.', eng: 'I typed "Yes sir!" to the manager again — total "Yes-itis".' },
          { kor: '월급 루팡인데 넵병은 심하다.', eng: 'Barely doing any work, but can\'t stop saying "Yes sir!" all the time.' },
        ],
      },
    ],
    origin: '\'넵\'(네의 귀여운 표현) + \'병\'(병적으로 반복되는 증상)',
    usage: '직장인 커뮤니티, 온라인에서 자조적으로 사용. \'오피스 라이프\' 카테고리 대표 단어.',
    relatedWords: ['오피스 라이프', '월급 루팡', '직장인', 'ㅠㅠ'],
    likes: 428,
    saves: 156,
    translations: [
      { lang: '🇺🇸 EN', text: '"Yes-itis" / Compulsive "Yes sir!"-ing' },
      { lang: '🇯🇵 JA', text: '「はいッ！」病' },
      { lang: '🇨🇳 ZH', text: '好的症 / 强迫性回复好的' },
    ],
  },
  {
    id: '5',
    word: '킹받다',
    category: '일상',
    pronunciation: '[킹-받-따]',
    shortDesc: '매우 열받다, 극도로 화가 나다',
    meanings: [
      {
        type: '동사',
        definition: '\'킹\'(king, 최고 강조 접두사) + \'열받다\'의 합성. 아주 심하게 화가 나거나 짜증이 나는 상태.',
        examples: [
          { kor: '아 진짜 킹받네, 왜 그런 말을 하는 거야?', eng: 'Ugh, that\'s so infuriating — why would they say that?' },
          { kor: '지각했는데 버스도 놓쳐서 킹받았어.', eng: 'I was already late and then missed the bus — absolutely fuming.' },
        ],
      },
    ],
    origin: '\'킹\'(King, 영어에서 차용된 강조 접두사) + \'열받다\'(화나다)',
    usage: '10-30대 온라인/오프라인 모두에서 사용. 강조를 위한 \'킹\' 접두사 시리즈 중 하나.',
    relatedWords: ['열받다', '킹치만', '갓벽', '핵노잼'],
    likes: 356,
    saves: 121,
    translations: [
      { lang: '🇺🇸 EN', text: 'Supremely pissed off / King-level annoyed' },
      { lang: '🇯🇵 JA', text: 'キングにムカつく / 超腹立つ' },
      { lang: '🇨🇳 ZH', text: '超级气 / 王炸级别的烦' },
    ],
  },
  { id: '6', word: '갑분싸', category: '일상', pronunciation: '[갑-분-싸]', shortDesc: '갑자기 분위기 싸해짐', meanings: [{ type: '명사', definition: '\'갑자기 분위기 싸해짐\'의 줄임말. 아무렇지도 않게 흐르던 분위기가 갑작스럽게 어색하거나 냉랭해지는 상황.', examples: [{ kor: '그 말 하고 나서 갑분싸가 됐어.', eng: 'After saying that, the vibe suddenly got really awkward.' }, { kor: '갑분싸 만든 사람이 누구야?', eng: 'Who killed the vibe just now?' }] }], origin: '\'갑자기\' + \'분위기\' + \'싸해짐\'', usage: '온라인, 오프라인 모두. 모임, SNS 댓글 등에서 분위기 묘사에 사용.', relatedWords: ['분위기', '어색하다', '갑분쓸'], likes: 289, saves: 97, translations: [{ lang: '🇺🇸 EN', text: 'Sudden awkward silence / Vibe killer moment' }, { lang: '🇯🇵 JA', text: '急に空気が冷える' }, { lang: '🇨🇳 ZH', text: '突然冷场' }] },
  { id: '7', word: '요즘 뭐 봐?', category: '드라마/영화', pronunciation: '', shortDesc: '근황 인사의 한 방식으로 자리 잡은 드라마/콘텐츠 추천 표현', meanings: [{ type: '표현', definition: '\'요즘 뭐 봐?\'는 안부 인사를 대신하는 콘텐츠 중심의 인사법으로 자리 잡은 신조어적 표현.', examples: [{ kor: '오랜만이야! 요즘 뭐 봐?', eng: 'Long time no see! What are you watching these days?' }] }], origin: '콘텐츠 소비가 일상화되면서 안부 인사 대신 콘텐츠 추천/공유로 대화를 시작하는 문화에서 발생', usage: '친한 사람들 사이에서 근황 대신 콘텐츠로 대화를 시작할 때 사용.', relatedWords: ['정주행', '몰아보기', 'OTT', '넷플릭스'], likes: 167, saves: 43, translations: [{ lang: '🇺🇸 EN', text: 'What are you watching these days?' }, { lang: '🇯🇵 JA', text: '最近何見てる？' }, { lang: '🇨🇳 ZH', text: '最近在看什么？' }] },
  { id: '8', word: '알잖아', category: '일상', pronunciation: '[알-자-나]', shortDesc: '상대방이 이미 알고 있다는 것을 전제하는 표현', meanings: [{ type: '표현', definition: '\'너도 알잖아\'의 줄임말. 어떤 사실을 새로 설명하지 않고 상대가 이미 알고 있음을 전제하며 넘어갈 때 사용.', examples: [{ kor: '그거 왜 그런지 알잖아, 더 설명 안 해도 되지?', eng: 'You know why, right? No need to explain further.' }] }], origin: '\'(너도) 알잖아\'의 구어적 줄임 표현', usage: '친한 사이에서 설명을 생략하며 공감대를 형성할 때.', relatedWords: ['너도 알잖아', '있잖아', '그거 알아?'], likes: 134, saves: 28, translations: [{ lang: '🇺🇸 EN', text: 'You know (right)? / You already know' }, { lang: '🇯🇵 JA', text: 'わかるじゃん' }, { lang: '🇨🇳 ZH', text: '你懂的' }] },
  { id: '9', word: '레전드', category: 'K-POP', pronunciation: '[레-전-드]', shortDesc: '전설적인, 역사에 남을 만큼 훌륭한', meanings: [{ type: '명사/형용사', definition: '영어 \'legend\'의 한국어 발음. K-POP 팬덤에서 시작해 일반적으로 확산. 역사적으로 남을 정도로 훌륭하거나 인상적인 무언가.', examples: [{ kor: '그 무대 진짜 레전드였어, 두고두고 회자될 거야.', eng: 'That performance was legendary — people will be talking about it for years.' }] }], origin: '영어 \'legend\'의 한글 표기 → K-POP 팬덤 → 일반 사용으로 확산', usage: 'K-POP 콘텐츠, 게임, 스포츠 모두에서 쓰이는 범용 칭찬 표현.', relatedWords: ['갓벽', '갓', '전설', '명반'], likes: 402, saves: 138, translations: [{ lang: '🇺🇸 EN', text: 'Legendary / GOAT-level' }, { lang: '🇯🇵 JA', text: '伝説 / レジェンド' }, { lang: '🇨🇳 ZH', text: '传说级 / 封神' }] },
  { id: '10', word: '정주행', category: '드라마/영화', pronunciation: '[정-주-행]', shortDesc: '콘텐츠를 처음부터 끝까지 순서대로 모두 보는 것', meanings: [{ type: '명사/동사', definition: '드라마, 애니, 유튜브 채널 등 콘텐츠를 1화(1편)부터 최신화까지 순서대로 전부 보는 행위.', examples: [{ kor: '이번 주에 이상한 변호사 우영우 정주행 했어.', eng: 'This week I watched all of Extraordinary Attorney Woo from start to finish.' }] }], origin: '\'정방향 주행\'의 줄임말 → 역주행(인기 없다가 나중에 뜨는 것)의 반대 개념', usage: 'OTT 플랫폼 대중화 이후 급속도로 퍼짐. 콘텐츠 소비 문화 핵심 단어.', relatedWords: ['역주행', '몰아보기', '완결', 'OTT'], likes: 358, saves: 115, translations: [{ lang: '🇺🇸 EN', text: 'Binge-watching from ep 1 / Watching in order' }, { lang: '🇯🇵 JA', text: '1話から全部見る / イッキ見（順番に）' }, { lang: '🇨🇳 ZH', text: '从头到尾追完 / 正刷' }] },
];
