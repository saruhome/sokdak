import { Redirect } from 'expo-router';

/** 루트(/) 진입 시 홈 탭으로 — 웹 프리뷰에서 Unmatched Route 방지 */
export default function Index() {
  return <Redirect href="/tabs" />;
}
