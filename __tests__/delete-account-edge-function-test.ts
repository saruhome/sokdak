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

function makeStorageAdmin(filesByBucket: Record<string, string[]>): StorageAdmin {
  return {
    storage: {
      from: (bucket: string) => ({
        list: jest.fn(async () => ({
          data: (filesByBucket[bucket] ?? []).slice(0, STORAGE_LIST_PAGE_LIMIT).map(name => ({ name })),
          error: null,
        })),
        remove: jest.fn(async (paths: string[]) => {
          const names = new Set(paths.map(p => p.split('/').pop()));
          filesByBucket[bucket] = (filesByBucket[bucket] ?? []).filter(name => !names.has(name));
          return { error: null };
        }),
      }),
    },
  };
}

describe('removeAllUserStorageObjects', () => {
  it('is a no-op when the user has no objects in the bucket', async () => {
    const admin = makeStorageAdmin({ 'post-images': [] });

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: 0, remaining: false });
  });

  it('removes every object across more than one page (>1000 objects)', async () => {
    const files = Array.from({ length: STORAGE_LIST_PAGE_LIMIT + 250 }, (_, i) => `photo-${i}.jpg`);
    const bucketState = { 'post-images': files };
    const admin = makeStorageAdmin(bucketState);

    const result = await removeAllUserStorageObjects(admin, 'post-images', 'user-1');

    expect(result).toEqual({ removed: STORAGE_LIST_PAGE_LIMIT + 250, remaining: false });
    expect(bucketState['post-images']).toEqual([]);
  });

  it('re-listing after a partial run only sees what is still left (idempotent retry)', async () => {
    const bucketState = { 'post-images': ['a.jpg', 'b.jpg'] };
    const admin = makeStorageAdmin(bucketState);

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
