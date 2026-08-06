import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'sokdak.language';
export type Language = 'ko' | 'en';

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
  | 'noWrittenPostsYet'
  | 'noCommentedPostsYet'
  | 'noLikedPostsYet'
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
  | 'processingLabel';

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
    noWrittenPostsYet: '아직 작성한 글이 없어요',
    noCommentedPostsYet: '아직 댓글을 단 글이 없어요',
    noLikedPostsYet: '아직 좋아요 한 글이 없어요',
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
    wordSearchPlaceholder: '단어 검색',
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
    noWrittenPostsYet: 'No posts written yet',
    noCommentedPostsYet: 'No commented posts yet',
    noLikedPostsYet: 'No liked posts yet',
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
    wordSearchPlaceholder: 'Search words',
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
  },
};

let _language: Language = 'ko';
let _initialized = false;
let _initPromise: Promise<void> | null = null;
const _listeners = new Set<(language: Language) => void>();

async function loadLanguage() {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (raw === 'en' || raw === 'ko') {
      _language = raw;
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
    if (lang !== 'ko' && lang !== 'en') return;
    _language = lang;
    persistLanguage();
    _listeners.forEach(fn => fn(_language));
  },
  subscribe: (fn: (language: Language) => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
  t: (key: TranslationKey) => TRANSLATIONS[_language][key],
};

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
