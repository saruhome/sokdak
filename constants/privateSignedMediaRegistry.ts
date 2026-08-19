export const PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS = 5 * 60 * 1000;

export type PrivateSignedMediaRefreshResult = { error: string | null };

/**
 * Private Storage 객체마다 짧은 수명의 signed URL과 만료 시각을 관리한다.
 * 동영상·문서 같은 후속 private 미디어는 URL이 갱신될 때 `notifyPrivateSignedMediaChanged()`를
 * 호출하고, 아래 형식으로 리소스를 등록하면 같은 foreground·만료 전 갱신을 공유한다.
 */
export type PrivateSignedMediaResource = {
  id: string;
  getExpiresAt: () => number | null;
  refresh: () => Promise<PrivateSignedMediaRefreshResult>;
};

const resources = new Map<string, PrivateSignedMediaResource>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(listener => listener());
}

export function registerPrivateSignedMediaResource(resource: PrivateSignedMediaResource) {
  resources.set(resource.id, resource);
  notify();
  return () => {
    resources.delete(resource.id);
    notify();
  };
}

/** URL·만료 시각이 바뀐 스토어는 호출해 현재 활성 스케줄을 다시 계산한다. */
export function notifyPrivateSignedMediaChanged() {
  notify();
}

export function subscribePrivateSignedMediaRefresh(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPrivateSignedMediaRefreshDelay(now = Date.now()) {
  const earliest = Array.from(resources.values())
    .map(resource => resource.getExpiresAt())
    .filter((expiresAt): expiresAt is number => expiresAt !== null)
    .reduce<number | null>((minimum, expiresAt) => minimum === null || expiresAt < minimum ? expiresAt : minimum, null);

  return earliest === null
    ? null
    : Math.max(0, earliest - now - PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS);
}

export async function refreshPrivateSignedMediaUrls({
  dueOnly = false,
  now = Date.now(),
}: {
  dueOnly?: boolean;
  now?: number;
} = {}) {
  const targets = Array.from(resources.values()).filter(resource => {
    if (!dueOnly) return true;
    const expiresAt = resource.getExpiresAt();
    if (expiresAt === null) return false;
    return expiresAt - PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS <= now;
  });

  return Promise.all(targets.map(async resource => {
    try {
      return { id: resource.id, ...(await resource.refresh()) };
    } catch {
      return { id: resource.id, error: 'Signed URL 갱신에 실패했어요.' };
    }
  }));
}
