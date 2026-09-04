/** 홈 화면의 "오늘의 ~" 선택 로직과 실전 표현 데이터 — 순수 모듈. */
import type { TranslationKey } from '../../../shared/i18n/keys';

/** 날짜(YYYY-MM-DD)를 시드로 결정적 난수를 뽑아 오늘 하루 동안은 항상 같은 결과가 나오게 한다 */
export function pickDaily<T>(items: T[], count: number, seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const idx = h % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

/** "오늘의 실전 표현" — 한국 거주 외국인이 바로 써먹는 상황별 표현.
 * 신조어 사전과는 다른 결의 콘텐츠라 별도 로컬 데이터로 관리한다(다른 화면의
 * HORANG_HINTS 등과 동일한 컨벤션 — 아직 사전 콘텐츠처럼 5개 언어로 번역하진 않음). */
export type Situation = 'cafe' | 'subway' | 'work' | 'hospital' | 'sns' | 'dinner';

export const SITUATION_LABEL_KEY: Record<Situation, TranslationKey> = {
  cafe: 'situationCafe', subway: 'situationSubway', work: 'situationWork',
  hospital: 'situationHospital', sns: 'situationSns', dinner: 'situationDinner',
};

/** 교과서 문장 금지 — 10~20대가 실제로 쓰는 말투로, 사투리도 간간이 섞는다(운영자 지시).
 * 사투리 항목은 글로스에 지역·상대(친구끼리 등)를 반드시 표기해 잘못 쓰는 일을 막는다. */
export type Expression = {
  situation: Situation; ko: string; en: string; ja: string; es: string; vi: string; de: string;
  /** 문장 속 신조어가 사전에 있으면 그 단어 상세로 연결(표제어, words.id) */
  wordId?: string; wordLabel?: string;
};

/** 사전 예문과 동일한 규칙: ko/en UI는 영어 글로스, 나머지는 UI 언어(없으면 en 폴백). */
export const expressionGloss = (e: Expression, language: string) =>
  language === 'ko' || language === 'en' ? e.en : (e as Record<string, any>)[language] ?? e.en;

export const EXPRESSIONS: Expression[] = [
  { situation: 'cafe', ko: '아아 한 잔 주세요',
    en: 'One iced americano, please ("a-a" = iced americano slang)',
    ja: 'アイスアメリカーノひとつください(「アア」=アイスアメリカーノの略)',
    es: 'Un americano con hielo, por favor ("a-a" = jerga para americano helado)',
    vi: 'Cho một ly americano đá ("a-a" = tiếng lóng chỉ americano đá)',
    de: 'Einen Eis-Americano, bitte („a-a“ = Slang für Iced Americano)' },
  { situation: 'cafe', ko: '전 얼죽아예요',
    en: "I'm team iced-even-if-I-freeze (얼죽아 = iced americano no matter the season)",
    ja: '私は얼죽아です(얼죽아=凍え死んでもアイスアメリカーノ派)',
    es: 'Yo soy del equipo 얼죽아 (americano helado aunque me congele)',
    vi: 'Mình là hội 얼죽아 (chết cóng vẫn uống americano đá)',
    de: 'Ich bin Team 얼죽아 (Iced Americano, egal wie kalt es ist)',
    wordId: '136', wordLabel: '얼죽아' },
  { situation: 'subway', ko: '나 이번에 내려, 이따 봐',
    en: "I'm getting off here — see you later (texting a friend)",
    ja: 'ここで降りるね、また後で(友達へのメッセージ)',
    es: 'Me bajo aquí, nos vemos luego (mensaje a un amigo)',
    vi: 'Tớ xuống trạm này, gặp sau nhé (nhắn cho bạn bè)',
    de: 'Ich steige hier aus — bis später (an Freunde)' },
  { situation: 'subway', ko: '지금 지옥철이야, 숨도 못 쉬어',
    en: "I'm stuck in hell-train, can't even breathe (지옥철 = 지옥 hell + 지하철 subway, rush-hour crush)",
    ja: '今地獄鉄なんだけど、息もできない(지옥철=地獄+地下鉄、ラッシュのすし詰め)',
    es: 'Voy en el metro-infierno, no puedo ni respirar (지옥철 = infierno + metro en hora punta)',
    vi: 'Đang kẹt trong tàu-địa-ngục, thở không nổi (지옥철 = địa ngục + tàu điện giờ cao điểm)',
    de: 'Ich stecke in der Höllenbahn, kriege keine Luft (지옥철 = Hölle + U-Bahn zur Rushhour)',
    wordId: '217', wordLabel: '지옥철' },
  { situation: 'subway', ko: '언제 오노? 퍼뜩 온나',
    en: 'When are you coming? Hurry up! (Busan/Gyeongsang dialect, close friends only)',
    ja: 'いつ来るの?早く来い!(釜山・慶尚道の方言、親しい友達だけ)',
    es: '¿Cuándo vienes? ¡Date prisa! (dialecto de Busan/Gyeongsang, solo entre amigos íntimos)',
    vi: 'Bao giờ đến? Nhanh lên! (phương ngữ Busan/Gyeongsang, chỉ dùng với bạn thân)',
    de: 'Wann kommst du? Beeil dich! (Busan/Gyeongsang-Dialekt, nur unter engen Freunden)' },
  { situation: 'work', ko: '넵! 바로 확인하겠습니다',
    en: 'Got it! Checking right away (넵 = the eager work "yes" every young employee types)',
    ja: 'はい!すぐ確認します(「넵」=若手社員の定番の返事)',
    es: '¡Entendido! Lo reviso ahora mismo (넵 = el "sí" entusiasta del trabajo)',
    vi: 'Vâng ạ! Em kiểm tra ngay (넵 = kiểu "vâng" nhiệt tình nơi công sở)',
    de: 'Jawohl! Prüfe ich sofort (넵 = das eifrige Arbeits-„Ja“ junger Angestellter)',
    wordId: '4', wordLabel: '넵병' },
  { situation: 'work', ko: '오늘 칼퇴 각이에요',
    en: 'Today looks like an on-the-dot leave (칼퇴 = leaving sharp on time, 각 = "the vibe is right")',
    ja: '今日は定時退社できそう(칼퇴=時間ぴったりの退勤、각=「その流れ」)',
    es: 'Hoy pinta que salgo puntual (칼퇴 = salir del trabajo justo a la hora)',
    vi: 'Hôm nay chắc được về đúng giờ (칼퇴 = tan làm đúng giờ tăm tắp)',
    de: 'Heute sieht’s nach pünktlichem Feierabend aus (칼퇴 = auf die Minute gehen)',
    wordId: '170', wordLabel: '칼퇴' },
  { situation: 'hospital', ko: '어제부터 몸살 기운이 있어요',
    en: "I've felt achy and feverish since yesterday",
    ja: '昨日から体がだるくて熱っぽいです',
    es: 'Desde ayer me siento con malestar y algo de fiebre',
    vi: 'Từ hôm qua tôi thấy người mệt mỏi, ớn lạnh',
    de: 'Seit gestern fühle ich mich schlapp und fiebrig' },
  { situation: 'hospital', ko: '약빨이 잘 안 듣는 것 같아요',
    en: "The meds don't seem to kick in (약빨 = slangy word for a medicine's effect)",
    ja: '薬の効きがいまいちみたいです(약빨=薬の効き目を指すスラング)',
    es: 'Parece que la medicina no me hace efecto (약빨 = jerga para el efecto de un fármaco)',
    vi: 'Hình như thuốc không ngấm (약빨 = tiếng lóng chỉ tác dụng của thuốc)',
    de: 'Die Medizin scheint nicht anzuschlagen (약빨 = Slang für die Wirkung eines Medikaments)',
    wordId: '218', wordLabel: '약빨' },
  { situation: 'sns', ko: '스토리 봤어, 개웃겨 ㅋㅋ',
    en: 'Saw your story — hilarious (개- = slangy intensifier, friends only)',
    ja: 'ストーリー見たよ、めっちゃウケる ㅋㅋ(개-=強調のスラング、友達だけ)',
    es: 'Vi tu historia, qué risa ㅋㅋ (개- = intensificador de jerga, solo amigos)',
    vi: 'Xem story rồi, buồn cười xỉu ㅋㅋ (개- = từ nhấn mạnh kiểu lóng, chỉ với bạn bè)',
    de: 'Hab deine Story gesehen — zum Schreien ㅋㅋ (개- = Slang-Verstärker, nur unter Freunden)' },
  { situation: 'sns', ko: '맞팔해요!',
    en: "Let's follow each other! (맞팔 = mutual follow)",
    ja: '相互フォローしましょう!(맞팔=相互フォロー)',
    es: '¡Sigámonos mutuamente! (맞팔 = follow mutuo)',
    vi: 'Follow qua lại nhé! (맞팔 = follow lẫn nhau)',
    de: 'Lass uns gegenseitig folgen! (맞팔 = Mutual Follow)' },
  { situation: 'sns', ko: '완전 인생샷이다',
    en: 'That is THE shot of your life (인생샷 = best photo ever taken of you)',
    ja: '完全に人生最高の一枚だ(인생샷=人生でいちばんよく撮れた写真)',
    es: 'Es la foto de tu vida (인생샷 = la mejor foto que te han hecho)',
    vi: 'Đúng là bức ảnh để đời (인생샷 = tấm ảnh đẹp nhất đời)',
    de: 'Das ist DAS Foto deines Lebens (인생샷 = bestes Foto aller Zeiten)',
    wordId: '219', wordLabel: '인생샷' },
  { situation: 'dinner', ko: '오늘은 제가 쏠게요',
    en: "Tonight's on me (쏘다 = to treat someone)",
    ja: '今日は私がおごります(쏘다=おごる)',
    es: 'Hoy invito yo (쏘다 = invitar)',
    vi: 'Hôm nay để mình khao (쏘다 = khao, bao cả nhóm)',
    de: 'Heute geht’s auf mich (쏘다 = einladen/spendieren)' },
  { situation: 'dinner', ko: '저 술 잘 못 마셔요, 콜라로 할게요',
    en: "I'm not much of a drinker — I'll have a cola (natural way to pass)",
    ja: 'お酒は弱いので、コーラにします(自然な断り方)',
    es: 'No bebo mucho alcohol, tomaré una cola (forma natural de declinar)',
    vi: 'Mình không uống được rượu, cho mình cola nhé (cách từ chối tự nhiên)',
    de: 'Ich vertrage Alkohol nicht gut — ich nehme eine Cola (natürliches Ablehnen)' },
  { situation: 'dinner', ko: '겁나 맛있어요',
    en: 'This is crazy good (겁나 = Jeolla-dialect "super", now used nationwide)',
    ja: 'めちゃくちゃおいしいです(겁나=全羅道方言の「すごく」、今は全国区)',
    es: 'Está buenísimo (겁나 = "súper" del dialecto de Jeolla, hoy usado en todo el país)',
    vi: 'Ngon dã man (겁나 = "cực kỳ" gốc phương ngữ Jeolla, giờ dùng khắp nơi)',
    de: 'Das schmeckt wahnsinnig gut (겁나 = Jeolla-Dialekt für „mega“, heute überall üblich)' },
  { situation: 'dinner', ko: '마이 무라!',
    en: 'Dig in! (Busan/Gyeongsang dialect, banmal — close friends only)',
    ja: 'たくさん食べな!(釜山・慶尚道の方言でタメ口 — 親しい友達だけ)',
    es: '¡Come mucho! (dialecto de Busan/Gyeongsang, informal — solo amigos íntimos)',
    vi: 'Ăn nhiều vào! (phương ngữ Busan/Gyeongsang, suồng sã — chỉ với bạn thân)',
    de: 'Hau rein! (Busan/Gyeongsang-Dialekt, salopp — nur unter engen Freunden)' },
  { situation: 'work', ko: '퇴사 마렵다',
    en: 'I\'m dying to quit this job (마렵다 originally = "need the toilet"; young Koreans now use it for "craving X" — banmal, never in front of a boss)',
    ja: '仕事辞めたくてたまらない(마렵다=元は「トイレに行きたい」、今は若者言葉で「〜したくてたまらない」。タメ口で、上司の前では絶対に使わない)',
    es: 'Me muero por renunciar (마렵다 = originalmente "tener ganas de ir al baño"; hoy los jóvenes lo usan como "morirse de ganas de". Informal, nunca ante un superior)',
    vi: 'Thèm nghỉ việc quá (마렵다 = gốc là "mót đi vệ sinh", giới trẻ nay dùng cho "thèm kinh khủng". Suồng sã, tuyệt đối không dùng trước cấp trên)',
    de: 'Ich will nur noch kündigen (마렵다 = ursprünglich „aufs Klo müssen“, heute Jugendslang für „unbedingt wollen“. Salopp, niemals vor Vorgesetzten)' },
  { situation: 'sns', ko: '알 수 없는 알고리즘이 나를 여기로 이끌었다',
    en: 'The mysterious algorithm led me here (the staple YouTube/Reels comment when a random recommended clip sucks you in)',
    ja: '謎のアルゴリズムが私をここへ導いた(おすすめに突然出てきた動画にハマった時の定番コメント)',
    es: 'Un algoritmo misterioso me trajo hasta aquí (comentario típico de YouTube cuando un vídeo aleatorio te engancha)',
    vi: 'Thuật toán bí ẩn đã đưa tôi đến đây (bình luận kinh điển trên YouTube khi bị video gợi ý cuốn vào)',
    de: 'Ein unerklärlicher Algorithmus hat mich hierhergeführt (Standard-Kommentar auf YouTube, wenn ein zufällig empfohlenes Video einen fesselt)' },
  { situation: 'dinner', ko: '이거 완전 겉바속촉이다',
    en: 'This is properly crispy outside, soft inside (겉바속촉 = 겉은 바삭 속은 촉촉 — the go-to food compliment for fried chicken, pastries, cutlets)',
    ja: 'これ完全に外はサクサク中はしっとり(겉바속촉=「外カリ中しっとり」の略、チキンやパンを褒める定番の言い回し)',
    es: 'Esto está crujiente por fuera y jugoso por dentro (겉바속촉 = abreviatura de esa idea; el piropo gastronómico por excelencia)',
    vi: 'Món này đúng chuẩn ngoài giòn trong mềm (겉바속촉 = viết tắt của "ngoài giòn trong ẩm", lời khen món ăn quen thuộc nhất)',
    de: 'Das ist außen knusprig, innen saftig (겉바속촉 = Kurzwort dafür, das Standard-Foodkompliment)' },
  { situation: 'subway', ko: '막차 끊기기 전에 가야 돼',
    en: 'I have to go before the last train stops running (막차 끊기다 = the last train/bus is gone — the classic Korean exit line from a night out)',
    ja: '終電がなくなる前に行かなきゃ(막차 끊기다=終電・終バスがなくなる。飲み会を抜ける時の定番)',
    es: 'Tengo que irme antes de que se acabe el último metro (막차 끊기다 = ya no hay último tren/bus; la excusa clásica para irse de una quedada)',
    vi: 'Tớ phải đi trước khi hết chuyến tàu cuối (막차 끊기다 = tàu/xe buýt cuối đã hết; câu rút lui kinh điển khi đi chơi khuya)',
    de: 'Ich muss los, bevor die letzte Bahn weg ist (막차 끊기다 = letzte Bahn/Bus fährt nicht mehr; der Klassiker beim Aufbruch)' },
  { situation: 'cafe', ko: '여기 카공하기 좋다던데',
    en: 'I heard this place is good for studying at (카공 = 카페 공부, studying in a café; 카공족 = the people who camp there all day)',
    ja: 'ここ、カフェ勉するのに良いらしいよ(카공=カフェで勉強すること、카공족=カフェに長居して勉強する人たち)',
    es: 'Dicen que este sitio es bueno para estudiar (카공 = estudiar en una cafetería; 카공족 = los que se pasan el día allí estudiando)',
    vi: 'Nghe nói quán này học bài hợp lắm (카공 = học bài ở quán cà phê; 카공족 = hội ngồi quán cả ngày để học)',
    de: 'Hier soll man gut lernen können (카공 = im Café lernen; 카공족 = die Leute, die dort den ganzen Tag sitzen)' },
];
