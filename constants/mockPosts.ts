/** 속닥 커뮤니티 Mock 데이터 */

export type PostBoard = '궁금해요' | 'Q&A' | '질문하기';

export type Comment = {
  id: string;
  author: { name: string; emoji: string; level: string };
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
};

export type Post = {
  id: string;
  board: PostBoard;
  title: string;
  content: string;
  author: { name: string; emoji: string; level: string };
  createdAt: string;
  views: number;
  likes: number;
  comments: Comment[];
  isFeatured?: boolean;
};

/** Figma: Display/게시판 종류 배지 — bg(채움)+fg(글자) 페어 (Point 컬러 조합) */
export const BOARD_COLORS: Record<PostBoard, { bg: string; fg: string }> = {
  '궁금해요': { bg: '#A4484D', fg: '#F6F2EA' },
  'Q&A':     { bg: '#E2B55D', fg: '#A4484D' },
  '질문하기': { bg: '#BBCA9F', fg: '#526192' },
};

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    board: '궁금해요',
    title: "'갓벽'이 무슨 뜻인가요?",
    content: "안녕하세요! 한국어를 공부한 지 2년 됐는데, 친구가 갑자기 '갓벽'이라고 하더라고요. 처음 들었을 때는 '갓'이 God인지 '갓'(모자)인지도 헷갈렸어요 😅 사전에도 없던데, 정확한 뜻과 어떤 상황에 쓰면 되는지 알려주세요!",
    author: { name: 'Maria_KR', emoji: '🇧🇷', level: '초급' },
    createdAt: '2025-06-28',
    views: 120, likes: 36,
    isFeatured: true,
    comments: [
      {
        id: 'c1', author: { name: '김속닥', emoji: '🇰🇷', level: '고급' },
        content: "'갓벽'은 'God'(갓)과 '완벽'의 합성어예요! 신의 경지로 완벽하다는 뜻이에요. 예를 들어 콘서트 무대가 너무 완벽하면 '오늘 무대 갓벽이다!' 이렇게 쓸 수 있어요 😊",
        likes: 24, createdAt: '2025-06-28',
        replies: [
          { id: 'r1', author: { name: 'Maria_KR', emoji: '🇧🇷', level: '초급' }, content: "오 이제 이해됐어요! 감사합니다 ㅋㅋ", likes: 5, createdAt: '2025-06-28' },
          { id: 'r2', author: { name: '서울토박이', emoji: '🇰🇷', level: '원어민' }, content: "맞아요! K-POP 팬들이 공연 후기에 많이 써요. '레전드'랑 비슷한 뉘앙스예요.", likes: 8, createdAt: '2025-06-29' },
        ],
      },
      {
        id: 'c2', author: { name: 'Tanaka_JP', emoji: '🇯🇵', level: '중급' },
        content: "일본어의 '神(かみ)'과 비슷하네요! 일본에서도 '神対応(かみたいおう)'처럼 씁니다. 한일 양국 언어가 비슷하게 발전하는 게 신기해요.",
        likes: 18, createdAt: '2025-06-29',
      },
    ],
  },
  {
    id: '2',
    board: 'Q&A',
    title: "'넵병' 회사에서 실제로 많이 쓰나요?",
    content: "속닥 사전에서 '넵병'이라는 단어를 봤는데요, 실제로 한국 직장에서 이 표현을 쓰나요? 아니면 인터넷 밈에 가까운 건가요? 저도 한국 회사에서 일하고 싶어서 직장 문화가 궁금해요.",
    author: { name: 'Wei_Shanghai', emoji: '🇨🇳', level: '고급' },
    createdAt: '2025-06-27',
    views: 98, likes: 24,
    isFeatured: true,
    comments: [
      {
        id: 'c3', author: { name: '직장인A', emoji: '🇰🇷', level: '원어민' },
        content: "저는 실제 직장인인데 '넵병'이라는 단어 자체를 쓰진 않지만, 현상은 진짜예요 ㅋㅋㅋ 카톡으로 상사한테 넵! 넵! 넵! 하는 거 다들 해요. 신조어로 표현한 거라 밈 느낌도 있지만 현실 반영이에요.",
        likes: 31, createdAt: '2025-06-27',
        replies: [
          { id: 'r3', author: { name: 'Wei_Shanghai', emoji: '🇨🇳', level: '고급' }, content: "헐 진짜요? ㅋㅋ 중국도 비슷한 문화가 있어요. '好的好的(하오더하오더)'라고...", likes: 7, createdAt: '2025-06-27' },
        ],
      },
      {
        id: 'c4', author: { name: '대리2년차', emoji: '🇰🇷', level: '원어민' },
        content: "넵병은 진짜 공감돼요 ㅠㅠ 뇌가 '넵'을 먼저 치고 내용을 읽는 경지...",
        likes: 42, createdAt: '2025-06-28',
      },
    ],
  },
  {
    id: '3',
    board: '질문하기',
    title: "K-POP 팬클럽 용어 한꺼번에 정리해주세요!",
    content: "K-POP을 좋아하는데 팬덤 커뮤니티에 들어가면 말을 못 알아먹겠어요 😂 직관, 최애, 입덕, 탈덕, 억까, 레전드... 이거 말고도 더 있는 것 같은데 아시는 분 총정리 부탁드려요! 속닥 사전에 없는 것도 있으면 제안 기능 써볼게요.",
    author: { name: 'Sophie_FR', emoji: '🇫🇷', level: '중급' },
    createdAt: '2025-06-26',
    views: 304, likes: 87,
    isFeatured: true,
    comments: [
      {
        id: 'c5', author: { name: 'KPOP덕후', emoji: '🇰🇷', level: '원어민' },
        content: "제가 정리해드릴게요!\n• 최애 = 제일 좋아하는 멤버\n• 직관 = 콘서트 직접 관람\n• 입덕 = 팬이 됨\n• 탈덕 = 팬 그만둠\n• 억까 = 억지로 비난\n• 레전드 = 전설적으로 훌륭함\n• 굿즈 = 공식 상품\n• 티켓팅 = 콘서트 티켓 구매 전쟁 😂",
        likes: 56, createdAt: '2025-06-26',
        replies: [
          { id: 'r4', author: { name: 'Sophie_FR', emoji: '🇫🇷', level: '중급' }, content: "와 진짜 감사해요!! 저장했어요 ㅎㅎ", likes: 12, createdAt: '2025-06-26' },
        ],
      },
    ],
  },
  {
    id: '4',
    board: '궁금해요',
    title: "'킹받다'와 '열받다' 차이가 뭔가요?",
    content: "둘 다 화가 난다는 뜻인 것 같은데, 실제로 쓸 때 어떤 차이가 있나요? 나이대나 상황에 따라 다른지도 궁금해요.",
    author: { name: 'Akira_Tokyo', emoji: '🇯🇵', level: '고급' },
    createdAt: '2025-06-25',
    views: 67, likes: 19,
    comments: [
      {
        id: 'c6', author: { name: '국어선생', emoji: '🇰🇷', level: '원어민' },
        content: "'열받다'는 일반적인 표현이고, '킹받다'는 '킹'(강조 접두사)이 붙어서 훨씬 더 강하게 화나는 느낌이에요. 세대 차이는 딱히 없고 MZ세대가 더 자주 쓰는 편이에요.",
        likes: 15, createdAt: '2025-06-25',
      },
    ],
  },
  {
    id: '5',
    board: 'Q&A',
    title: "'갑분싸' 영어로 어떻게 설명하면 좋을까요?",
    content: "외국인 친구한테 갑분싸를 설명하려고 하는데 딱 맞는 영어 표현이 없는 것 같아요. 어떻게 설명하면 자연스러울까요?",
    author: { name: '한국어공부중', emoji: '🇩🇪', level: '중급' },
    createdAt: '2025-06-24',
    views: 54, likes: 18,
    comments: [
      {
        id: 'c7', author: { name: 'Alex_Seoul', emoji: '🇺🇸', level: '고급' },
        content: "\"killing the vibe\" 또는 \"awkward silence\" 가 가장 가깝지 않을까요? 영어권에서는 \"vibe check failed\" 라는 표현도 써요.",
        likes: 22, createdAt: '2025-06-24',
        replies: [
          { id: 'r5', author: { name: '한국어공부중', emoji: '🇩🇪', level: '중급' }, content: "오 'killing the vibe'가 딱이네요! 감사합니다.", likes: 4, createdAt: '2025-06-24' },
        ],
      },
    ],
  },
  {
    id: '6',
    board: '질문하기',
    title: "속닥에 '무야호' 카테고리 더 추가해줄 수 있나요?",
    content: "무한도전 밈 단어들이 생각보다 많은데, 지금 카테고리에 몇 개 없는 것 같아요. 무야호 말고도 유행어가 더 있으면 좋겠어요!",
    author: { name: '밈연구자', emoji: '🇰🇷', level: '중급' },
    createdAt: '2025-06-23',
    views: 43, likes: 11,
    comments: [
      {
        id: 'c8', author: { name: '속닥팀', emoji: '✨', level: '관리자' },
        content: "좋은 의견 감사합니다! 무한도전 카테고리 콘텐츠 보강을 검토해볼게요 😊 제안하기 기능으로 구체적인 단어도 제안해 주시면 더욱 도움이 돼요.",
        likes: 8, createdAt: '2025-06-23',
      },
    ],
  },
  {
    id: '7',
    board: '궁금해요',
    title: "'TMI'를 한국에서는 어떻게 사용하나요?",
    content: "영어권에서는 주로 '과도한 개인 정보'라는 의미로 쓰는데, 한국에서도 같은 맥락인가요? 아니면 다른 뉘앙스가 있나요?",
    author: { name: 'Emma_AU', emoji: '🇦🇺', level: '중급' },
    createdAt: '2025-06-22',
    views: 89, likes: 27,
    comments: [
      {
        id: 'c9', author: { name: '일상언어학자', emoji: '🇰🇷', level: '원어민' },
        content: "한국에서도 기본 의미는 같아요. '그건 좀 TMI 아니야?' 이렇게 쓰죠. 근데 한국에선 자기 자신에게도 써요. 'TMI인데 나 어제 밤새 울었어' 처럼 스스로 과잉 공유임을 인정하면서 쓰는 게 특이한 점이에요 ㅋㅋ",
        likes: 33, createdAt: '2025-06-22',
      },
    ],
  },
  {
    id: '8',
    board: 'Q&A',
    title: "'ㄹㅇ'이랑 'ㅇㅈ' 차이 알려주세요",
    content: "채팅하다 보면 둘 다 '맞아'라는 의미로 쓰이는 것 같은데 미묘한 차이가 있나요?",
    author: { name: 'Carlos_MX', emoji: '🇲🇽', level: '초급' },
    createdAt: '2025-06-21',
    views: 156, likes: 44,
    isFeatured: true,
    comments: [
      {
        id: 'c10', author: { name: '초성마스터', emoji: '🇰🇷', level: '원어민' },
        content: "'ㄹㅇ'(리얼)은 '진짜로, 사실로' 강조할 때 쓰고, 'ㅇㅈ'(인정)은 상대 말이 맞다고 동의할 때 써요. 'ㄹㅇ 힘들었어'(진짜 힘들었어) vs 'ㅇㅈ 그거 힘들지'(인정, 그거 힘들지) 이런 차이예요!",
        likes: 51, createdAt: '2025-06-21',
      },
    ],
  },
];
