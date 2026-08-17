import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'sokdak.language';
export type Language = 'ko' | 'en' | 'ja' | 'vi' | 'es';
const SUPPORTED_LANGUAGES: Language[] = ['ko', 'en', 'ja', 'vi', 'es'];

type TranslationKey =
  | 'home'
  | 'category'
  | 'dictionary'
  | 'community'
  | 'mypage'
  | 'settings'
  | 'notifications'
  | 'languageSettings'
  | 'activity'
  | 'savedWords'
  | 'likedPosts'
  | 'myActivity'
  | 'myPostsTab'
  | 'myCommentedTab'
  | 'myLikedTab'
  | 'mySavedTab'
  | 'noWrittenPostsYet'
  | 'noCommentedPostsYet'
  | 'noLikedPostsYet'
  | 'noSavedPostsYet'
  | 'browseCommunity'
  | 'suggestTitle'
  | 'suggestIntro'
  | 'suggestWordLabel'
  | 'suggestWordPlaceholder'
  | 'suggestCategoryLabel'
  | 'suggestDefinitionLabel'
  | 'suggestDefinitionPlaceholder'
  | 'suggestExampleLabel'
  | 'suggestExamplePlaceholder'
  | 'suggestSubmitBtn'
  | 'suggestSubmitting'
  | 'suggestFailedTitle'
  | 'loginRequiredSuggest'
  | 'suggestDoneTitle'
  | 'suggestDoneDescPrefix'
  | 'suggestDoneDescSuffix'
  | 'suggestAnother'
  | 'suggestBackToMypage'
  | 'suggestNewSlang'
  | 'loginNeeded'
  | 'tapToLogin'
  | 'startWithSokdak'
  | 'loginPrompt'
  | 'termsOfService'
  | 'privacyPolicy'
  | 'logout'
  | 'login'
  | 'customerService'
  | 'faqSearchPlaceholder'
  | 'contactDirectly'
  | 'contactMailUnavailableTitle'
  | 'contactMailUnavailableBody'
  | 'myInquiriesTitle'
  | 'inquiryPlaceholder'
  | 'inquirySubmitBtn'
  | 'inquiryTypeLabel'
  | 'inquiryTypePlaceholder'
  | 'inquiryContentLabel'
  | 'inquirySubmittedTitle'
  | 'inquirySubmittedSub'
  | 'inquiryReceiptTypeLabel'
  | 'inquiryReceiptNumberLabel'
  | 'inquiryReceiptEtaLabel'
  | 'inquiryEtaValue'
  | 'inquiryEmptyText'
  | 'inquiryStatusOpen'
  | 'inquiryStatusAnswered'
  | 'inquiryReplyLabel'
  | 'saveWordCount'
  | 'likesCount'
  | 'loginBannerSubtitle'
  // 홈
  | 'newSlangSection'
  | 'newSlangSub'
  | 'moreLink'
  | 'communitySub'
  // 카테고리 그리드
  | 'totalPrefix'
  | 'categoriesSuffix'
  | 'wordsSuffix'
  | 'sortPopular'
  | 'sortAlphabetical'
  // 사전 / 필터바
  | 'sortRecent'
  | 'sortConsonant'
  | 'categoryFilterLabel'
  | 'allLabel'
  | 'noSearchResults'
  | 'wordSearchPlaceholder'
  | 'clearWordSearch'
  | 'translationSearchMatch'
  | 'voiceSearchLabel'
  | 'voiceSearchStopLabel'
  | 'voiceSearchListening'
  | 'voiceSearchPermissionMessage'
  | 'voiceSearchNoMatchMessage'
  | 'voiceSearchUnavailableMessage'
  | 'voiceSearchPermissionTitle'
  | 'voiceSearchPermissionRationale'
  | 'voiceSearchPermissionSettingsMessage'
  | 'voiceSearchOpenSettingsLabel'
  | 'voiceSearchRetryPermissionLabel'
  | 'voiceSearchSettingsOpenError'
  | 'modalHint'
  | 'resetLabel'
  | 'applyLabel'
  // 단어 상세
  | 'wordNotFound'
  | 'categoryNotFound'
  | 'goBack'
  | 'meaning'
  | 'culturalContext'
  | 'conversationExample'
  | 'additionalInfo'
  | 'relatedWords'
  | 'askInCommunity'
  | 'askInCommunityQuestion'
  // 커뮤니티
  | 'hotPosts'
  | 'noPostsYet'
  | 'boardCurious'
  | 'boardAskQuestion'
  | 'postNotFound'
  | 'loginRequiredTitle'
  | 'loginRequiredLike'
  | 'loginRequiredComment'
  | 'loginRequiredSave'
  | 'loginRequiredCategoryLike'
  | 'loginRequiredTts'
  | 'categoryLikeLimitReachedTitle'
  | 'categoryLikeLimitReachedMessage'
  | 'ttsLimitReachedTitle'
  | 'ttsLimitReachedMessage'
  | 'a11ySaveWord'
  | 'a11yPlayPronunciation'
  | 'a11yLikeCategory'
  | 'cancelLabel'
  | 'goToLogin'
  | 'commentFailedTitle'
  | 'savedLabel'
  | 'saveLabel'
  | 'shareLabel'
  | 'viewsLabel'
  | 'commentsLabel'
  | 'replyingLabel'
  | 'commentPlaceholder'
  | 'sendLabel'
  | 'sendingLabel'
  | 'replyLabel'
  // 글쓰기
  | 'writeTitle'
  | 'submitting'
  | 'submitComplete'
  | 'validationTitle'
  | 'validationMessage'
  | 'submitFailedTitle'
  | 'unknownError'
  | 'cancelWriteTitle'
  | 'cancelWriteMessage'
  | 'keepWriting'
  | 'boardSelectLabel'
  | 'boardDescCurious'
  | 'boardDescQA'
  | 'boardDescAsk'
  | 'titlePlaceholder'
  | 'contentPlaceholder'
  | 'toolbarPhoto'
  | 'toolbarLink'
  | 'toolbarFormat'
  | 'featureComingSoon'
  | 'linkModalTitle'
  | 'linkUrlPlaceholder'
  | 'linkLabelPlaceholder'
  | 'linkInsert'
  | 'linkUrlRequiredMessage'
  | 'boldLabel'
  | 'italicLabel'
  | 'uploadingPhoto'
  | 'uploadFailedTitle'
  | 'titleNeeded'
  | 'contentNeeded'
  | 'readyToPost'
  // 카테고리 검색
  | 'categorySearchTitle'
  | 'noCategoryResultsPrefix'
  | 'noCategoryResultsSuffix'
  | 'suggestToTeam'
  | 'recentSearches'
  | 'clearAll'
  | 'noRecentSearches'
  | 'trySearchingCategory'
  | 'recommendedCategories'
  // 즐겨찾기
  | 'favoritesTitle'
  | 'favoritesLabel'
  | 'collapseLabel'
  | 'noFavoritesYet'
  | 'browseDictionary'
  | 'sortOldest'
  | 'sortNewest'
  // 알림 설정
  | 'notificationSettings'
  | 'allNotifications'
  | 'allNotificationsDesc'
  | 'contentSectionLabel'
  | 'communitySectionLabel'
  // 내 정보 관리
  | 'myInfoTitle'
  | 'loginRequiredGeneric'
  | 'nicknameLabel'
  | 'nicknamePlaceholder'
  | 'accountInfoSection'
  | 'emailLabel'
  | 'emailPlaceholder'
  | 'passwordLabel'
  | 'passwordChangePlaceholder'
  | 'timezoneLabel'
  | 'timezonePlaceholder'
  | 'profileIconHint'
  | 'changePhoto'
  | 'addPhoto'
  | 'removePhoto'
  | 'avatarHintSmall'
  | 'countrySearchPlaceholder'
  | 'withdrawAccount'
  | 'withdrawConfirmTitle'
  | 'withdrawConfirmMessage'
  | 'withdrawConfirmBtn'
  | 'withdrawFailedTitle'
  | 'saveBtnLabel'
  | 'savingLabel'
  | 'inputCheckTitle'
  | 'nicknameRequiredMessage'
  | 'saveFailedTitle'
  | 'saveCompleteTitle'
  | 'saveCompleteMessage'
  | 'confirmLabel'
  | 'permissionNeededTitle'
  | 'galleryPermissionMessage'
  // 커뮤니티 게시글/댓글 케밥 메뉴 · 신고 · 차단
  | 'editLabel'
  | 'deleteLabel'
  | 'reportLabel'
  | 'blockLabel'
  | 'deletePostTitle'
  | 'deleteCommentTitle'
  | 'deleteConfirmMessage'
  | 'deleteFailedTitle'
  | 'blockUserTitle'
  | 'blockConfirmMessagePrefix'
  | 'blockConfirmMessageSuffix'
  | 'blockFailedTitle'
  | 'editFailedTitle'
  | 'reportReasonRequiredTitle'
  | 'reportReasonRequiredMessage'
  | 'reportFailedTitle'
  | 'reportReceivedTitle'
  | 'reportReceivedMessage'
  | 'reportPostTitle'
  | 'reportCommentTitle'
  | 'reportSheetSub'
  | 'reportReasonPlaceholder'
  | 'reportSubmitBtn'
  | 'reportSubmittingLabel'
  | 'processingLabel'
  // 프리미엄
  | 'premiumTitle'
  | 'premiumUpgradeCta'
  | 'premiumActiveLabel'
  | 'premiumBannerTitle'
  | 'premiumBannerSub'
  | 'premiumFeatureUnlimitedSaves'
  | 'premiumFeatureOffline'
  | 'premiumFeatureSituational'
  | 'premiumFeatureQuiz'
  | 'premiumFeaturePersonalized'
  | 'premiumFeatureExclusiveContent'
  | 'premiumActivateTestBtn'
  | 'premiumDeactivateTestBtn'
  | 'premiumActivatedAlert'
  | 'premiumComingSoonNote'
  | 'saveLimitReachedTitle'
  | 'saveLimitReachedMessage'
  | 'dictionaryPremiumBannerText'
  // 오늘의 실전 표현 / streak
  | 'todayExpressionTitle'
  | 'todayExpressionSub'
  | 'situationCafe'
  | 'situationSubway'
  | 'situationWork'
  | 'situationHospital'
  | 'situationSns'
  | 'situationDinner'
  | 'streakLabel'
  | 'streakDaysSuffix';

const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  ko: {
    home: '홈',
    category: '카테고리',
    dictionary: '사전',
    community: '커뮤니티',
    mypage: '마이페이지',
    settings: '설정',
    notifications: '알림설정',
    languageSettings: '언어 설정',
    activity: '활동',
    savedWords: '저장한 단어',
    likedPosts: '좋아요 한 글',
    myActivity: '내 활동',
    myPostsTab: '게시물',
    myCommentedTab: '댓글',
    myLikedTab: '좋아요',
    mySavedTab: '저장',
    noWrittenPostsYet: '아직 작성한 글이 없어요',
    noCommentedPostsYet: '아직 댓글을 단 글이 없어요',
    noLikedPostsYet: '아직 좋아요 한 글이 없어요',
    noSavedPostsYet: '아직 저장한 글이 없어요',
    browseCommunity: '커뮤니티 둘러보기',
    suggestTitle: '신조어 제안하기',
    suggestIntro: '아직 속닥 사전에 없는 신조어를 알고 계신가요?\n제안해주시면 검토 후 추가할게요!',
    suggestWordLabel: '제안할 단어',
    suggestWordPlaceholder: '예: 갓벽',
    suggestCategoryLabel: '카테고리',
    suggestDefinitionLabel: '뜻/설명 (5자 이상)',
    suggestDefinitionPlaceholder: '이 단어가 무슨 뜻인지 설명해주세요',
    suggestExampleLabel: '예문 (선택)',
    suggestExamplePlaceholder: '이 단어를 사용한 예문이 있다면 적어주세요',
    suggestSubmitBtn: '제안하기',
    suggestSubmitting: '제출 중…',
    suggestFailedTitle: '제안 실패',
    loginRequiredSuggest: '신조어를 제안하려면 먼저 로그인해주세요.',
    suggestDoneTitle: '제안 감사해요!',
    suggestDoneDescPrefix: "'",
    suggestDoneDescSuffix: "' 제안을 잘 받았어요.\n검토 후 사전에 반영될 수 있어요.",
    suggestAnother: '다른 단어 제안하기',
    suggestBackToMypage: '마이페이지로 돌아가기',
    suggestNewSlang: '신조어 제안하기',
    loginNeeded: '로그인이 필요해요',
    tapToLogin: '탭하여 로그인 →',
    startWithSokdak: '속닥과 함께 시작해요!',
    loginPrompt: '로그인하면 단어 저장·커뮤니티 이용 가능',
    termsOfService: '이용약관',
    privacyPolicy: '개인정보처리방침',
    logout: '로그아웃',
    login: '로그인하기',
    customerService: '고객센터',
    faqSearchPlaceholder: '질문 검색',
    contactDirectly: '직접 문의하기',
    contactMailUnavailableTitle: '메일 앱을 열 수 없어요',
    contactMailUnavailableBody: 'support@sokdak.app 으로 직접 문의해주세요.',
    myInquiriesTitle: '내 문의 내역',
    inquiryPlaceholder: '문의 내용을 입력하세요',
    inquirySubmitBtn: '제출하기',
    inquiryTypeLabel: '문의 유형',
    inquiryTypePlaceholder: '유형을 선택하세요',
    inquiryContentLabel: '문의 내용',
    inquirySubmittedTitle: '문의가 접수됐어요!',
    inquirySubmittedSub: '영업일 기준 1~2일 내에 이메일로 답변 드릴게요.',
    inquiryReceiptTypeLabel: '유형',
    inquiryReceiptNumberLabel: '접수번호',
    inquiryReceiptEtaLabel: '예상 답변',
    inquiryEtaValue: '영업일 1~2일',
    inquiryEmptyText: '아직 보낸 문의가 없어요',
    inquiryStatusOpen: '답변 대기',
    inquiryStatusAnswered: '답변 완료',
    inquiryReplyLabel: '운영진 답변',
    saveWordCount: '저장한 단어',
    likesCount: '좋아요',
    loginBannerSubtitle: '로그인하면 단어 저장·커뮤니티 이용 가능',

    newSlangSection: '새로운 신조어',
    newSlangSub: '새롭게 등장한 신조어를 확인해보세요',
    moreLink: '더보기',
    communitySub: '새로운 게시글을 확인하세요',

    totalPrefix: '총',
    categoriesSuffix: '카테고리',
    wordsSuffix: '단어',
    sortPopular: '인기순',
    sortAlphabetical: '가나다순',

    sortRecent: '최신순',
    sortConsonant: 'ㄱㄴㄷ순',
    categoryFilterLabel: '카테고리',
    allLabel: '전체',
    noSearchResults: '검색 결과가 없어요',
    wordSearchPlaceholder: '단어·의미·로마자 검색',
    clearWordSearch: '검색어 지우기',
    translationSearchMatch: '번역 의미 일치:',
    voiceSearchLabel: '음성 검색',
    voiceSearchStopLabel: '음성 검색 중지',
    voiceSearchListening: '듣고 있어요. 한국어 단어를 말해 보세요.',
    voiceSearchPermissionMessage: '마이크 권한을 허용한 뒤 음성 검색을 사용해 주세요.',
    voiceSearchNoMatchMessage: '말한 내용을 인식하지 못했어요. 다시 말해 보세요.',
    voiceSearchUnavailableMessage: '음성 인식 서비스를 사용할 수 없어요. 기기 설정과 인터넷 연결을 확인해 주세요.',
    voiceSearchPermissionTitle: '마이크 권한이 필요해요',
    voiceSearchPermissionRationale: '마이크를 허용하면 말로 한국어 단어를 검색할 수 있어요.',
    voiceSearchPermissionSettingsMessage: '마이크 권한이 꺼져 있어요. Android 설정에서 마이크를 허용한 뒤 다시 시도해 주세요.',
    voiceSearchOpenSettingsLabel: '설정으로 이동',
    voiceSearchRetryPermissionLabel: '권한 다시 요청',
    voiceSearchSettingsOpenError: '설정을 열 수 없어요. 기기 설정에서 SokDak의 마이크 권한을 직접 허용해 주세요.',
    modalHint: '선택한 카테고리에 해당하는 단어만 보여드려요',
    resetLabel: '초기화',
    applyLabel: '적용하기',

    wordNotFound: '단어를 찾을 수 없어요',
    categoryNotFound: '카테고리를 찾을 수 없어요',
    goBack: '돌아가기',
    meaning: '의미',
    culturalContext: '문화적 배경',
    conversationExample: '대화 예시',
    additionalInfo: '추가 정보',
    relatedWords: '관련 단어',
    askInCommunity: '이 단어로 커뮤니티에 물어보기',
    askInCommunityQuestion: '에 대해 더 궁금한 점이 있으신가요?',

    hotPosts: '화제의 게시글',
    noPostsYet: '아직 게시글이 없어요',
    boardCurious: '궁금해요',
    boardAskQuestion: '질문하기',
    postNotFound: '게시글을 찾을 수 없어요',
    loginRequiredTitle: '로그인이 필요해요',
    loginRequiredLike: '좋아요를 누르려면 먼저 로그인해주세요.',
    loginRequiredComment: '댓글을 작성하려면 먼저 로그인해주세요.',
    loginRequiredSave: '단어를 저장하려면 먼저 로그인해주세요.',
    loginRequiredCategoryLike: '카테고리를 즐겨찾기하려면 먼저 로그인해주세요.',
    loginRequiredTts: '발음 듣기는 로그인 후 이용할 수 있어요.',
    categoryLikeLimitReachedTitle: '즐겨찾기 한도에 도달했어요',
    categoryLikeLimitReachedMessage: '무료 회원은 카테고리를 최대 2개까지 즐겨찾기할 수 있어요. 프리미엄으로 업그레이드하면 무제한으로 즐겨찾기할 수 있어요.',
    ttsLimitReachedTitle: '오늘 발음 듣기를 다 썼어요',
    ttsLimitReachedMessage: '무료 회원은 하루 3개까지 발음을 들을 수 있어요. 프리미엄으로 업그레이드하면 무제한으로 들을 수 있어요.',
    a11ySaveWord: '단어 저장',
    a11yPlayPronunciation: '발음 듣기',
    a11yLikeCategory: '카테고리 즐겨찾기',
    cancelLabel: '취소',
    goToLogin: '로그인하러 가기',
    commentFailedTitle: '댓글 등록 실패',
    savedLabel: '저장됨',
    saveLabel: '저장',
    shareLabel: '공유',
    viewsLabel: '조회',
    commentsLabel: '댓글',
    replyingLabel: '답글 작성 중',
    commentPlaceholder: '댓글을 입력하세요',
    sendLabel: '전송',
    sendingLabel: '전송 중…',
    replyLabel: '답글',

    writeTitle: '글쓰기',
    submitting: '등록 중…',
    submitComplete: '작성 완료',
    validationTitle: '작성 조건 확인',
    validationMessage: '제목은 2자 이상, 내용은 10자 이상 입력해주세요.',
    submitFailedTitle: '등록 실패',
    unknownError: '알 수 없는 오류가 발생했어요.',
    cancelWriteTitle: '작성 취소',
    cancelWriteMessage: '작성 중인 내용이 사라집니다. 취소할까요?',
    keepWriting: '계속 작성',
    boardSelectLabel: '게시판 선택',
    boardDescCurious: '한국어 신조어가 궁금할 때',
    boardDescQA: '질문과 답변을 주고받을 때',
    boardDescAsk: '자유롭게 의견을 나눌 때',
    titlePlaceholder: '제목을 입력하세요 (2자 이상)',
    contentPlaceholder: '내용을 입력해주세요 (10자 이상)\n\n예) "안녕하세요, 속닥속닥 배우는 교과서에는 없던 진짜 국어!"',
    toolbarPhoto: '사진',
    toolbarLink: '링크',
    toolbarFormat: '서식',
    featureComingSoon: '기능은 준비 중이에요.',
    linkModalTitle: '링크 추가',
    linkUrlPlaceholder: 'https://example.com',
    linkLabelPlaceholder: '링크 이름 (선택)',
    linkInsert: '추가',
    linkUrlRequiredMessage: '링크 주소를 입력해주세요.',
    boldLabel: '굵게',
    italicLabel: '기울임',
    uploadingPhoto: '사진 업로드 중…',
    uploadFailedTitle: '업로드 실패',
    titleNeeded: '제목 필요',
    contentNeeded: '내용 필요',
    readyToPost: '작성 완료 ✓',

    categorySearchTitle: '카테고리 검색',
    noCategoryResultsPrefix: '에 대한 검색 결과가 없습니다.',
    noCategoryResultsSuffix: '단어를 다시 한번 확인해 주세요.',
    suggestToTeam: '운영진에게 제안하기 ›',
    recentSearches: '최근 검색',
    clearAll: '모두 지우기',
    noRecentSearches: '최근 검색어 내역이 없습니다.',
    trySearchingCategory: '궁금한 카테고리를 검색해 보세요',
    recommendedCategories: '추천 카테고리',

    favoritesTitle: '즐겨찾기',
    favoritesLabel: '즐겨찾기',
    collapseLabel: '접기',
    noFavoritesYet: '아직 즐겨찾기한 단어나 카테고리가 없어요',
    browseDictionary: '사전 둘러보기',
    sortOldest: '등록순',
    sortNewest: '최신순',

    notificationSettings: '알림 설정',
    allNotifications: '전체 알림',
    allNotificationsDesc: '모든 알림을 한 번에 끄거나 켭니다',
    contentSectionLabel: '컨텐츠',
    communitySectionLabel: '커뮤니티',

    myInfoTitle: '내 정보 관리',
    loginRequiredGeneric: '로그인이 필요해요',
    nicknameLabel: '닉네임',
    nicknamePlaceholder: '닉네임을 입력하세요',
    accountInfoSection: '계정 정보',
    emailLabel: '이메일 Email',
    emailPlaceholder: '이메일을 입력하세요',
    passwordLabel: '비밀번호 Password',
    passwordChangePlaceholder: '변경할 때만 입력하세요',
    timezoneLabel: '시간대 Time Zone',
    timezonePlaceholder: '예: Asia/Seoul',
    profileIconHint: '프로필 아이콘 선택',
    changePhoto: '사진 바꾸기',
    addPhoto: '사진 추가',
    removePhoto: '사진 제거',
    avatarHintSmall: '국기 이모지 또는 프로필 사진을 선택할 수 있어요.',
    countrySearchPlaceholder: '국가 검색 (한국어/영어)',
    withdrawAccount: '회원탈퇴',
    withdrawConfirmTitle: '회원탈퇴',
    withdrawConfirmMessage: '정말 탈퇴하시겠어요? 저장한 단어, 작성한 글 등 모든 정보가 삭제되며 되돌릴 수 없어요.',
    withdrawConfirmBtn: '탈퇴하기',
    withdrawFailedTitle: '탈퇴 실패',
    saveBtnLabel: '저장',
    savingLabel: '저장 중…',
    inputCheckTitle: '입력 확인',
    nicknameRequiredMessage: '닉네임을 입력해주세요.',
    saveFailedTitle: '저장 실패',
    saveCompleteTitle: '저장 완료',
    saveCompleteMessage: '내 정보가 수정됐어요.',
    confirmLabel: '확인',
    permissionNeededTitle: '권한 필요',
    galleryPermissionMessage: '갤러리 접근 권한이 필요합니다.',

    editLabel: '수정',
    deleteLabel: '삭제',
    reportLabel: '신고',
    blockLabel: '차단',
    deletePostTitle: '게시글 삭제',
    deleteCommentTitle: '댓글 삭제',
    deleteConfirmMessage: '정말 삭제하시겠어요? 되돌릴 수 없어요.',
    deleteFailedTitle: '삭제 실패',
    blockUserTitle: '사용자 차단',
    blockConfirmMessagePrefix: '',
    blockConfirmMessageSuffix: '님을 차단하면 이 유저의 글이 더 이상 보이지 않아요.',
    blockFailedTitle: '차단 실패',
    editFailedTitle: '수정 실패',
    reportReasonRequiredTitle: '신고 사유 필요',
    reportReasonRequiredMessage: '신고 사유를 입력해주세요.',
    reportFailedTitle: '신고 실패',
    reportReceivedTitle: '신고 접수',
    reportReceivedMessage: '신고가 접수됐어요. 운영팀이 확인할게요.',
    reportPostTitle: '게시글 신고',
    reportCommentTitle: '댓글 신고',
    reportSheetSub: '신고 사유를 알려주세요. 운영팀이 확인 후 조치할게요.',
    reportReasonPlaceholder: '신고 사유를 입력하세요',
    reportSubmitBtn: '신고하기',
    reportSubmittingLabel: '접수 중…',
    processingLabel: '처리 중…',

    premiumTitle: '프리미엄',
    premiumUpgradeCta: '프리미엄 업그레이드',
    premiumActiveLabel: '프리미엄 회원',
    premiumBannerTitle: '실전 한국어, 막힘없이',
    premiumBannerSub: '무제한 저장 · 상황별 학습 · 반복 복습까지',
    premiumFeatureUnlimitedSaves: '무제한 단어 저장',
    premiumFeatureOffline: '오프라인 사전 이용',
    premiumFeatureSituational: '상황별 실전 학습 (카페·지하철·회사 등)',
    premiumFeatureQuiz: '반복 복습 & 퀴즈',
    premiumFeaturePersonalized: '맞춤형 추천 학습',
    premiumFeatureExclusiveContent: '프리미엄 전용 콘텐츠',
    premiumActivateTestBtn: '프리미엄 체험 시작하기',
    premiumDeactivateTestBtn: '프리미엄 체험 종료하기',
    premiumActivatedAlert: '프리미엄이 활성화됐어요!',
    premiumComingSoonNote: '실제 결제는 준비 중이에요. 지금은 체험판으로 먼저 만나보세요.',
    saveLimitReachedTitle: '저장 한도에 도달했어요',
    saveLimitReachedMessage: '무료 회원은 단어를 최대 3개까지 저장할 수 있어요. 프리미엄으로 업그레이드하면 무제한으로 저장할 수 있어요.',
    dictionaryPremiumBannerText: '무제한 저장 · 오프라인 사전은 프리미엄에서',

    todayExpressionTitle: '오늘의 실전 표현',
    todayExpressionSub: '3분이면 충분해요, 바로 써먹는 한국어',
    situationCafe: '카페',
    situationSubway: '지하철',
    situationWork: '회사',
    situationHospital: '병원',
    situationSns: 'SNS',
    situationDinner: '회식',
    streakLabel: '연속 학습',
    streakDaysSuffix: '일째',
  },
  en: {
    home: 'Home',
    category: 'Category',
    dictionary: 'Dictionary',
    community: 'Community',
    mypage: 'My Page',
    settings: 'Settings',
    notifications: 'Notifications',
    languageSettings: 'Language Settings',
    activity: 'Activity',
    savedWords: 'Saved Words',
    likedPosts: 'Liked Posts',
    myActivity: 'My Activity',
    myPostsTab: 'Posts',
    myCommentedTab: 'Comments',
    myLikedTab: 'Liked',
    mySavedTab: 'Saved',
    noWrittenPostsYet: 'No posts written yet',
    noCommentedPostsYet: 'No commented posts yet',
    noLikedPostsYet: 'No liked posts yet',
    noSavedPostsYet: 'No saved posts yet',
    browseCommunity: 'Browse Community',
    suggestTitle: 'Suggest New Slang',
    suggestIntro: "Know a slang word that's not in the SokDak dictionary yet?\nSuggest it and we'll review it for addition!",
    suggestWordLabel: 'Word to suggest',
    suggestWordPlaceholder: 'e.g. 갓벽',
    suggestCategoryLabel: 'Category',
    suggestDefinitionLabel: 'Meaning (5+ characters)',
    suggestDefinitionPlaceholder: 'Explain what this word means',
    suggestExampleLabel: 'Example (optional)',
    suggestExamplePlaceholder: 'Add an example sentence if you have one',
    suggestSubmitBtn: 'Submit',
    suggestSubmitting: 'Submitting…',
    suggestFailedTitle: 'Suggestion failed',
    loginRequiredSuggest: 'Please log in to suggest a new slang word.',
    suggestDoneTitle: 'Thanks for the suggestion!',
    suggestDoneDescPrefix: "We've received your suggestion for '",
    suggestDoneDescSuffix: "'.\nIt may be added to the dictionary after review.",
    suggestAnother: 'Suggest another word',
    suggestBackToMypage: 'Back to My Page',
    suggestNewSlang: 'Suggest New Slang',
    loginNeeded: 'Login required',
    tapToLogin: 'Tap to login →',
    startWithSokdak: 'Start with Sokdak!',
    loginPrompt: 'Login to save words and use the community',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    logout: 'Logout',
    login: 'Login',
    customerService: 'Support',
    faqSearchPlaceholder: 'Search questions',
    contactDirectly: 'Contact us directly',
    contactMailUnavailableTitle: "Couldn't open your mail app",
    contactMailUnavailableBody: 'Please reach us directly at support@sokdak.app.',
    myInquiriesTitle: 'My Inquiries',
    inquiryPlaceholder: 'Type your inquiry here',
    inquirySubmitBtn: 'Submit',
    inquiryTypeLabel: 'Inquiry type',
    inquiryTypePlaceholder: 'Select a type',
    inquiryContentLabel: 'Details',
    inquirySubmittedTitle: 'Your inquiry is in!',
    inquirySubmittedSub: "We'll reply by email within 1–2 business days.",
    inquiryReceiptTypeLabel: 'Type',
    inquiryReceiptNumberLabel: 'Reference #',
    inquiryReceiptEtaLabel: 'Expected reply',
    inquiryEtaValue: '1–2 business days',
    inquiryEmptyText: "You haven't sent any inquiries yet",
    inquiryStatusOpen: 'Awaiting reply',
    inquiryStatusAnswered: 'Answered',
    inquiryReplyLabel: 'Support reply',
    saveWordCount: 'Saved words',
    likesCount: 'Likes',
    loginBannerSubtitle: 'Login to save words and use the community',

    newSlangSection: 'New Slang',
    newSlangSub: 'Check out the newest slang',
    moreLink: 'More',
    communitySub: 'Check out new posts',

    totalPrefix: 'Total',
    categoriesSuffix: 'categories',
    wordsSuffix: 'words',
    sortPopular: 'Popular',
    sortAlphabetical: 'A-Z',

    sortRecent: 'Recent',
    sortConsonant: 'Consonant',
    categoryFilterLabel: 'Category',
    allLabel: 'All',
    noSearchResults: 'No results found',
    wordSearchPlaceholder: 'Search words, meanings, or romanization',
    clearWordSearch: 'Clear search',
    translationSearchMatch: 'Meaning match:',
    voiceSearchLabel: 'Voice search',
    voiceSearchStopLabel: 'Stop voice search',
    voiceSearchListening: 'Listening. Say a Korean word.',
    voiceSearchPermissionMessage: 'Allow microphone access to use voice search.',
    voiceSearchNoMatchMessage: "We couldn't recognize that. Please try again.",
    voiceSearchUnavailableMessage: 'Voice search is unavailable. Check your device settings and internet connection.',
    voiceSearchPermissionTitle: 'Microphone permission is needed',
    voiceSearchPermissionRationale: 'Allow microphone access to search Korean words by voice.',
    voiceSearchPermissionSettingsMessage: 'Microphone access is turned off. Allow it in Android settings, then try again.',
    voiceSearchOpenSettingsLabel: 'Open settings',
    voiceSearchRetryPermissionLabel: 'Ask again',
    voiceSearchSettingsOpenError: 'We could not open settings. Allow microphone access for SokDak in your device settings.',
    modalHint: "We'll only show words in the categories you pick",
    resetLabel: 'Reset',
    applyLabel: 'Apply',

    wordNotFound: 'Word not found',
    categoryNotFound: 'Category not found',
    goBack: 'Go back',
    meaning: 'Meaning',
    culturalContext: 'Cultural Context',
    conversationExample: 'Conversation Example',
    additionalInfo: 'Additional Info',
    relatedWords: 'Related Words',
    askInCommunity: 'Ask about this word in the community',
    askInCommunityQuestion: '— got a question about it?',

    hotPosts: 'Hot Posts',
    noPostsYet: 'No posts yet',
    boardCurious: 'Curious',
    boardAskQuestion: 'Ask a Question',
    postNotFound: 'Post not found',
    loginRequiredTitle: 'Login required',
    loginRequiredLike: 'Please log in to like this post.',
    loginRequiredComment: 'Please log in to write a comment.',
    loginRequiredSave: 'Please log in to save this word.',
    loginRequiredCategoryLike: 'Please log in to favorite this category.',
    loginRequiredTts: 'Log in to listen to pronunciations.',
    categoryLikeLimitReachedTitle: "You've reached your favorites limit",
    categoryLikeLimitReachedMessage: 'Free members can favorite up to 2 categories. Upgrade to Premium for unlimited favorites.',
    ttsLimitReachedTitle: "You've used today's pronunciation plays",
    ttsLimitReachedMessage: 'Free members can listen to 3 pronunciations a day. Upgrade to Premium for unlimited listening.',
    a11ySaveWord: 'Save word',
    a11yPlayPronunciation: 'Play pronunciation',
    a11yLikeCategory: 'Favorite category',
    cancelLabel: 'Cancel',
    goToLogin: 'Go to login',
    commentFailedTitle: 'Failed to post comment',
    savedLabel: 'Saved',
    saveLabel: 'Save',
    shareLabel: 'Share',
    viewsLabel: 'Views',
    commentsLabel: 'Comments',
    replyingLabel: 'Replying',
    commentPlaceholder: 'Write a comment',
    sendLabel: 'Send',
    sendingLabel: 'Sending…',
    replyLabel: 'Reply',

    writeTitle: 'Write',
    submitting: 'Posting…',
    submitComplete: 'Post',
    validationTitle: 'Check your input',
    validationMessage: 'Title must be at least 2 characters and content at least 10.',
    submitFailedTitle: 'Failed to post',
    unknownError: 'An unknown error occurred.',
    cancelWriteTitle: 'Discard post?',
    cancelWriteMessage: 'Your draft will be lost. Discard it?',
    keepWriting: 'Keep writing',
    boardSelectLabel: 'Select board',
    boardDescCurious: "When you're curious about Korean slang",
    boardDescQA: 'For asking and answering questions',
    boardDescAsk: 'To share your thoughts freely',
    titlePlaceholder: 'Enter a title (2+ characters)',
    contentPlaceholder: 'Enter your content (10+ characters)\n\ne.g. "Hi, learning real Korean you won\'t find in textbooks with Sokdak!"',
    toolbarPhoto: 'Photo',
    toolbarLink: 'Link',
    toolbarFormat: 'Format',
    featureComingSoon: 'is coming soon.',
    linkModalTitle: 'Add link',
    linkUrlPlaceholder: 'https://example.com',
    linkLabelPlaceholder: 'Link text (optional)',
    linkInsert: 'Add',
    linkUrlRequiredMessage: 'Please enter a URL.',
    boldLabel: 'Bold',
    italicLabel: 'Italic',
    uploadingPhoto: 'Uploading photo…',
    uploadFailedTitle: 'Upload failed',
    titleNeeded: 'Title needed',
    contentNeeded: 'Content needed',
    readyToPost: 'Ready to post ✓',

    categorySearchTitle: 'Category Search',
    noCategoryResultsPrefix: 'No results found for',
    noCategoryResultsSuffix: 'Please check the spelling and try again.',
    suggestToTeam: 'Suggest to the team ›',
    recentSearches: 'Recent Searches',
    clearAll: 'Clear all',
    noRecentSearches: 'No recent searches.',
    trySearchingCategory: 'Try searching for a category',
    recommendedCategories: 'Recommended Categories',

    favoritesTitle: 'Favorites',
    favoritesLabel: 'Favorites',
    collapseLabel: 'Show less',
    noFavoritesYet: "You haven't favorited any words or categories yet",
    browseDictionary: 'Browse the dictionary',
    sortOldest: 'Oldest',
    sortNewest: 'Newest',

    notificationSettings: 'Notification Settings',
    allNotifications: 'All Notifications',
    allNotificationsDesc: 'Turn all notifications on or off at once',
    contentSectionLabel: 'Content',
    communitySectionLabel: 'Community',

    myInfoTitle: 'Edit Profile',
    loginRequiredGeneric: 'Login required',
    nicknameLabel: 'Nickname',
    nicknamePlaceholder: 'Enter a nickname',
    accountInfoSection: 'Account Info',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordChangePlaceholder: 'Only fill in to change it',
    timezoneLabel: 'Time Zone',
    timezonePlaceholder: 'e.g. Asia/Seoul',
    profileIconHint: 'Choose a profile icon',
    changePhoto: 'Change photo',
    addPhoto: 'Add photo',
    removePhoto: 'Remove photo',
    avatarHintSmall: 'Choose a flag emoji or a profile photo.',
    countrySearchPlaceholder: 'Search country (Korean/English)',
    withdrawAccount: 'Delete Account',
    withdrawConfirmTitle: 'Delete Account',
    withdrawConfirmMessage: 'Are you sure? Saved words, posts, and all your data will be permanently deleted.',
    withdrawConfirmBtn: 'Delete',
    withdrawFailedTitle: 'Delete Failed',
    saveBtnLabel: 'Save',
    savingLabel: 'Saving…',
    inputCheckTitle: 'Check Input',
    nicknameRequiredMessage: 'Please enter a nickname.',
    saveFailedTitle: 'Save Failed',
    saveCompleteTitle: 'Saved',
    saveCompleteMessage: 'Your info has been updated.',
    confirmLabel: 'OK',
    permissionNeededTitle: 'Permission Needed',
    galleryPermissionMessage: 'Gallery access is required.',

    editLabel: 'Edit',
    deleteLabel: 'Delete',
    reportLabel: 'Report',
    blockLabel: 'Block',
    deletePostTitle: 'Delete Post',
    deleteCommentTitle: 'Delete Comment',
    deleteConfirmMessage: "Are you sure? This can't be undone.",
    deleteFailedTitle: 'Delete Failed',
    blockUserTitle: 'Block User',
    blockConfirmMessagePrefix: 'Block ',
    blockConfirmMessageSuffix: "? You won't see their posts anymore.",
    blockFailedTitle: 'Block Failed',
    editFailedTitle: 'Edit Failed',
    reportReasonRequiredTitle: 'Reason Required',
    reportReasonRequiredMessage: 'Please enter a reason for the report.',
    reportFailedTitle: 'Report Failed',
    reportReceivedTitle: 'Report Received',
    reportReceivedMessage: "Your report has been submitted. Our team will review it.",
    reportPostTitle: 'Report Post',
    reportCommentTitle: 'Report Comment',
    reportSheetSub: "Tell us why you're reporting this. Our team will review and take action.",
    reportReasonPlaceholder: 'Enter your reason',
    reportSubmitBtn: 'Submit Report',
    reportSubmittingLabel: 'Submitting…',
    processingLabel: 'Processing…',

    premiumTitle: 'Premium',
    premiumUpgradeCta: 'Upgrade to Premium',
    premiumActiveLabel: 'Premium Member',
    premiumBannerTitle: 'Real Korean, without limits',
    premiumBannerSub: 'Unlimited saves · situational lessons · spaced review',
    premiumFeatureUnlimitedSaves: 'Unlimited word saves',
    premiumFeatureOffline: 'Offline dictionary access',
    premiumFeatureSituational: 'Situational lessons (cafés, subway, work, and more)',
    premiumFeatureQuiz: 'Spaced review & quizzes',
    premiumFeaturePersonalized: 'Personalized recommendations',
    premiumFeatureExclusiveContent: 'Premium-only content',
    premiumActivateTestBtn: 'Start Premium Trial',
    premiumDeactivateTestBtn: 'End Premium Trial',
    premiumActivatedAlert: 'Premium is now active!',
    premiumComingSoonNote: 'Real payment is coming soon. Try it as a trial for now.',
    saveLimitReachedTitle: "You've reached your save limit",
    saveLimitReachedMessage: 'Free members can save up to 3 words. Upgrade to Premium for unlimited saves.',
    dictionaryPremiumBannerText: 'Unlimited saves & offline dictionary with Premium',

    todayExpressionTitle: "Today's Real-Life Expression",
    todayExpressionSub: '3 minutes is all it takes — Korean you can use right now',
    situationCafe: 'Café',
    situationSubway: 'Subway',
    situationWork: 'Work',
    situationHospital: 'Hospital',
    situationSns: 'SNS',
    situationDinner: 'Team Dinner',
    streakLabel: 'Day Streak',
    streakDaysSuffix: 'days',
  },
  ja: {
    home: 'ホーム',
    category: 'カテゴリー',
    dictionary: '辞書',
    community: 'コミュニティ',
    mypage: 'マイページ',
    settings: '設定',
    notifications: '通知設定',
    languageSettings: '言語設定',
    activity: 'アクティビティ',
    savedWords: '保存した単語',
    likedPosts: 'いいねした投稿',
    myActivity: 'マイアクティビティ',
    myPostsTab: '投稿',
    myCommentedTab: 'コメント',
    myLikedTab: 'いいね',
    mySavedTab: '保存',
    noWrittenPostsYet: 'まだ投稿がありません',
    noCommentedPostsYet: 'まだコメントした投稿がありません',
    noLikedPostsYet: 'まだいいねした投稿がありません',
    noSavedPostsYet: 'まだ保存した投稿がありません',
    browseCommunity: 'コミュニティを見る',
    suggestTitle: '新造語を提案する',
    suggestIntro: 'ソクダク辞書にまだない新造語をご存知ですか？\nご提案いただければ検討のうえ追加します！',
    suggestWordLabel: '提案する単語',
    suggestWordPlaceholder: '例: 갓벽',
    suggestCategoryLabel: 'カテゴリー',
    suggestDefinitionLabel: '意味・説明（5文字以上）',
    suggestDefinitionPlaceholder: 'この単語の意味を説明してください',
    suggestExampleLabel: '例文（任意）',
    suggestExamplePlaceholder: 'この単語を使った例文があれば書いてください',
    suggestSubmitBtn: '提案する',
    suggestSubmitting: '送信中…',
    suggestFailedTitle: '提案に失敗しました',
    loginRequiredSuggest: '新造語を提案するにはログインしてください。',
    suggestDoneTitle: 'ご提案ありがとうございます！',
    suggestDoneDescPrefix: '「',
    suggestDoneDescSuffix: '」のご提案を受け付けました。\n検討のうえ辞書に反映されることがあります。',
    suggestAnother: '他の単語を提案する',
    suggestBackToMypage: 'マイページに戻る',
    suggestNewSlang: '新造語を提案する',
    loginNeeded: 'ログインが必要です',
    tapToLogin: 'タップしてログイン →',
    startWithSokdak: 'ソクダクと一緒に始めましょう！',
    loginPrompt: 'ログインすると単語の保存・コミュニティが利用できます',
    termsOfService: '利用規約',
    privacyPolicy: 'プライバシーポリシー',
    logout: 'ログアウト',
    login: 'ログイン',
    customerService: 'カスタマーサポート',
    faqSearchPlaceholder: '質問を検索',
    contactDirectly: '直接お問い合わせ',
    contactMailUnavailableTitle: 'メールアプリを開けませんでした',
    contactMailUnavailableBody: 'support@sokdak.app まで直接お問い合わせください。',
    myInquiriesTitle: '問い合わせ履歴',
    inquiryPlaceholder: 'お問い合わせ内容を入力してください',
    inquirySubmitBtn: '送信する',
    inquiryTypeLabel: '問い合わせ種類',
    inquiryTypePlaceholder: '種類を選択してください',
    inquiryContentLabel: '問い合わせ内容',
    inquirySubmittedTitle: 'お問い合わせを受け付けました！',
    inquirySubmittedSub: '営業日基準1〜2日以内にメールで回答いたします。',
    inquiryReceiptTypeLabel: '種類',
    inquiryReceiptNumberLabel: '受付番号',
    inquiryReceiptEtaLabel: '回答予定',
    inquiryEtaValue: '営業日1〜2日',
    inquiryEmptyText: 'まだ送った問い合わせがありません',
    inquiryStatusOpen: '回答待ち',
    inquiryStatusAnswered: '回答済み',
    inquiryReplyLabel: '運営からの回答',
    saveWordCount: '保存した単語',
    likesCount: 'いいね',
    loginBannerSubtitle: 'ログインすると単語の保存・コミュニティが利用できます',

    newSlangSection: '新しい新造語',
    newSlangSub: '新しく登場した新造語をチェックしてみましょう',
    moreLink: 'もっと見る',
    communitySub: '新しい投稿をチェックしましょう',

    totalPrefix: '全',
    categoriesSuffix: 'カテゴリー',
    wordsSuffix: '単語',
    sortPopular: '人気順',
    sortAlphabetical: 'あいうえお順',

    sortRecent: '最新順',
    sortConsonant: '子音順',
    categoryFilterLabel: 'カテゴリー',
    allLabel: 'すべて',
    noSearchResults: '検索結果がありません',
    wordSearchPlaceholder: '単語・意味・ローマ字を検索',
    clearWordSearch: '検索語を消去',
    translationSearchMatch: '意味の一致:',
    voiceSearchLabel: '音声検索',
    voiceSearchStopLabel: '音声検索を停止',
    voiceSearchListening: '聞き取り中です。韓国語の単語を話してください。',
    voiceSearchPermissionMessage: '音声検索を使うにはマイクへのアクセスを許可してください。',
    voiceSearchNoMatchMessage: '音声を認識できませんでした。もう一度話してください。',
    voiceSearchUnavailableMessage: '音声認識サービスを利用できません。端末の設定とインターネット接続を確認してください。',
    voiceSearchPermissionTitle: 'マイクの権限が必要です',
    voiceSearchPermissionRationale: 'マイクを許可すると、韓国語の単語を声で検索できます。',
    voiceSearchPermissionSettingsMessage: 'マイクの権限がオフです。Androidの設定でマイクを許可してから、もう一度試してください。',
    voiceSearchOpenSettingsLabel: '設定を開く',
    voiceSearchRetryPermissionLabel: 'もう一度許可を求める',
    voiceSearchSettingsOpenError: '設定を開けませんでした。端末の設定でSokDakのマイク権限を直接許可してください。',
    modalHint: '選択したカテゴリーに該当する単語のみ表示します',
    resetLabel: 'リセット',
    applyLabel: '適用する',

    wordNotFound: '単語が見つかりません',
    categoryNotFound: 'カテゴリーが見つかりません',
    goBack: '戻る',
    meaning: '意味',
    culturalContext: '文化的背景',
    conversationExample: '会話例',
    additionalInfo: '追加情報',
    relatedWords: '関連語',
    askInCommunity: 'この単語についてコミュニティで聞いてみる',
    askInCommunityQuestion: 'について気になることはありますか？',

    hotPosts: '話題の投稿',
    noPostsYet: 'まだ投稿がありません',
    boardCurious: '気になる',
    boardAskQuestion: '質問する',
    postNotFound: '投稿が見つかりません',
    loginRequiredTitle: 'ログインが必要です',
    loginRequiredLike: 'いいねをするにはログインしてください。',
    loginRequiredComment: 'コメントを書くにはログインしてください。',
    loginRequiredSave: '単語を保存するにはログインしてください。',
    loginRequiredCategoryLike: 'カテゴリーをお気に入りにするにはログインしてください。',
    loginRequiredTts: '発音を聞くにはログインが必要です。',
    categoryLikeLimitReachedTitle: 'お気に入り上限に達しました',
    categoryLikeLimitReachedMessage: '無料会員はカテゴリーを最大2個までお気に入りにできます。プレミアムにアップグレードすると無制限にお気に入りにできます。',
    ttsLimitReachedTitle: '本日の発音再生回数を使い切りました',
    ttsLimitReachedMessage: '無料会員は1日3回まで発音を聞けます。プレミアムにアップグレードすると無制限に聞けます。',
    a11ySaveWord: '単語を保存',
    a11yPlayPronunciation: '発音を再生',
    a11yLikeCategory: 'カテゴリーをお気に入りに追加',
    cancelLabel: 'キャンセル',
    goToLogin: 'ログインする',
    commentFailedTitle: 'コメントの投稿に失敗しました',
    savedLabel: '保存済み',
    saveLabel: '保存',
    shareLabel: '共有',
    viewsLabel: '閲覧',
    commentsLabel: 'コメント',
    replyingLabel: '返信作成中',
    commentPlaceholder: 'コメントを入力してください',
    sendLabel: '送信',
    sendingLabel: '送信中…',
    replyLabel: '返信',

    writeTitle: '投稿する',
    submitting: '登録中…',
    submitComplete: '投稿',
    validationTitle: '入力内容を確認してください',
    validationMessage: 'タイトルは2文字以上、本文は10文字以上で入力してください。',
    submitFailedTitle: '投稿に失敗しました',
    unknownError: '不明なエラーが発生しました。',
    cancelWriteTitle: '作成をキャンセル',
    cancelWriteMessage: '作成中の内容が失われます。キャンセルしますか？',
    keepWriting: '作成を続ける',
    boardSelectLabel: '掲示板を選択',
    boardDescCurious: '韓国語の新造語が気になるとき',
    boardDescQA: '質問と回答をやり取りするとき',
    boardDescAsk: '自由に意見を交わすとき',
    titlePlaceholder: 'タイトルを入力してください（2文字以上）',
    contentPlaceholder: '内容を入力してください（10文字以上）\n\n例）「こんにちは、教科書にはない本当の韓国語をソクダクで！」',
    toolbarPhoto: '写真',
    toolbarLink: 'リンク',
    toolbarFormat: '書式',
    featureComingSoon: '機能は準備中です。',
    linkModalTitle: 'リンクを追加',
    linkUrlPlaceholder: 'https://example.com',
    linkLabelPlaceholder: 'リンク名（任意）',
    linkInsert: '追加',
    linkUrlRequiredMessage: 'リンクのURLを入力してください。',
    boldLabel: '太字',
    italicLabel: '斜体',
    uploadingPhoto: '写真アップロード中…',
    uploadFailedTitle: 'アップロードに失敗しました',
    titleNeeded: 'タイトルが必要です',
    contentNeeded: '内容が必要です',
    readyToPost: '投稿準備完了 ✓',

    categorySearchTitle: 'カテゴリー検索',
    noCategoryResultsPrefix: 'の検索結果がありません。',
    noCategoryResultsSuffix: 'スペルを確認してもう一度お試しください。',
    suggestToTeam: '運営チームに提案する ›',
    recentSearches: '最近の検索',
    clearAll: 'すべて削除',
    noRecentSearches: '最近の検索履歴がありません。',
    trySearchingCategory: '気になるカテゴリーを検索してみましょう',
    recommendedCategories: 'おすすめカテゴリー',

    favoritesTitle: 'お気に入り',
    favoritesLabel: 'お気に入り',
    collapseLabel: '閉じる',
    noFavoritesYet: 'まだお気に入りの単語やカテゴリーがありません',
    browseDictionary: '辞書を見る',
    sortOldest: '登録順',
    sortNewest: '最新順',

    notificationSettings: '通知設定',
    allNotifications: 'すべての通知',
    allNotificationsDesc: 'すべての通知を一度にオン・オフできます',
    contentSectionLabel: 'コンテンツ',
    communitySectionLabel: 'コミュニティ',

    myInfoTitle: 'プロフィール編集',
    loginRequiredGeneric: 'ログインが必要です',
    nicknameLabel: 'ニックネーム',
    nicknamePlaceholder: 'ニックネームを入力してください',
    accountInfoSection: 'アカウント情報',
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'メールアドレスを入力してください',
    passwordLabel: 'パスワード',
    passwordChangePlaceholder: '変更する場合のみ入力してください',
    timezoneLabel: 'タイムゾーン',
    timezonePlaceholder: '例: Asia/Seoul',
    profileIconHint: 'プロフィールアイコンを選択',
    changePhoto: '写真を変更',
    addPhoto: '写真を追加',
    removePhoto: '写真を削除',
    avatarHintSmall: '国旗の絵文字またはプロフィール写真を選択できます。',
    countrySearchPlaceholder: '国を検索（韓国語/英語）',
    withdrawAccount: '退会する',
    withdrawConfirmTitle: '退会する',
    withdrawConfirmMessage: '本当に退会しますか？保存した単語、投稿など、すべての情報が削除され、元に戻せません。',
    withdrawConfirmBtn: '退会する',
    withdrawFailedTitle: '退会に失敗しました',
    saveBtnLabel: '保存',
    savingLabel: '保存中…',
    inputCheckTitle: '入力内容を確認',
    nicknameRequiredMessage: 'ニックネームを入力してください。',
    saveFailedTitle: '保存に失敗しました',
    saveCompleteTitle: '保存完了',
    saveCompleteMessage: 'プロフィールを更新しました。',
    confirmLabel: 'OK',
    permissionNeededTitle: '権限が必要です',
    galleryPermissionMessage: 'ギャラリーへのアクセス権限が必要です。',

    editLabel: '編集',
    deleteLabel: '削除',
    reportLabel: '通報',
    blockLabel: 'ブロック',
    deletePostTitle: '投稿を削除',
    deleteCommentTitle: 'コメントを削除',
    deleteConfirmMessage: '本当に削除しますか？元に戻せません。',
    deleteFailedTitle: '削除に失敗しました',
    blockUserTitle: 'ユーザーをブロック',
    blockConfirmMessagePrefix: '',
    blockConfirmMessageSuffix: 'さんをブロックすると、このユーザーの投稿が表示されなくなります。',
    blockFailedTitle: 'ブロックに失敗しました',
    editFailedTitle: '編集に失敗しました',
    reportReasonRequiredTitle: '通報理由が必要です',
    reportReasonRequiredMessage: '通報理由を入力してください。',
    reportFailedTitle: '通報に失敗しました',
    reportReceivedTitle: '通報を受け付けました',
    reportReceivedMessage: '通報を受け付けました。運営チームが確認します。',
    reportPostTitle: '投稿を通報',
    reportCommentTitle: 'コメントを通報',
    reportSheetSub: '通報理由を教えてください。運営チームが確認のうえ対応します。',
    reportReasonPlaceholder: '通報理由を入力してください',
    reportSubmitBtn: '通報する',
    reportSubmittingLabel: '送信中…',
    processingLabel: '処理中…',

    premiumTitle: 'プレミアム',
    premiumUpgradeCta: 'プレミアムにアップグレード',
    premiumActiveLabel: 'プレミアム会員',
    premiumBannerTitle: '実践韓国語を、制限なく',
    premiumBannerSub: '無制限保存・状況別学習・反復復習まで',
    premiumFeatureUnlimitedSaves: '単語を無制限に保存',
    premiumFeatureOffline: 'オフライン辞書の利用',
    premiumFeatureSituational: '状況別の実践学習（カフェ・地下鉄・会社など）',
    premiumFeatureQuiz: '反復復習＆クイズ',
    premiumFeaturePersonalized: 'パーソナライズされたおすすめ',
    premiumFeatureExclusiveContent: 'プレミアム限定コンテンツ',
    premiumActivateTestBtn: 'プレミアム体験を始める',
    premiumDeactivateTestBtn: 'プレミアム体験を終了する',
    premiumActivatedAlert: 'プレミアムが有効になりました！',
    premiumComingSoonNote: '実際の決済は準備中です。今はお試し版でご利用ください。',
    saveLimitReachedTitle: '保存上限に達しました',
    saveLimitReachedMessage: '無料会員は単語を最大3個まで保存できます。プレミアムにアップグレードすると無制限に保存できます。',
    dictionaryPremiumBannerText: '無制限保存・オフライン辞書はプレミアムで',

    todayExpressionTitle: '今日の実践表現',
    todayExpressionSub: '3分あれば十分、すぐ使える韓国語',
    situationCafe: 'カフェ',
    situationSubway: '地下鉄',
    situationWork: '会社',
    situationHospital: '病院',
    situationSns: 'SNS',
    situationDinner: '会食',
    streakLabel: '連続学習',
    streakDaysSuffix: '日目',
  },
  vi: {
    home: 'Trang chủ',
    category: 'Danh mục',
    dictionary: 'Từ điển',
    community: 'Cộng đồng',
    mypage: 'Trang cá nhân',
    settings: 'Cài đặt',
    notifications: 'Cài đặt thông báo',
    languageSettings: 'Cài đặt ngôn ngữ',
    activity: 'Hoạt động',
    savedWords: 'Từ đã lưu',
    likedPosts: 'Bài viết đã thích',
    myActivity: 'Hoạt động của tôi',
    myPostsTab: 'Bài viết',
    myCommentedTab: 'Bình luận',
    myLikedTab: 'Đã thích',
    mySavedTab: 'Đã lưu',
    noWrittenPostsYet: 'Chưa có bài viết nào',
    noCommentedPostsYet: 'Chưa bình luận bài viết nào',
    noLikedPostsYet: 'Chưa thích bài viết nào',
    noSavedPostsYet: 'Chưa lưu bài viết nào',
    browseCommunity: 'Khám phá cộng đồng',
    suggestTitle: 'Đề xuất từ mới',
    suggestIntro: 'Bạn biết một từ lóng chưa có trong từ điển SokDak?\nHãy đề xuất, chúng tôi sẽ xem xét và bổ sung!',
    suggestWordLabel: 'Từ muốn đề xuất',
    suggestWordPlaceholder: 'VD: 갓벽',
    suggestCategoryLabel: 'Danh mục',
    suggestDefinitionLabel: 'Ý nghĩa/Giải thích (từ 5 ký tự)',
    suggestDefinitionPlaceholder: 'Giải thích ý nghĩa của từ này',
    suggestExampleLabel: 'Ví dụ (tùy chọn)',
    suggestExamplePlaceholder: 'Viết câu ví dụ có dùng từ này nếu có',
    suggestSubmitBtn: 'Đề xuất',
    suggestSubmitting: 'Đang gửi…',
    suggestFailedTitle: 'Đề xuất thất bại',
    loginRequiredSuggest: 'Vui lòng đăng nhập để đề xuất từ mới.',
    suggestDoneTitle: 'Cảm ơn bạn đã đề xuất!',
    suggestDoneDescPrefix: "Chúng tôi đã nhận được đề xuất của bạn cho '",
    suggestDoneDescSuffix: "'.\nTừ này có thể được thêm vào từ điển sau khi xem xét.",
    suggestAnother: 'Đề xuất từ khác',
    suggestBackToMypage: 'Về trang cá nhân',
    suggestNewSlang: 'Đề xuất từ mới',
    loginNeeded: 'Cần đăng nhập',
    tapToLogin: 'Nhấn để đăng nhập →',
    startWithSokdak: 'Bắt đầu cùng Sokdak!',
    loginPrompt: 'Đăng nhập để lưu từ và dùng cộng đồng',
    termsOfService: 'Điều khoản dịch vụ',
    privacyPolicy: 'Chính sách bảo mật',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    customerService: 'Hỗ trợ',
    faqSearchPlaceholder: 'Tìm câu hỏi',
    contactDirectly: 'Liên hệ trực tiếp',
    contactMailUnavailableTitle: 'Không thể mở ứng dụng email',
    contactMailUnavailableBody: 'Vui lòng liên hệ trực tiếp qua support@sokdak.app.',
    myInquiriesTitle: 'Yêu cầu của tôi',
    inquiryPlaceholder: 'Nhập nội dung yêu cầu của bạn',
    inquirySubmitBtn: 'Gửi',
    inquiryTypeLabel: 'Loại yêu cầu',
    inquiryTypePlaceholder: 'Chọn loại yêu cầu',
    inquiryContentLabel: 'Nội dung yêu cầu',
    inquirySubmittedTitle: 'Yêu cầu của bạn đã được gửi!',
    inquirySubmittedSub: 'Chúng tôi sẽ trả lời qua email trong 1-2 ngày làm việc.',
    inquiryReceiptTypeLabel: 'Loại',
    inquiryReceiptNumberLabel: 'Mã yêu cầu',
    inquiryReceiptEtaLabel: 'Thời gian phản hồi dự kiến',
    inquiryEtaValue: '1-2 ngày làm việc',
    inquiryEmptyText: 'Bạn chưa gửi yêu cầu nào',
    inquiryStatusOpen: 'Đang chờ trả lời',
    inquiryStatusAnswered: 'Đã trả lời',
    inquiryReplyLabel: 'Phản hồi từ đội ngũ hỗ trợ',
    saveWordCount: 'Từ đã lưu',
    likesCount: 'Lượt thích',
    loginBannerSubtitle: 'Đăng nhập để lưu từ và dùng cộng đồng',

    newSlangSection: 'Từ lóng mới',
    newSlangSub: 'Xem những từ lóng mới xuất hiện',
    moreLink: 'Xem thêm',
    communitySub: 'Xem các bài viết mới',

    totalPrefix: 'Tổng',
    categoriesSuffix: 'danh mục',
    wordsSuffix: 'từ',
    sortPopular: 'Phổ biến',
    sortAlphabetical: 'Theo bảng chữ cái',

    sortRecent: 'Mới nhất',
    sortConsonant: 'Theo phụ âm',
    categoryFilterLabel: 'Danh mục',
    allLabel: 'Tất cả',
    noSearchResults: 'Không có kết quả tìm kiếm',
    wordSearchPlaceholder: 'Tìm từ, nghĩa hoặc phiên âm',
    clearWordSearch: 'Xóa nội dung tìm kiếm',
    translationSearchMatch: 'Khớp nghĩa:',
    voiceSearchLabel: 'Tìm kiếm bằng giọng nói',
    voiceSearchStopLabel: 'Dừng tìm kiếm bằng giọng nói',
    voiceSearchListening: 'Đang nghe. Hãy nói một từ tiếng Hàn.',
    voiceSearchPermissionMessage: 'Hãy cho phép truy cập micrô để dùng tính năng tìm kiếm bằng giọng nói.',
    voiceSearchNoMatchMessage: 'Không nhận diện được nội dung bạn nói. Hãy thử lại.',
    voiceSearchUnavailableMessage: 'Không thể dùng dịch vụ nhận dạng giọng nói. Hãy kiểm tra cài đặt thiết bị và kết nối internet.',
    voiceSearchPermissionTitle: 'Cần quyền dùng micrô',
    voiceSearchPermissionRationale: 'Hãy cho phép dùng micrô để tìm từ tiếng Hàn bằng giọng nói.',
    voiceSearchPermissionSettingsMessage: 'Quyền dùng micrô đang tắt. Hãy cho phép trong cài đặt Android rồi thử lại.',
    voiceSearchOpenSettingsLabel: 'Mở cài đặt',
    voiceSearchRetryPermissionLabel: 'Yêu cầu lại',
    voiceSearchSettingsOpenError: 'Không thể mở cài đặt. Hãy cho phép micrô cho SokDak trong cài đặt thiết bị.',
    modalHint: 'Chỉ hiển thị các từ thuộc danh mục bạn đã chọn',
    resetLabel: 'Đặt lại',
    applyLabel: 'Áp dụng',

    wordNotFound: 'Không tìm thấy từ',
    categoryNotFound: 'Không tìm thấy danh mục',
    goBack: 'Quay lại',
    meaning: 'Ý nghĩa',
    culturalContext: 'Bối cảnh văn hóa',
    conversationExample: 'Ví dụ hội thoại',
    additionalInfo: 'Thông tin thêm',
    relatedWords: 'Từ liên quan',
    askInCommunity: 'Hỏi về từ này trong cộng đồng',
    askInCommunityQuestion: ' — bạn có thắc mắc gì về từ này không?',

    hotPosts: 'Bài viết nổi bật',
    noPostsYet: 'Chưa có bài viết nào',
    boardCurious: 'Thắc mắc',
    boardAskQuestion: 'Đặt câu hỏi',
    postNotFound: 'Không tìm thấy bài viết',
    loginRequiredTitle: 'Cần đăng nhập',
    loginRequiredLike: 'Vui lòng đăng nhập để thích bài viết này.',
    loginRequiredComment: 'Vui lòng đăng nhập để viết bình luận.',
    loginRequiredSave: 'Vui lòng đăng nhập để lưu từ này.',
    loginRequiredCategoryLike: 'Vui lòng đăng nhập để yêu thích danh mục này.',
    loginRequiredTts: 'Đăng nhập để nghe phát âm.',
    categoryLikeLimitReachedTitle: 'Bạn đã đạt giới hạn yêu thích',
    categoryLikeLimitReachedMessage: 'Thành viên miễn phí chỉ yêu thích được tối đa 2 danh mục. Nâng cấp Premium để yêu thích không giới hạn.',
    ttsLimitReachedTitle: 'Bạn đã dùng hết lượt nghe phát âm hôm nay',
    ttsLimitReachedMessage: 'Thành viên miễn phí chỉ nghe được 3 lượt phát âm mỗi ngày. Nâng cấp Premium để nghe không giới hạn.',
    a11ySaveWord: 'Lưu từ',
    a11yPlayPronunciation: 'Nghe phát âm',
    a11yLikeCategory: 'Yêu thích danh mục',
    cancelLabel: 'Hủy',
    goToLogin: 'Đến trang đăng nhập',
    commentFailedTitle: 'Đăng bình luận thất bại',
    savedLabel: 'Đã lưu',
    saveLabel: 'Lưu',
    shareLabel: 'Chia sẻ',
    viewsLabel: 'Lượt xem',
    commentsLabel: 'Bình luận',
    replyingLabel: 'Đang trả lời',
    commentPlaceholder: 'Nhập bình luận',
    sendLabel: 'Gửi',
    sendingLabel: 'Đang gửi…',
    replyLabel: 'Trả lời',

    writeTitle: 'Viết bài',
    submitting: 'Đang đăng…',
    submitComplete: 'Đăng bài',
    validationTitle: 'Kiểm tra nội dung nhập',
    validationMessage: 'Tiêu đề cần từ 2 ký tự, nội dung cần từ 10 ký tự trở lên.',
    submitFailedTitle: 'Đăng bài thất bại',
    unknownError: 'Đã xảy ra lỗi không xác định.',
    cancelWriteTitle: 'Hủy bài viết?',
    cancelWriteMessage: 'Nội dung đang soạn sẽ bị mất. Bạn muốn hủy chứ?',
    keepWriting: 'Tiếp tục viết',
    boardSelectLabel: 'Chọn bảng tin',
    boardDescCurious: 'Khi bạn thắc mắc về từ lóng tiếng Hàn',
    boardDescQA: 'Để hỏi và trả lời câu hỏi',
    boardDescAsk: 'Để chia sẻ suy nghĩ tự do',
    titlePlaceholder: 'Nhập tiêu đề (từ 2 ký tự)',
    contentPlaceholder: 'Nhập nội dung (từ 10 ký tự)\n\nVD: "Xin chào, học tiếng Hàn thật sự không có trong sách giáo khoa cùng Sokdak!"',
    toolbarPhoto: 'Ảnh',
    toolbarLink: 'Liên kết',
    toolbarFormat: 'Định dạng',
    featureComingSoon: 'Tính năng đang được chuẩn bị.',
    linkModalTitle: 'Thêm liên kết',
    linkUrlPlaceholder: 'https://example.com',
    linkLabelPlaceholder: 'Tên liên kết (tùy chọn)',
    linkInsert: 'Thêm',
    linkUrlRequiredMessage: 'Vui lòng nhập địa chỉ liên kết.',
    boldLabel: 'Đậm',
    italicLabel: 'Nghiêng',
    uploadingPhoto: 'Đang tải ảnh lên…',
    uploadFailedTitle: 'Tải lên thất bại',
    titleNeeded: 'Cần có tiêu đề',
    contentNeeded: 'Cần có nội dung',
    readyToPost: 'Sẵn sàng đăng ✓',

    categorySearchTitle: 'Tìm danh mục',
    noCategoryResultsPrefix: ': không có kết quả tìm kiếm.',
    noCategoryResultsSuffix: 'Vui lòng kiểm tra lại chính tả và thử lại.',
    suggestToTeam: 'Đề xuất với đội ngũ vận hành ›',
    recentSearches: 'Tìm kiếm gần đây',
    clearAll: 'Xóa tất cả',
    noRecentSearches: 'Không có lịch sử tìm kiếm gần đây.',
    trySearchingCategory: 'Hãy thử tìm danh mục bạn quan tâm',
    recommendedCategories: 'Danh mục đề xuất',

    favoritesTitle: 'Yêu thích',
    favoritesLabel: 'Yêu thích',
    collapseLabel: 'Thu gọn',
    noFavoritesYet: 'Chưa có từ hoặc danh mục yêu thích nào',
    browseDictionary: 'Khám phá từ điển',
    sortOldest: 'Cũ nhất',
    sortNewest: 'Mới nhất',

    notificationSettings: 'Cài đặt thông báo',
    allNotifications: 'Tất cả thông báo',
    allNotificationsDesc: 'Bật/tắt tất cả thông báo cùng lúc',
    contentSectionLabel: 'Nội dung',
    communitySectionLabel: 'Cộng đồng',

    myInfoTitle: 'Chỉnh sửa hồ sơ',
    loginRequiredGeneric: 'Cần đăng nhập',
    nicknameLabel: 'Biệt danh',
    nicknamePlaceholder: 'Nhập biệt danh',
    accountInfoSection: 'Thông tin tài khoản',
    emailLabel: 'Email',
    emailPlaceholder: 'Nhập email của bạn',
    passwordLabel: 'Mật khẩu',
    passwordChangePlaceholder: 'Chỉ nhập khi muốn đổi',
    timezoneLabel: 'Múi giờ',
    timezonePlaceholder: 'VD: Asia/Seoul',
    profileIconHint: 'Chọn biểu tượng hồ sơ',
    changePhoto: 'Đổi ảnh',
    addPhoto: 'Thêm ảnh',
    removePhoto: 'Xóa ảnh',
    avatarHintSmall: 'Bạn có thể chọn biểu tượng cờ hoặc ảnh đại diện.',
    countrySearchPlaceholder: 'Tìm quốc gia (Hàn/Anh)',
    withdrawAccount: 'Xóa tài khoản',
    withdrawConfirmTitle: 'Xóa tài khoản',
    withdrawConfirmMessage: 'Bạn có chắc chắn không? Từ đã lưu, bài viết và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn.',
    withdrawConfirmBtn: 'Xóa',
    withdrawFailedTitle: 'Xóa thất bại',
    saveBtnLabel: 'Lưu',
    savingLabel: 'Đang lưu…',
    inputCheckTitle: 'Kiểm tra nội dung nhập',
    nicknameRequiredMessage: 'Vui lòng nhập biệt danh.',
    saveFailedTitle: 'Lưu thất bại',
    saveCompleteTitle: 'Đã lưu',
    saveCompleteMessage: 'Thông tin của bạn đã được cập nhật.',
    confirmLabel: 'Xác nhận',
    permissionNeededTitle: 'Cần quyền truy cập',
    galleryPermissionMessage: 'Cần quyền truy cập thư viện ảnh.',

    editLabel: 'Sửa',
    deleteLabel: 'Xóa',
    reportLabel: 'Báo cáo',
    blockLabel: 'Chặn',
    deletePostTitle: 'Xóa bài viết',
    deleteCommentTitle: 'Xóa bình luận',
    deleteConfirmMessage: 'Bạn có chắc chắn muốn xóa? Không thể hoàn tác.',
    deleteFailedTitle: 'Xóa thất bại',
    blockUserTitle: 'Chặn người dùng',
    blockConfirmMessagePrefix: 'Chặn ',
    blockConfirmMessageSuffix: '? Bạn sẽ không còn thấy bài viết của người này nữa.',
    blockFailedTitle: 'Chặn thất bại',
    editFailedTitle: 'Sửa thất bại',
    reportReasonRequiredTitle: 'Cần nhập lý do báo cáo',
    reportReasonRequiredMessage: 'Vui lòng nhập lý do báo cáo.',
    reportFailedTitle: 'Báo cáo thất bại',
    reportReceivedTitle: 'Đã nhận báo cáo',
    reportReceivedMessage: 'Báo cáo của bạn đã được gửi. Đội ngũ vận hành sẽ xem xét.',
    reportPostTitle: 'Báo cáo bài viết',
    reportCommentTitle: 'Báo cáo bình luận',
    reportSheetSub: 'Hãy cho chúng tôi biết lý do. Đội ngũ vận hành sẽ xem xét và xử lý.',
    reportReasonPlaceholder: 'Nhập lý do báo cáo',
    reportSubmitBtn: 'Gửi báo cáo',
    reportSubmittingLabel: 'Đang gửi…',
    processingLabel: 'Đang xử lý…',

    premiumTitle: 'Premium',
    premiumUpgradeCta: 'Nâng cấp Premium',
    premiumActiveLabel: 'Thành viên Premium',
    premiumBannerTitle: 'Tiếng Hàn thực tế, không giới hạn',
    premiumBannerSub: 'Lưu không giới hạn · học theo tình huống · ôn tập lặp lại',
    premiumFeatureUnlimitedSaves: 'Lưu từ không giới hạn',
    premiumFeatureOffline: 'Dùng từ điển ngoại tuyến',
    premiumFeatureSituational: 'Học theo tình huống (quán cà phê, tàu điện, công ty...)',
    premiumFeatureQuiz: 'Ôn tập lặp lại & câu đố',
    premiumFeaturePersonalized: 'Gợi ý học cá nhân hóa',
    premiumFeatureExclusiveContent: 'Nội dung độc quyền Premium',
    premiumActivateTestBtn: 'Bắt đầu dùng thử Premium',
    premiumDeactivateTestBtn: 'Kết thúc dùng thử Premium',
    premiumActivatedAlert: 'Premium đã được kích hoạt!',
    premiumComingSoonNote: 'Thanh toán thật đang được chuẩn bị. Hãy dùng thử miễn phí trước nhé.',
    saveLimitReachedTitle: 'Bạn đã đạt giới hạn lưu từ',
    saveLimitReachedMessage: 'Thành viên miễn phí chỉ lưu được tối đa 3 từ. Nâng cấp Premium để lưu không giới hạn.',
    dictionaryPremiumBannerText: 'Lưu không giới hạn & từ điển ngoại tuyến với Premium',

    todayExpressionTitle: 'Cụm từ thực tế hôm nay',
    todayExpressionSub: 'Chỉ cần 3 phút — tiếng Hàn dùng được ngay',
    situationCafe: 'Quán cà phê',
    situationSubway: 'Tàu điện ngầm',
    situationWork: 'Công ty',
    situationHospital: 'Bệnh viện',
    situationSns: 'Mạng xã hội',
    situationDinner: 'Tiệc công ty',
    streakLabel: 'Chuỗi ngày học',
    streakDaysSuffix: 'ngày',
  },
  es: {
    home: 'Inicio',
    category: 'Categoría',
    dictionary: 'Diccionario',
    community: 'Comunidad',
    mypage: 'Mi página',
    settings: 'Ajustes',
    notifications: 'Ajustes de notificaciones',
    languageSettings: 'Ajustes de idioma',
    activity: 'Actividad',
    savedWords: 'Palabras guardadas',
    likedPosts: 'Publicaciones que me gustan',
    myActivity: 'Mi actividad',
    myPostsTab: 'Publicaciones',
    myCommentedTab: 'Comentarios',
    myLikedTab: 'Me gusta',
    mySavedTab: 'Guardadas',
    noWrittenPostsYet: 'Aún no has escrito publicaciones',
    noCommentedPostsYet: 'Aún no has comentado ninguna publicación',
    noLikedPostsYet: 'Aún no te gusta ninguna publicación',
    noSavedPostsYet: 'Aún no has guardado ninguna publicación',
    browseCommunity: 'Explorar la comunidad',
    suggestTitle: 'Sugerir jerga nueva',
    suggestIntro: '¿Conoces una palabra de jerga que aún no está en el diccionario de SokDak?\n¡Sugiérela y la revisaremos para añadirla!',
    suggestWordLabel: 'Palabra a sugerir',
    suggestWordPlaceholder: 'ej. 갓벽',
    suggestCategoryLabel: 'Categoría',
    suggestDefinitionLabel: 'Significado (5+ caracteres)',
    suggestDefinitionPlaceholder: 'Explica qué significa esta palabra',
    suggestExampleLabel: 'Ejemplo (opcional)',
    suggestExamplePlaceholder: 'Añade una oración de ejemplo si tienes una',
    suggestSubmitBtn: 'Enviar',
    suggestSubmitting: 'Enviando…',
    suggestFailedTitle: 'Error al enviar la sugerencia',
    loginRequiredSuggest: 'Inicia sesión para sugerir una nueva palabra de jerga.',
    suggestDoneTitle: '¡Gracias por tu sugerencia!',
    suggestDoneDescPrefix: "Hemos recibido tu sugerencia para '",
    suggestDoneDescSuffix: "'.\nPuede añadirse al diccionario tras la revisión.",
    suggestAnother: 'Sugerir otra palabra',
    suggestBackToMypage: 'Volver a Mi página',
    suggestNewSlang: 'Sugerir jerga nueva',
    loginNeeded: 'Inicio de sesión requerido',
    tapToLogin: 'Toca para iniciar sesión →',
    startWithSokdak: '¡Empieza con Sokdak!',
    loginPrompt: 'Inicia sesión para guardar palabras y usar la comunidad',
    termsOfService: 'Términos de servicio',
    privacyPolicy: 'Política de privacidad',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    customerService: 'Soporte',
    faqSearchPlaceholder: 'Buscar preguntas',
    contactDirectly: 'Contáctanos directamente',
    contactMailUnavailableTitle: 'No se pudo abrir tu app de correo',
    contactMailUnavailableBody: 'Contáctanos directamente en support@sokdak.app.',
    myInquiriesTitle: 'Mis consultas',
    inquiryPlaceholder: 'Escribe tu consulta aquí',
    inquirySubmitBtn: 'Enviar',
    inquiryTypeLabel: 'Tipo de consulta',
    inquiryTypePlaceholder: 'Selecciona un tipo',
    inquiryContentLabel: 'Detalles de la consulta',
    inquirySubmittedTitle: '¡Tu consulta fue enviada!',
    inquirySubmittedSub: 'Te responderemos por correo en 1-2 días hábiles.',
    inquiryReceiptTypeLabel: 'Tipo',
    inquiryReceiptNumberLabel: 'N.º de referencia',
    inquiryReceiptEtaLabel: 'Respuesta estimada',
    inquiryEtaValue: '1-2 días hábiles',
    inquiryEmptyText: 'Todavía no has enviado ninguna consulta',
    inquiryStatusOpen: 'Esperando respuesta',
    inquiryStatusAnswered: 'Respondida',
    inquiryReplyLabel: 'Respuesta del equipo',
    saveWordCount: 'Palabras guardadas',
    likesCount: 'Me gusta',
    loginBannerSubtitle: 'Inicia sesión para guardar palabras y usar la comunidad',

    newSlangSection: 'Jerga nueva',
    newSlangSub: 'Descubre la jerga más reciente',
    moreLink: 'Ver más',
    communitySub: 'Descubre las publicaciones nuevas',

    totalPrefix: 'Total',
    categoriesSuffix: 'categorías',
    wordsSuffix: 'palabras',
    sortPopular: 'Popular',
    sortAlphabetical: 'A-Z',

    sortRecent: 'Reciente',
    sortConsonant: 'Por consonante',
    categoryFilterLabel: 'Categoría',
    allLabel: 'Todos',
    noSearchResults: 'No se encontraron resultados',
    wordSearchPlaceholder: 'Buscar palabras, significados o romanización',
    clearWordSearch: 'Borrar búsqueda',
    translationSearchMatch: 'Coincidencia de significado:',
    voiceSearchLabel: 'Búsqueda por voz',
    voiceSearchStopLabel: 'Detener búsqueda por voz',
    voiceSearchListening: 'Escuchando. Di una palabra en coreano.',
    voiceSearchPermissionMessage: 'Permite el acceso al micrófono para usar la búsqueda por voz.',
    voiceSearchNoMatchMessage: 'No pudimos reconocer lo que dijiste. Inténtalo de nuevo.',
    voiceSearchUnavailableMessage: 'No se puede usar el reconocimiento de voz. Revisa la configuración del dispositivo y la conexión a internet.',
    voiceSearchPermissionTitle: 'Se necesita permiso para el micrófono',
    voiceSearchPermissionRationale: 'Permite el micrófono para buscar palabras coreanas con la voz.',
    voiceSearchPermissionSettingsMessage: 'El permiso del micrófono está desactivado. Permítelo en los ajustes de Android y vuelve a intentarlo.',
    voiceSearchOpenSettingsLabel: 'Abrir ajustes',
    voiceSearchRetryPermissionLabel: 'Solicitar de nuevo',
    voiceSearchSettingsOpenError: 'No pudimos abrir los ajustes. Permite el micrófono para SokDak en los ajustes del dispositivo.',
    modalHint: 'Solo mostraremos palabras de las categorías que elijas',
    resetLabel: 'Restablecer',
    applyLabel: 'Aplicar',

    wordNotFound: 'Palabra no encontrada',
    categoryNotFound: 'Categoría no encontrada',
    goBack: 'Volver',
    meaning: 'Significado',
    culturalContext: 'Contexto cultural',
    conversationExample: 'Ejemplo de conversación',
    additionalInfo: 'Información adicional',
    relatedWords: 'Palabras relacionadas',
    askInCommunity: 'Preguntar sobre esta palabra en la comunidad',
    askInCommunityQuestion: ' — ¿tienes alguna pregunta sobre esta palabra?',

    hotPosts: 'Publicaciones destacadas',
    noPostsYet: 'Aún no hay publicaciones',
    boardCurious: 'Curiosidad',
    boardAskQuestion: 'Hacer una pregunta',
    postNotFound: 'Publicación no encontrada',
    loginRequiredTitle: 'Inicio de sesión requerido',
    loginRequiredLike: 'Inicia sesión para darle me gusta a esta publicación.',
    loginRequiredComment: 'Inicia sesión para escribir un comentario.',
    loginRequiredSave: 'Inicia sesión para guardar esta palabra.',
    loginRequiredCategoryLike: 'Inicia sesión para marcar esta categoría como favorita.',
    loginRequiredTts: 'Inicia sesión para escuchar la pronunciación.',
    categoryLikeLimitReachedTitle: 'Has alcanzado tu límite de favoritos',
    categoryLikeLimitReachedMessage: 'Los miembros gratuitos pueden marcar hasta 2 categorías como favoritas. Mejora a Premium para favoritos ilimitados.',
    ttsLimitReachedTitle: 'Has agotado tus reproducciones de hoy',
    ttsLimitReachedMessage: 'Los miembros gratuitos pueden escuchar 3 pronunciaciones al día. Mejora a Premium para escuchar sin límite.',
    a11ySaveWord: 'Guardar palabra',
    a11yPlayPronunciation: 'Reproducir pronunciación',
    a11yLikeCategory: 'Marcar categoría como favorita',
    cancelLabel: 'Cancelar',
    goToLogin: 'Ir a iniciar sesión',
    commentFailedTitle: 'Error al publicar el comentario',
    savedLabel: 'Guardado',
    saveLabel: 'Guardar',
    shareLabel: 'Compartir',
    viewsLabel: 'Vistas',
    commentsLabel: 'Comentarios',
    replyingLabel: 'Respondiendo',
    commentPlaceholder: 'Escribe un comentario',
    sendLabel: 'Enviar',
    sendingLabel: 'Enviando…',
    replyLabel: 'Responder',

    writeTitle: 'Escribir',
    submitting: 'Publicando…',
    submitComplete: 'Publicar',
    validationTitle: 'Revisa lo que escribiste',
    validationMessage: 'El título debe tener al menos 2 caracteres y el contenido al menos 10.',
    submitFailedTitle: 'Error al publicar',
    unknownError: 'Ocurrió un error desconocido.',
    cancelWriteTitle: '¿Descartar publicación?',
    cancelWriteMessage: 'Se perderá tu borrador. ¿Quieres descartarlo?',
    keepWriting: 'Seguir escribiendo',
    boardSelectLabel: 'Elegir tablón',
    boardDescCurious: 'Cuando tengas curiosidad por la jerga coreana',
    boardDescQA: 'Para hacer y responder preguntas',
    boardDescAsk: 'Para compartir tus opiniones libremente',
    titlePlaceholder: 'Escribe un título (2+ caracteres)',
    contentPlaceholder: 'Escribe tu contenido (10+ caracteres)\n\nej. "¡Hola! Aprende coreano real que no está en los libros de texto con Sokdak"',
    toolbarPhoto: 'Foto',
    toolbarLink: 'Enlace',
    toolbarFormat: 'Formato',
    featureComingSoon: 'Esta función estará disponible pronto.',
    linkModalTitle: 'Añadir enlace',
    linkUrlPlaceholder: 'https://example.com',
    linkLabelPlaceholder: 'Texto del enlace (opcional)',
    linkInsert: 'Añadir',
    linkUrlRequiredMessage: 'Por favor, introduce una URL.',
    boldLabel: 'Negrita',
    italicLabel: 'Cursiva',
    uploadingPhoto: 'Subiendo foto…',
    uploadFailedTitle: 'Error al subir',
    titleNeeded: 'Falta el título',
    contentNeeded: 'Falta el contenido',
    readyToPost: 'Listo para publicar ✓',

    categorySearchTitle: 'Buscar categoría',
    noCategoryResultsPrefix: ': no se encontraron resultados.',
    noCategoryResultsSuffix: 'Verifica la ortografía e inténtalo de nuevo.',
    suggestToTeam: 'Sugerir al equipo ›',
    recentSearches: 'Búsquedas recientes',
    clearAll: 'Borrar todo',
    noRecentSearches: 'No hay búsquedas recientes.',
    trySearchingCategory: 'Intenta buscar una categoría',
    recommendedCategories: 'Categorías recomendadas',

    favoritesTitle: 'Favoritos',
    favoritesLabel: 'Favoritos',
    collapseLabel: 'Ver menos',
    noFavoritesYet: 'Aún no has marcado palabras ni categorías como favoritas',
    browseDictionary: 'Explorar el diccionario',
    sortOldest: 'Más antiguo',
    sortNewest: 'Más reciente',

    notificationSettings: 'Ajustes de notificaciones',
    allNotifications: 'Todas las notificaciones',
    allNotificationsDesc: 'Activa o desactiva todas las notificaciones a la vez',
    contentSectionLabel: 'Contenido',
    communitySectionLabel: 'Comunidad',

    myInfoTitle: 'Editar perfil',
    loginRequiredGeneric: 'Inicio de sesión requerido',
    nicknameLabel: 'Apodo',
    nicknamePlaceholder: 'Introduce un apodo',
    accountInfoSection: 'Información de la cuenta',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'Introduce tu correo electrónico',
    passwordLabel: 'Contraseña',
    passwordChangePlaceholder: 'Complétalo solo si quieres cambiarla',
    timezoneLabel: 'Zona horaria',
    timezonePlaceholder: 'ej. Asia/Seoul',
    profileIconHint: 'Elige un icono de perfil',
    changePhoto: 'Cambiar foto',
    addPhoto: 'Añadir foto',
    removePhoto: 'Quitar foto',
    avatarHintSmall: 'Puedes elegir un emoji de bandera o una foto de perfil.',
    countrySearchPlaceholder: 'Buscar país (coreano/inglés)',
    withdrawAccount: 'Eliminar cuenta',
    withdrawConfirmTitle: 'Eliminar cuenta',
    withdrawConfirmMessage: '¿Estás seguro? Las palabras guardadas, publicaciones y todos tus datos se eliminarán de forma permanente.',
    withdrawConfirmBtn: 'Eliminar',
    withdrawFailedTitle: 'Error al eliminar',
    saveBtnLabel: 'Guardar',
    savingLabel: 'Guardando…',
    inputCheckTitle: 'Revisa lo que escribiste',
    nicknameRequiredMessage: 'Por favor, introduce un apodo.',
    saveFailedTitle: 'Error al guardar',
    saveCompleteTitle: 'Guardado',
    saveCompleteMessage: 'Tu información se ha actualizado.',
    confirmLabel: 'Aceptar',
    permissionNeededTitle: 'Permiso necesario',
    galleryPermissionMessage: 'Se necesita acceso a la galería.',

    editLabel: 'Editar',
    deleteLabel: 'Eliminar',
    reportLabel: 'Reportar',
    blockLabel: 'Bloquear',
    deletePostTitle: 'Eliminar publicación',
    deleteCommentTitle: 'Eliminar comentario',
    deleteConfirmMessage: '¿Estás seguro? Esta acción no se puede deshacer.',
    deleteFailedTitle: 'Error al eliminar',
    blockUserTitle: 'Bloquear usuario',
    blockConfirmMessagePrefix: 'Bloquear a ',
    blockConfirmMessageSuffix: '? Ya no verás sus publicaciones.',
    blockFailedTitle: 'Error al bloquear',
    editFailedTitle: 'Error al editar',
    reportReasonRequiredTitle: 'Se requiere un motivo',
    reportReasonRequiredMessage: 'Por favor, introduce un motivo para el reporte.',
    reportFailedTitle: 'Error al reportar',
    reportReceivedTitle: 'Reporte recibido',
    reportReceivedMessage: 'Tu reporte ha sido enviado. Nuestro equipo lo revisará.',
    reportPostTitle: 'Reportar publicación',
    reportCommentTitle: 'Reportar comentario',
    reportSheetSub: 'Cuéntanos por qué lo reportas. Nuestro equipo lo revisará y tomará medidas.',
    reportReasonPlaceholder: 'Introduce tu motivo',
    reportSubmitBtn: 'Enviar reporte',
    reportSubmittingLabel: 'Enviando…',
    processingLabel: 'Procesando…',

    premiumTitle: 'Premium',
    premiumUpgradeCta: 'Mejorar a Premium',
    premiumActiveLabel: 'Miembro Premium',
    premiumBannerTitle: 'Coreano real, sin límites',
    premiumBannerSub: 'Guardado ilimitado · lecciones por situación · repaso espaciado',
    premiumFeatureUnlimitedSaves: 'Guardado ilimitado de palabras',
    premiumFeatureOffline: 'Acceso al diccionario sin conexión',
    premiumFeatureSituational: 'Lecciones por situación (cafetería, metro, oficina y más)',
    premiumFeatureQuiz: 'Repaso espaciado y cuestionarios',
    premiumFeaturePersonalized: 'Recomendaciones personalizadas',
    premiumFeatureExclusiveContent: 'Contenido exclusivo Premium',
    premiumActivateTestBtn: 'Iniciar prueba Premium',
    premiumDeactivateTestBtn: 'Finalizar prueba Premium',
    premiumActivatedAlert: '¡Premium está activado!',
    premiumComingSoonNote: 'El pago real está en camino. Por ahora, pruébalo gratis.',
    saveLimitReachedTitle: 'Has alcanzado tu límite de guardado',
    saveLimitReachedMessage: 'Los miembros gratuitos pueden guardar hasta 3 palabras. Mejora a Premium para guardado ilimitado.',
    dictionaryPremiumBannerText: 'Guardado ilimitado y diccionario sin conexión con Premium',

    todayExpressionTitle: 'Expresión real de hoy',
    todayExpressionSub: 'Bastan 3 minutos — coreano que puedes usar ya',
    situationCafe: 'Cafetería',
    situationSubway: 'Metro',
    situationWork: 'Oficina',
    situationHospital: 'Hospital',
    situationSns: 'Redes sociales',
    situationDinner: 'Cena de equipo',
    streakLabel: 'Racha de días',
    streakDaysSuffix: 'días',
  },
};

let _language: Language = 'ko';
let _initialized = false;
let _initPromise: Promise<void> | null = null;
const _listeners = new Set<(language: Language) => void>();

async function loadLanguage() {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(raw as Language)) {
      _language = raw as Language;
    }
  } catch {
    _language = 'ko';
  }
}

async function persistLanguage() {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, _language);
  } catch {
    // ignore write errors
  }
}

export const languageStore = {
  initialize() {
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
      await loadLanguage();
      _initialized = true;
    })();
    return _initPromise;
  },
  isInitialized: () => _initialized,
  getLanguage: () => _language,
  setLanguage: (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    _language = lang;
    persistLanguage();
    _listeners.forEach(fn => fn(_language));
  },
  subscribe: (fn: (language: Language) => void) => {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
  t: (key: TranslationKey) => TRANSLATIONS[_language][key],
};

/** languageStore.t()와 달리 전역 상태와 무관하게 특정 언어로 바로 조회 — 이미 language 값을
 *  파라미터로 들고 있는 헬퍼 함수(getBoardLabel 등)에서 전역 상태를 건드리지 않고 쓰기 위함 */
export function tFor(language: Language, key: TranslationKey): string {
  return TRANSLATIONS[language][key];
}

/** 화면마다 반복되던 "초기화 + 구독" 보일러플레이트를 하나로 — 언어가 바뀌면 리렌더된다 */
export function useLanguage(): Language {
  const [language, setLanguage] = useState(languageStore.getLanguage());
  useEffect(() => {
    languageStore.initialize().then(() => setLanguage(languageStore.getLanguage()));
    const unsub = languageStore.subscribe(setLanguage);
    return () => { unsub(); };
  }, []);
  return language;
}
