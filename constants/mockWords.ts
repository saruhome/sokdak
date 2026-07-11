/** 속닥 Mock 단어 데이터 (전 카테고리 커버) */
export type Word = {
  id: string;
  word: string;
  category: string;   // Category slug
  shortDesc: string;
  pronunciation?: string;
  meanings: Array<{
    type: string;
    definition: string;
    examples: Array<{ kor: string; eng: string }>;
  }>;
  origin?: string;
  usage: string;
  relatedWords: string[];
  likes: number;
  saves: number;
  translations: { lang: string; text: string }[];
};

export const MOCK_WORDS: Word[] = [
  // ── 일상 ──
  {
    id: '1', word: '핵인싸', category: 'daily',
    pronunciation: '[핵-인-싸]', shortDesc: '매우 사교적이고 무리에 잘 어울리는 사람',
    meanings: [{ type: '명사', definition: "'핵'(매우)과 '인싸'(insider)의 합성어. 어떤 무리에서든 핵심 인물로서 활발하게 어울리는 사람.", examples: [{ kor: '걔는 어딜 가도 핵인싸야, 친구가 엄청 많아.', eng: "They're a total social butterfly wherever they go." }, { kor: '이번 MT에서 민준이가 완전 핵인싸였어.', eng: 'Minjun was the life of the party at the MT.' }] }],
    origin: "'핵'(접두사: 매우) + '인싸'(insider의 줄임말)",
    usage: 'SNS, 일상 대화에서 칭찬의 뉘앙스로 쓰임.',
    relatedWords: ['인싸', '아싸', '핵아싸'], likes: 243, saves: 89,
    translations: [{ lang: '🇺🇸 EN', text: 'The ultimate insider / Social butterfly' }, { lang: '🇯🇵 JA', text: '超陽キャ' }, { lang: '🇨🇳 ZH', text: '超级社交达人' }],
  },
  {
    id: '2', word: '갓벽', category: 'daily',
    pronunciation: '[갇-벽]', shortDesc: '신이 내린 듯 완벽한 상태',
    meanings: [{ type: '형용사/명사', definition: "'God'(갓)과 '완벽'의 합성어. 신의 경지에 달한 완벽함.", examples: [{ kor: '이 앨범 진짜 갓벽이다.', eng: 'This album is absolutely godlike.' }, { kor: '오늘 네 발표 완전 갓벽했어!', eng: 'Your presentation today was absolutely perfect!' }] }],
    origin: "'갓'(God) + '완벽'의 합성",
    usage: 'K-POP 팬덤, 게임, 일상에서 극도로 훌륭할 때.',
    relatedWords: ['갓', '완벽', '레전드'], likes: 187, saves: 62,
    translations: [{ lang: '🇺🇸 EN', text: 'Godlike / Absolutely perfect' }, { lang: '🇯🇵 JA', text: '神完璧' }, { lang: '🇨🇳 ZH', text: '神级完美' }],
  },
  {
    id: '4', word: '넵병', category: 'daily',
    pronunciation: '[넵-뼝]', shortDesc: "메신저에서 '네' 대신 '넵!'을 남발하는 직장인 증상",
    meanings: [{ type: '명사', definition: "메신저에서 반사적으로 '넵!'을 입력하는 현상. 과도한 긍정과 복종 표현.", examples: [{ kor: '과장님한테 또 넵! 했어, 완전 넵병이야.', eng: "I typed 'Yes sir!' to the manager again." }, { kor: '월급 루팡인데 넵병은 심하다.', eng: "Barely doing any work but can't stop saying 'Yes sir!'" }] }],
    origin: "'넵'(네의 귀여운 표현) + '병'(병적 반복 증상)",
    usage: '직장인 커뮤니티, 오피스 라이프 자조 표현.',
    relatedWords: ['오피스 라이프', '월급 루팡'], likes: 428, saves: 156,
    translations: [{ lang: '🇺🇸 EN', text: '"Yes-itis" / Compulsive yes-sirring' }, { lang: '🇯🇵 JA', text: '「はいッ！」病' }, { lang: '🇨🇳 ZH', text: '好的症' }],
  },
  {
    id: '5', word: '킹받다', category: 'daily',
    pronunciation: '[킹-받-따]', shortDesc: '매우 열받다, 극도로 화가 나다',
    meanings: [{ type: '동사', definition: "'킹'(king, 최고 강조 접두사) + '열받다'의 합성.", examples: [{ kor: '아 진짜 킹받네, 왜 그런 말을 하는 거야?', eng: "Ugh, that's so infuriating." }, { kor: '지각했는데 버스도 놓쳐서 킹받았어.', eng: 'I was already late and then missed the bus — absolutely fuming.' }] }],
    origin: "'킹'(King, 강조 접두사) + '열받다'",
    usage: '10-30대 온라인/오프라인 모두.',
    relatedWords: ['열받다', '킹치만', '갓벽'], likes: 356, saves: 121,
    translations: [{ lang: '🇺🇸 EN', text: 'Supremely pissed off' }, { lang: '🇯🇵 JA', text: 'キングにムカつく' }, { lang: '🇨🇳 ZH', text: '超级气' }],
  },
  {
    id: '6', word: '갑분싸', category: 'daily',
    pronunciation: '[갑-분-싸]', shortDesc: '갑자기 분위기 싸해짐',
    meanings: [{ type: '명사', definition: "'갑자기 분위기 싸해짐'의 줄임말.", examples: [{ kor: '그 말 하고 나서 갑분싸가 됐어.', eng: 'The vibe suddenly got really awkward after that.' }, { kor: '갑분싸 만든 사람이 누구야?', eng: 'Who killed the vibe just now?' }] }],
    origin: "'갑자기' + '분위기' + '싸해짐'",
    usage: '모임, SNS 댓글 등에서 분위기 묘사.',
    relatedWords: ['분위기', '어색하다'], likes: 289, saves: 97,
    translations: [{ lang: '🇺🇸 EN', text: 'Sudden awkward silence / Vibe killer' }, { lang: '🇯🇵 JA', text: '急に空気が冷える' }, { lang: '🇨🇳 ZH', text: '突然冷场' }],
  },
  {
    id: '8', word: '알잖아', category: 'daily',
    pronunciation: '[알-자-나]', shortDesc: '상대방이 이미 알고 있다는 것을 전제하는 표현',
    meanings: [{ type: '표현', definition: "'너도 알잖아'의 줄임말.", examples: [{ kor: '그거 왜 그런지 알잖아, 더 설명 안 해도 되지?', eng: "You know why, right? No need to explain further." }] }],
    origin: "'(너도) 알잖아'의 구어적 줄임",
    usage: '친한 사이에서 설명을 생략하며 공감대 형성.',
    relatedWords: ['너도 알잖아', '있잖아'], likes: 134, saves: 28,
    translations: [{ lang: '🇺🇸 EN', text: 'You know (right)?' }, { lang: '🇯🇵 JA', text: 'わかるじゃん' }, { lang: '🇨🇳 ZH', text: '你懂的' }],
  },
  {
    id: '11', word: '개이득', category: 'daily',
    pronunciation: '[개-이-득]', shortDesc: '엄청난 이득, 예상보다 훨씬 좋은 결과',
    meanings: [{ type: '명사/감탄사', definition: "'개'(매우, 강조 접두사) + '이득'. 기대 이상의 혜택이나 이익을 얻었을 때.", examples: [{ kor: '1+1이라고? 개이득이다!', eng: 'Buy one get one free? What a steal!' }, { kor: '환불도 되고 교환도 된다니 개이득이네.', eng: "Both refund and exchange? That's an insane deal." }] }],
    origin: "'개'(강조 접두사) + '이득'",
    usage: '쇼핑, 거래, 행운 상황에서 쓰는 감탄 표현.',
    relatedWords: ['이득', '꿀', '핵이득'], likes: 312, saves: 108,
    translations: [{ lang: '🇺🇸 EN', text: "What a steal / Massive win" }, { lang: '🇯🇵 JA', text: '激得' }, { lang: '🇨🇳 ZH', text: '大赚特赚' }],
  },

  // ── K-POP ──
  {
    id: '3', word: '억까', category: 'kpop',
    pronunciation: '[억-까]', shortDesc: '억지로 까는 행위, 근거 없는 비난',
    meanings: [{ type: '명사/동사', definition: "'억지로 깐다'의 줄임말. 합리적 근거 없이 억지로 비난하는 행위.", examples: [{ kor: '저건 그냥 억까잖아, 말이 안 되는 비판이야.', eng: "That's just baseless hate." }, { kor: '아무리 팬이어도 억까는 하지 마.', eng: "Even if you're a fan, don't engage in baseless criticism." }] }],
    origin: "'억지로'의 '억' + '깐다'의 '까'",
    usage: 'K-POP 팬덤에서 비롯, 현재 온라인 전반에서 사용.',
    relatedWords: ['까다', '팬덤', '악플'], likes: 312, saves: 104,
    translations: [{ lang: '🇺🇸 EN', text: 'Baseless hate / Forced criticism' }, { lang: '🇯🇵 JA', text: '言いがかり' }, { lang: '🇨🇳 ZH', text: '无理由黑' }],
  },
  {
    id: '9', word: '레전드', category: 'kpop',
    pronunciation: '[레-전-드]', shortDesc: '전설적인, 역사에 남을 만큼 훌륭한',
    meanings: [{ type: '명사/형용사', definition: "영어 'legend'의 한국어 발음. 역사적으로 남을 정도로 훌륭한 무언가.", examples: [{ kor: '그 무대 진짜 레전드였어.', eng: "That performance was legendary." }] }],
    origin: "영어 'legend' → K-POP 팬덤 → 일반 사용 확산",
    usage: 'K-POP, 게임, 스포츠 모두에서 쓰이는 범용 칭찬 표현.',
    relatedWords: ['갓벽', '갓', '전설'], likes: 402, saves: 138,
    translations: [{ lang: '🇺🇸 EN', text: 'Legendary / GOAT-level' }, { lang: '🇯🇵 JA', text: '伝説' }, { lang: '🇨🇳 ZH', text: '传说级' }],
  },
  {
    id: '12', word: '직관', category: 'kpop',
    pronunciation: '[직-관]', shortDesc: '콘서트에 직접 관람하러 가는 것',
    meanings: [{ type: '명사/동사', definition: "'직접 관람'의 줄임말. 콘서트나 공연장에 직접 가서 보는 행위.", examples: [{ kor: '이번 콘서트 직관 성공했어!', eng: "I managed to see the concert in person!" }, { kor: '직관 각이다, 티켓팅 도전해봐.', eng: "Time to go in person — try getting a ticket." }] }],
    origin: "'직접 관람'의 줄임",
    usage: 'K-POP 팬덤의 콘서트·행사 관련 필수 용어.',
    relatedWords: ['티켓팅', '굿즈', '최애', '팬미팅'], likes: 267, saves: 93,
    translations: [{ lang: '🇺🇸 EN', text: 'Attending in person (concert)' }, { lang: '🇯🇵 JA', text: '現場参戦' }, { lang: '🇨🇳 ZH', text: '现场观看' }],
  },
  {
    id: '13', word: '최애', category: 'kpop',
    pronunciation: '[최-애]', shortDesc: '가장 좋아하는 멤버 또는 최고로 사랑하는 대상',
    meanings: [{ type: '명사', definition: "'최고로 사랑함'의 줄임. K-POP에서 자신이 제일 좋아하는 아이돌 멤버를 가리킬 때 사용.", examples: [{ kor: '내 최애는 무조건 지민이야.', eng: 'My ultimate bias is Jimin, hands down.' }, { kor: '최애 생일 챙기느라 바빠.', eng: "Busy preparing for my bias's birthday." }] }],
    origin: "일본어 '推し(おし)'에서 유래해 한국화된 표현",
    usage: 'K-POP 팬덤 핵심 용어. 최근에는 일반 선호 표현으로도 확장.',
    relatedWords: ['직관', '티켓팅', '굿즈', '입덕'], likes: 445, saves: 167,
    translations: [{ lang: '🇺🇸 EN', text: 'Ultimate bias / Favorite member' }, { lang: '🇯🇵 JA', text: '推し(おし)' }, { lang: '🇨🇳 ZH', text: '最爱/偶像' }],
  },

  // ── 드라마/영화 ──
  {
    id: '7', word: '요즘 뭐 봐?', category: 'drama',
    pronunciation: '', shortDesc: '안부 인사를 대신하는 콘텐츠 중심 표현',
    meanings: [{ type: '표현', definition: "안부 인사를 대신하는 콘텐츠 공유형 인사법.", examples: [{ kor: '오랜만이야! 요즘 뭐 봐?', eng: "Long time no see! What are you watching these days?" }] }],
    origin: 'OTT 플랫폼 대중화 이후 콘텐츠 소비가 일상화되며 발생',
    usage: '친한 사람들 사이에서 근황 대신 콘텐츠로 대화 시작.',
    relatedWords: ['정주행', '몰아보기', 'OTT'], likes: 167, saves: 43,
    translations: [{ lang: '🇺🇸 EN', text: 'What are you watching these days?' }, { lang: '🇯🇵 JA', text: '最近何見てる？' }, { lang: '🇨🇳 ZH', text: '最近在看什么？' }],
  },
  {
    id: '10', word: '정주행', category: 'drama',
    pronunciation: '[정-주-행]', shortDesc: '콘텐츠를 처음부터 끝까지 순서대로 모두 보는 것',
    meanings: [{ type: '명사/동사', definition: "드라마, 애니 등을 1화부터 최신화까지 순서대로 전부 보는 행위.", examples: [{ kor: '이번 주에 이상한 변호사 우영우 정주행 했어.', eng: "This week I watched all of Extraordinary Attorney Woo from start to finish." }] }],
    origin: "'정방향 주행'의 줄임말 → 역주행의 반대 개념",
    usage: 'OTT 플랫폼 대중화 이후 급속도로 퍼짐.',
    relatedWords: ['역주행', '몰아보기', 'OTT'], likes: 358, saves: 115,
    translations: [{ lang: '🇺🇸 EN', text: 'Binge-watching from ep 1' }, { lang: '🇯🇵 JA', text: '1話から全部見る' }, { lang: '🇨🇳 ZH', text: '从头到尾追完' }],
  },
  {
    id: '14', word: '역주행', category: 'drama',
    pronunciation: '[역-주-행]', shortDesc: '과거에 나온 콘텐츠가 뒤늦게 인기를 얻는 현상',
    meanings: [{ type: '명사', definition: "오래된 노래·드라마·영화가 갑자기 뒤늦게 인기를 끄는 현상.", examples: [{ kor: '그 노래 완전 역주행이잖아, 몇 년 전 노래인데.', eng: "That song's doing a total comeback — it's years old!" }, { kor: '드라마가 종영 후에 역주행하는 경우도 많아.', eng: 'Many dramas go viral after they end.' }] }],
    origin: "'역방향 주행'의 줄임 → 정주행(순방향)의 반대",
    usage: '음악 차트, 스트리밍, SNS 바이럴 콘텐츠에서 주로 사용.',
    relatedWords: ['정주행', '바이럴', '스트리밍'], likes: 298, saves: 87,
    translations: [{ lang: '🇺🇸 EN', text: 'Comeback / Going viral retroactively' }, { lang: '🇯🇵 JA', text: '逆走（逆再生ブーム）' }, { lang: '🇨🇳 ZH', text: '逆袭/翻红' }],
  },

  // ── 감탄사 ──
  {
    id: '15', word: '레알', category: 'exclamation',
    pronunciation: '[레-알]', shortDesc: '진짜, 정말 — 강조 감탄사',
    meanings: [{ type: '감탄사/부사', definition: "스페인어 'Real'에서 온 것으로 추정. '진짜', '정말'을 강조할 때 사용.", examples: [{ kor: '레알? 그게 사실이야?', eng: "For real? Is that actually true?" }, { kor: '레알로 맛있다 이 거.', eng: 'This is genuinely delicious.' }] }],
    origin: "스페인어 'real' 차용 또는 온라인 은어에서 자연 발생",
    usage: "10-20대에서 '진짜'의 강조 표현으로 폭넓게 사용.",
    relatedWords: ['진짜', '헐', '대박'], likes: 334, saves: 112,
    translations: [{ lang: '🇺🇸 EN', text: 'For real / Seriously' }, { lang: '🇯🇵 JA', text: 'マジで' }, { lang: '🇨🇳 ZH', text: '真的吗/认真的' }],
  },
  {
    id: '16', word: '헐', category: 'exclamation',
    pronunciation: '[헐]', shortDesc: '놀라움이나 당혹감을 나타내는 감탄사',
    meanings: [{ type: '감탄사', definition: "놀라움, 어이없음, 당혹감을 한 음절로 표현하는 감탄사.", examples: [{ kor: '헐, 그런 일이 있었어?', eng: "Whoa, that actually happened?" }, { kor: '헐... 진짜 충격이다.', eng: "Oh my... that's genuinely shocking." }] }],
    origin: '정확한 기원 불명. 2000년대 초 인터넷 은어로 보급됨.',
    usage: '남녀노소 가장 광범위하게 쓰이는 한국 감탄사 중 하나.',
    relatedWords: ['레알', '대박', '어머'], likes: 512, saves: 203,
    translations: [{ lang: '🇺🇸 EN', text: 'Whoa / Oh my / No way' }, { lang: '🇯🇵 JA', text: 'えっ / うわ' }, { lang: '🇨🇳 ZH', text: '哇 / 天啊' }],
  },
  {
    id: '17', word: '찐', category: 'exclamation',
    pronunciation: '[찐]', shortDesc: '진짜, 진심, 진정한 — 진짜임을 강조',
    meanings: [{ type: '부사/형용사', definition: "'진짜'의 강조형. 가식 없이 진심으로, 혹은 진정한 의미의 무언가를 표현.", examples: [{ kor: '이 친구가 내 찐친이야.', eng: 'This person is my genuine bestie.' }, { kor: '찐으로 맛있다.', eng: "This is genuinely, truly delicious." }] }],
    origin: "'진짜'의 'ㅈ'과 강조 발음이 결합된 신조 발음",
    usage: "'찐친(진짜 친구)', '찐사랑' 등 합성어로도 활발히 쓰임.",
    relatedWords: ['레알', '진심', '찐친'], likes: 388, saves: 143,
    translations: [{ lang: '🇺🇸 EN', text: 'Genuine / For real / True' }, { lang: '🇯🇵 JA', text: 'マジ / 本物の' }, { lang: '🇨🇳 ZH', text: '真的/真诚的' }],
  },

  // ── 릴스 ──
  {
    id: '18', word: '숏폼', category: 'reels',
    pronunciation: '[숏-폼]', shortDesc: '짧은 영상 콘텐츠 형식',
    meanings: [{ type: '명사', definition: "'Short-form'의 한국어 표기. 15초-3분 내외의 짧은 영상 콘텐츠.", examples: [{ kor: '요즘 숏폼이 대세야, 긴 영상은 잘 안 봐.', eng: "Short-form content is king these days — nobody watches long videos anymore." }] }],
    origin: "영어 'short-form content'에서 차용",
    usage: 'TikTok·Instagram Reels·YouTube Shorts 대중화 이후 일상어화.',
    relatedWords: ['릴스', '틱톡', '바이럴'], likes: 276, saves: 91,
    translations: [{ lang: '🇺🇸 EN', text: 'Short-form (video content)' }, { lang: '🇯🇵 JA', text: 'ショート動画' }, { lang: '🇨🇳 ZH', text: '短视频' }],
  },
  {
    id: '19', word: '바이럴', category: 'reels',
    pronunciation: '[바-이-럴]', shortDesc: '인터넷에서 빠르게 퍼지는 콘텐츠 현상',
    meanings: [{ type: '명사/동사', definition: "영어 'viral'의 한국어 표기. 콘텐츠가 SNS에서 폭발적으로 공유되는 현상.", examples: [{ kor: '그 영상 완전 바이럴됐잖아.', eng: 'That video went totally viral.' }, { kor: '바이럴 마케팅으로 매출이 터졌어.', eng: 'Viral marketing blew up our sales.' }] }],
    origin: "영어 'viral' 차용",
    usage: '마케팅, SNS, 인플루언서 관련 콘텐츠에서 핵심 용어.',
    relatedWords: ['숏폼', '릴스', '인플루언서'], likes: 231, saves: 78,
    translations: [{ lang: '🇺🇸 EN', text: 'Go viral' }, { lang: '🇯🇵 JA', text: 'バズる' }, { lang: '🇨🇳 ZH', text: '爆红/病毒式传播' }],
  },

  // ── 새로운 신조어 ──
  {
    id: '20', word: '스불재', category: 'new-slang',
    pronunciation: '[스-불-재]', shortDesc: '스스로 불러온 재앙 — 자초한 사태',
    meanings: [{ type: '명사', definition: "'스스로 불러온 재앙'의 줄임. 자신의 행동이 원인이 되어 발생한 나쁜 상황.", examples: [{ kor: '늦잠 자다가 지각한 거잖아, 완전 스불재야.', eng: "You overslept and got late — that's a self-inflicted disaster." }] }],
    origin: "'스스로' + '불러온' + '재앙'의 각 첫 글자",
    usage: '자조적 상황 묘사. 2023년 이후 빠르게 확산된 신조어.',
    relatedWords: ['자초', '내탓', 'TMI'], likes: 389, saves: 134,
    translations: [{ lang: '🇺🇸 EN', text: 'Self-inflicted disaster' }, { lang: '🇯🇵 JA', text: '自業自得災害' }, { lang: '🇨🇳 ZH', text: '自找的灾难' }],
  },
  {
    id: '21', word: 'TMI', category: 'new-slang',
    pronunciation: '[티-엠-아이]', shortDesc: '너무 많거나 불필요한 정보',
    meanings: [{ type: '명사/감탄사', definition: "영어 'Too Much Information'의 약자. 굳이 알고 싶지 않은 과도한 개인 정보나 세부 사항.", examples: [{ kor: 'TMI인데, 나 어제 밤새 울었어.', eng: "TMI, but I cried all night yesterday." }, { kor: '그건 좀 TMI 아니야?', eng: "Isn't that a bit TMI?" }] }],
    origin: "영어 'Too Much Information'의 약자, 한국에서 신조어화",
    usage: '과도한 개인 정보 공유 상황에서 광범위하게 사용.',
    relatedWords: ['스불재', '공유', '정보 과잉'], likes: 445, saves: 178,
    translations: [{ lang: '🇺🇸 EN', text: 'Too Much Information (TMI)' }, { lang: '🇯🇵 JA', text: 'TMI' }, { lang: '🇨🇳 ZH', text: '信息过量' }],
  },

  // ── 자주 쓰는 신조어 ──
  {
    id: '22', word: 'ㅇㅈ', category: 'frequently-used',
    pronunciation: '[인-정]', shortDesc: '인정 — 동의하거나 맞다고 인정할 때',
    meanings: [{ type: '감탄사/동사', definition: "'인정'의 초성 줄임말. 상대방의 말이 옳거나 사실임을 인정할 때.", examples: [{ kor: '그 말이 맞는 거 ㅇㅈ이지.', eng: "Gotta admit that's true." }, { kor: 'ㅇㅈ, 나도 그렇게 생각해.', eng: "Agreed, I think so too." }] }],
    origin: "'인정'의 초성 ㅇ, ㅈ만 추출",
    usage: '채팅, 댓글에서 빠른 동의·인정 표현.',
    relatedWords: ['인정', 'ㄹㅇ', 'ㅇㅇ'], likes: 567, saves: 213,
    translations: [{ lang: '🇺🇸 EN', text: 'Acknowledged / Agreed / Fr' }, { lang: '🇯🇵 JA', text: '認める / そうだね' }, { lang: '🇨🇳 ZH', text: '认可/承认' }],
  },
  {
    id: '23', word: 'ㄹㅇ', category: 'frequently-used',
    pronunciation: '[리-얼]', shortDesc: '진짜, 정말 — 강한 동의나 강조',
    meanings: [{ type: '부사/감탄사', definition: "'리얼(real)'의 초성 줄임말. '진짜로', '정말로'를 강조하는 표현.", examples: [{ kor: 'ㄹㅇ 맞아, 완전 공감이야.', eng: "For real, I totally relate." }, { kor: '그거 ㄹㅇ 힘들겠다.', eng: "That must genuinely be tough." }] }],
    origin: "'리얼(real)'의 초성만 추출",
    usage: '채팅에서 가장 빈번하게 쓰이는 줄임말 중 하나.',
    relatedWords: ['ㅇㅈ', '레알', '진짜'], likes: 634, saves: 256,
    translations: [{ lang: '🇺🇸 EN', text: 'For real / Fr' }, { lang: '🇯🇵 JA', text: 'リアル / マジで' }, { lang: '🇨🇳 ZH', text: '真的/确实' }],
  },

  // ── 초성 모음집 ──
  {
    id: '24', word: 'ㅋㅋ', category: 'consonant',
    pronunciation: '[크-크]', shortDesc: '웃음을 표현하는 초성 표현',
    meanings: [{ type: '감탄사', definition: "'크크'의 초성 표기. 가볍게 웃거나 재밌을 때 사용. 개수가 많을수록 더 크게 웃는 것을 의미.", examples: [{ kor: '그거 진짜 웃기다 ㅋㅋ', eng: "That's actually funny lol" }, { kor: 'ㅋㅋㅋㅋ 완전 터졌어.', eng: "LOL I'm dying 😂" }] }],
    origin: '인터넷 채팅 초기부터 사용된 원조 초성 표현',
    usage: '한국어 디지털 소통에서 가장 오래된 필수 이모티콘 대체 표현.',
    relatedWords: ['ㅎㅎ', 'ㅠㅠ', 'ㅇㅈ'], likes: 891, saves: 345,
    translations: [{ lang: '🇺🇸 EN', text: 'lol / haha / 😂' }, { lang: '🇯🇵 JA', text: 'w / www' }, { lang: '🇨🇳 ZH', text: '哈哈 / 23333' }],
  },
  {
    id: '25', word: 'ㅠㅠ', category: 'consonant',
    pronunciation: '[유-유]', shortDesc: '슬픔이나 아쉬움을 표현하는 초성 이모티콘',
    meanings: [{ type: '감탄사', definition: "눈물 흘리는 모양을 초성으로 표현. 슬픔, 아쉬움, 실망을 나타냄.", examples: [{ kor: '비가 와서 소풍 취소됐어 ㅠㅠ', eng: "The picnic got cancelled because of rain T_T" }, { kor: '오늘 너무 힘들었어 ㅠㅠ', eng: "Today was so hard T_T" }] }],
    origin: '눈물 방울 모양(ㅠ)이 두 개 → 두 눈에서 눈물',
    usage: '슬픔, 동정, 아쉬움을 캐주얼하게 표현할 때.',
    relatedWords: ['ㅋㅋ', 'ㅎㅎ', '흑흑'], likes: 723, saves: 289,
    translations: [{ lang: '🇺🇸 EN', text: 'T_T / crying emoji / TT' }, { lang: '🇯🇵 JA', text: 'T_T / ;_;' }, { lang: '🇨🇳 ZH', text: 'T_T / 哭' }],
  },

  // ── 무한도전 ──
  {
    id: '26', word: '무야호', category: 'muhandoejeon',
    pronunciation: '[무-야-호]', shortDesc: '기쁘거나 신날 때 쓰는 감탄사',
    meanings: [{ type: '감탄사', definition: "무한도전의 한 장면에서 비롯된 밈 표현. 기쁜 일이 생겼을 때 크게 외치는 감탄사.", examples: [{ kor: '오늘 조기퇴근한다 무야호!', eng: "Early leave today — WOOHOO!" }, { kor: '합격했어!! 무야호~~', eng: "I passed!! YAHOOO~~" }] }],
    origin: "무한도전 등산 특집에서 박명수가 외친 '야호'에서 유래, '무야호' 밈으로 확산",
    usage: '기쁘거나 신나는 일이 생겼을 때 쓰는 밈 감탄사. 2020년 이후 MZ세대 필수 밈.',
    relatedWords: ['무한도전', '야호', '밈'], likes: 567, saves: 198,
    translations: [{ lang: '🇺🇸 EN', text: 'WOOHOO / YAHOO (meme exclamation)' }, { lang: '🇯🇵 JA', text: 'やっほ～！（ミーム）' }, { lang: '🇨🇳 ZH', text: '耶！/ 太棒了！（梗）' }],
  },

  // ── 한물 간 신조어 ──
  {
    id: '27', word: '좋좋소', category: 'outdated-slang',
    pronunciation: '[좋-좋-쏘]', shortDesc: '좋은 것이 아닌데 좋다고 말해야 하는 상황 풍자',
    meanings: [{ type: '명사/표현', definition: "'좋은 게 좋은 소리야'의 줄임. 억지로 긍정적인 척해야 하는 상황을 자조적으로 표현.", examples: [{ kor: '연봉 협상 당연히 좋좋소하고 끝냈지.', eng: "Just gave the 'sounds great' nod at the salary negotiation and called it done." }] }],
    origin: "'좋은 게 좋은 소리'의 약어, 2021년 즈음 직장인 커뮤니티에서 유행",
    usage: '현재는 사용 빈도가 많이 줄었으나 여전히 중장년층 직장인 사이에서 간간이 쓰임.',
    relatedWords: ['넵병', '직장인', '월급 루팡'], likes: 189, saves: 54,
    translations: [{ lang: '🇺🇸 EN', text: '"Sounds good (reluctantly)" / Forced positivity' }, { lang: '🇯🇵 JA', text: '「いいですね」（建前）' }, { lang: '🇨🇳 ZH', text: '好的好的（口是心非）' }],
  },
];
