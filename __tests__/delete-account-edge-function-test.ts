/**
 * supabase/functions/delete-account/logic.ts의 순수 로직 회귀 테스트.
 * index.ts 자체(Deno.serve, jsr:/npm: 스펙 import)는 Jest에서 실행할 수 없어 분리된 부분만 검증한다.
 */
import {
  isUserAlreadyDeletedError,
  removeAllUserStorageObjects,
  STORAGE_LIST_PAGE_LIMIT,
  type StorageAdmin,
} from '../supabase/functions/delete-account/logic';

/**
 * Supabase Storage의 가상 폴더 의미론을 흉내내는 mock. 버킷 상태는 전체 객체 경로의
 * 평면 집합('user-1/a.jpg', 'user-1/albums/b.jpg', ...)이고, list(prefix)는 직계 자식만
 * 반환한다 — 파일은 id non-null, 폴더는 실제 SDK 계약대로 id null. remove()는 정확한
 * 경로 일치만 삭제하며, 폴더 경로가 넘어오면 실제 Storage처럼 조용히 no-op한다.
 */
function makeStorageAdmin(objectsByBucket: Record<string, Set<string>>): StorageAdmin & {
  removedPaths: string[];
} {
  const removedPaths: string[] = [];
  return {
    removedPaths,
    storage: {
      from: (bucket: string) => ({
        list: jest.fn(async (prefix: string) => {
          const objects = objectsByBucket[bucket] ?? new Set<string>();
          const files: { name: string; id: string | null }[] = [];
          const folders = new Set<string>();
          for (const path of objects) {
            if (!path.startsWith(`${prefix}/`)) continue;
            const rest = path.slice(prefix.length + 1);
            const slash = rest.indexOf('/');
            if (slash === -1) files.push({ name: rest, id: `id-${path}` });
            else folders.add(rest.slice(0, slash));
          }
          const data = [
            ...[...folders].map(name => ({ name, id: null })),
            ...files,
          ].slice(0, STORAGE_LIST_PAGE_LIMIT);
          return { data, error: null };
        }),
        remove: jest.fn(async (paths: string[]) => {
          const objects = objectsByBucket[bucket] ?? new Set<string>();
          for (const path of paths) {
            if (objects.delete(path)) removedPaths.push(path);
          }
          return { error: null };
        }),
      }),
    },
  };
}

function userFiles(userId: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${userId}/photo-${i}.jpg`);
}

describe('removeAllUserStorageObjects', () => {
  it('is a no-op when the user has no objects in the bucket', async () => {
    const admin = makeStorageAdmin({ 'post-images': new Set() });

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: 0, remaining: false });
  });

  it('removes a single file', async () => {
    const bucket = new Set(userFiles('user-1', 1));
    const admin = makeStorageAdmin({ 'post-images': bucket });

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: 1, remaining: false });
    expect(bucket.size).toBe(0);
  });

  it('removes exactly a full page (1000 objects)', async () => {
    const bucket = new Set(userFiles('user-1', STORAGE_LIST_PAGE_LIMIT));
    const admin = makeStorageAdmin({ 'post-images': bucket });

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: STORAGE_LIST_PAGE_LIMIT, remaining: false });
    expect(bucket.size).toBe(0);
  });

  it('removes every object across more than one page (>1000 objects)', async () => {
    const bucket = new Set(userFiles('user-1', STORAGE_LIST_PAGE_LIMIT + 250));
    const admin = makeStorageAdmin({ 'post-images': bucket });

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: STORAGE_LIST_PAGE_LIMIT + 250, remaining: false });
    expect(bucket.size).toBe(0);
  });

  it('recurses into nested folders instead of no-op-removing the folder path', async () => {
    const bucket = new Set([
      'user-1/top.jpg',
      'user-1/albums/nested-1.jpg',
      'user-1/albums/nested-2.jpg',
      'user-1/albums/deep/nested-3.jpg',
    ]);
    const admin = makeStorageAdmin({ 'post-images': bucket });

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: 4, remaining: false });
    expect(bucket.size).toBe(0);
  });

  it("never touches another user's prefix even when both exist in the bucket", async () => {
    const bucket = new Set([...userFiles('user-1', 3), ...userFiles('user-2', 3)]);
    const admin = makeStorageAdmin({ 'post-images': bucket });

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: 3, remaining: false });
    expect([...bucket].sort()).toEqual(userFiles('user-2', 3).sort());
    expect(admin.removedPaths.every(path => path.startsWith('user-1/'))).toBe(true);
  });

  it('re-listing after a partial run only sees what is still left (idempotent retry)', async () => {
    const bucket = new Set(userFiles('user-1', 2));
    const admin = makeStorageAdmin({ 'post-images': bucket });

    await removeAllUserStorageObjects(admin, 'post-images', 'user-1');
    // Calling it again for an already-emptied folder must not error or misbehave.
    const second = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(second).toEqual({ removed: 0, remaining: false });
  });

  it('surfaces a listing error instead of silently dropping objects', async () => {
    const admin: StorageAdmin = {
      storage: {
        from: () => ({
          list: jest.fn(async () => ({ data: null, error: { message: 'network error' } })),
          remove: jest.fn(),
        }),
      },
    };

    await expect(removeAllUserStorageObjects(admin, 'post-images', 'user-1')).rejects.toThrow('network error');
  });

  it('surfaces a mid-batch remove failure, leaving already-removed objects removed (retryable)', async () => {
    const bucket = new Set(userFiles('user-1', STORAGE_LIST_PAGE_LIMIT + 5));
    const base = makeStorageAdmin({ 'post-images': bucket });
    let removeCalls = 0;
    const admin: StorageAdmin = {
      storage: {
        from: (bucketName: string) => {
          const real = base.storage.from(bucketName);
          return {
            list: real.list,
            remove: async (paths: string[]) => {
              removeCalls++;
              if (removeCalls === 2) return { error: { message: 'batch failed' } };
              return real.remove(paths);
            },
          };
        },
      },
    };

    await expect(removeAllUserStorageObjects(admin, 'post-images', 'user-1')).rejects.toThrow('batch failed');
    // 첫 페이지는 이미 삭제됐고, 재시도는 남은 객체만 다시 보게 된다 — 이어하기가 안전하다.
    expect(bucket.size).toBe(5);
    const retry = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');
    expect(retry).toEqual({ removed: 5, remaining: false });
    expect(bucket.size).toBe(0);
  });
});

describe('isUserAlreadyDeletedError', () => {
  it('treats a 404 status as an already-deleted user', () => {
    expect(isUserAlreadyDeletedError({ status: 404, message: 'User not found' })).toBe(true);
  });

  it('falls back to matching the message when status is unavailable', () => {
    expect(isUserAlreadyDeletedError({ message: 'User not found' })).toBe(true);
  });

  it('treats an unrelated error as a real failure', () => {
    expect(isUserAlreadyDeletedError({ status: 500, message: 'Internal error' })).toBe(false);
  });

  it('treats a missing error as not an already-deleted case', () => {
    expect(isUserAlreadyDeletedError(null)).toBe(false);
    expect(isUserAlreadyDeletedError(undefined)).toBe(false);
  });
});
