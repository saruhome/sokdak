/**
 * delete-account 엣지 함수의 순수 로직 — Deno/`jsr:`/`npm:` 스펙 없이 일반 TS로 작성해
 * index.ts(Deno 런타임)와 Jest 테스트 양쪽에서 그대로 import할 수 있게 분리했다.
 */

/** Supabase Storage list()/remove()만 필요한 최소 인터페이스 — 실제 SupabaseClient가 구조적으로 만족한다. */
export type StorageAdmin = {
  storage: {
    from: (bucket: string) => {
      list: (
        path: string,
        options: { limit: number; sortBy: { column: string; order: 'asc' | 'desc' } },
      ) => Promise<{ data: { name: string }[] | null; error: { message: string } | null }>;
      remove: (paths: string[]) => Promise<{ error: { message: string } | null }>;
    };
  };
};

export const STORAGE_LIST_PAGE_LIMIT = 1000;
/** 1000개 페이지를 최대 이만큼 반복 — 그 이상은 재시도(같은 함수 재호출)로 이어간다.
 * 각 페이지를 지운 뒤 항상 offset 0에서 다시 list하므로(아래 설명) 재시도는 항상 안전하다. */
const MAX_PAGES = 50;

/**
 * 한 유저의 Storage 폴더를 전부 비운다. Storage list()는 최대 1000개까지만 반환하므로,
 * 1000개 초과 시 한 페이지를 지우고 다시 처음부터(offset 없이) list하는 것을 반복한다.
 * offset을 누적하며 페이징하면 지우는 도중 목록이 앞으로 당겨져 일부 객체를 건너뛰게 되므로
 * 의도적으로 매 반복 offset 0부터 다시 조회한다.
 *
 * 중간에 함수가 중단돼도(타임아웃 등) 이미 지운 페이지는 이미 지워진 채로 남고, 같은 함수를
 * 다시 호출하면 남은 객체부터 이어서 처리한다 — 별도 이어하기 상태를 저장할 필요가 없다.
 */
export async function removeAllUserStorageObjects(
  admin: StorageAdmin,
  bucket: string,
  userId: string,
): Promise<{ removed: number; remaining: boolean }> {
  let removed = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const { data: files, error } = await admin.storage
      .from(bucket)
      .list(userId, { limit: STORAGE_LIST_PAGE_LIMIT, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`Could not list ${bucket}: ${error.message}`);

    const paths = (files ?? []).filter(file => file.name).map(file => `${userId}/${file.name}`);
    if (paths.length === 0) return { removed, remaining: false };

    const { error: removeError } = await admin.storage.from(bucket).remove(paths);
    if (removeError) throw new Error(`Could not remove ${bucket}: ${removeError.message}`);
    removed += paths.length;

    if (paths.length < STORAGE_LIST_PAGE_LIMIT) return { removed, remaining: false };
  }
  return { removed, remaining: true };
}

/**
 * admin.auth.admin.deleteUser 실패가 "이미 삭제된 사용자"인지 판별한다 — 이 경우는 재호출이
 * 중복 요청이었을 뿐 실패가 아니므로, 호출부가 성공으로 취급해 idempotent하게 만든다.
 * GoTrue는 보통 404 + "User not found"를 반환하지만, supabase-js 버전에 따라 status가
 * 없을 수도 있어 메시지도 함께 확인한다.
 */
export function isUserAlreadyDeletedError(error: { status?: number; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.status === 404) return true;
  return /user not found/i.test(error.message ?? '');
}
