import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * expo-router 웹 전용 HTML 셸. 브라우저 기본(OS 강조색) 포커스 링이 앱 팔레트와 충돌해
 * 전역에서 끈다 — 포커스 표시는 각 입력창의 borderColor(로고 빨강/파랑 등)가 담당한다.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: [
              /* OS 강조색 기본 포커스 링 제거 — 포커스 표시는 각 입력창 borderColor가 담당 */
              'input:focus, textarea:focus { outline: none; }',
              /* 고정 높이 댓글 textarea에 항상 뜨는 세로 스크롤바·리사이즈 그립 숨김(스크롤 동작은 유지) */
              'textarea { resize: none; scrollbar-width: none; }',
              'textarea::-webkit-scrollbar { display: none; }',
            ].join('\n'),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
