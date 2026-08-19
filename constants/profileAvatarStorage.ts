import { supabase } from '@/constants/supabase';

export const PROFILE_AVATAR_BUCKET = 'profile-avatars';
export const PROFILE_AVATAR_SIGNED_URL_TTL_SECONDS = 60 * 60;
const MAX_PROFILE_AVATAR_BYTES = 2 * 1024 * 1024;

const PROFILE_AVATAR_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function isProfileAvatarPath(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith(`${PROFILE_AVATAR_BUCKET}/`));
}

function storageObjectPath(value: string) {
  return value.slice(`${PROFILE_AVATAR_BUCKET}/`.length);
}

/**
 * 프로필 DB에는 private bucket의 상대 경로만 저장한다. signed URL은 기기에만 짧게 보관해
 * 재로그인·다른 기기에서도 `file://` 경로가 남지 않도록 한다.
 */
export async function createProfileAvatarSignedUrl(path: string | null | undefined) {
  if (!isProfileAvatarPath(path)) return null;

  const { data, error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .createSignedUrl(storageObjectPath(path), PROFILE_AVATAR_SIGNED_URL_TTL_SECONDS);
  return error ? null : data.signedUrl;
}

export async function uploadProfileAvatar(input: { uri: string; mimeType?: string | null }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { path: null, signedUrl: null, error: '로그인이 필요해요.' };

  try {
    const response = await fetch(input.uri);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = (input.mimeType || response.headers.get('content-type') || '').toLowerCase().split(';')[0];
    const extension = PROFILE_AVATAR_EXTENSIONS[contentType];

    if (!extension) {
      return { path: null, signedUrl: null, error: 'JPEG, PNG 또는 WebP 이미지만 사용할 수 있어요.' };
    }
    if (arrayBuffer.byteLength > MAX_PROFILE_AVATAR_BYTES) {
      return { path: null, signedUrl: null, error: '프로필 사진은 2MB 이하만 사용할 수 있어요.' };
    }

    const objectPath = `${user.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_AVATAR_BUCKET)
      .upload(objectPath, arrayBuffer, { contentType, upsert: false });
    if (uploadError) return { path: null, signedUrl: null, error: uploadError.message };

    const path = `${PROFILE_AVATAR_BUCKET}/${objectPath}`;
    const signedUrl = await createProfileAvatarSignedUrl(path);
    if (!signedUrl) {
      await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([objectPath]);
      return { path: null, signedUrl: null, error: '프로필 사진 링크를 만들 수 없어요.' };
    }
    return { path, signedUrl, error: null };
  } catch {
    return { path: null, signedUrl: null, error: '프로필 사진을 업로드할 수 없어요.' };
  }
}

export async function removeProfileAvatar(path: string | null | undefined) {
  if (!isProfileAvatarPath(path)) return { error: null };
  const { error } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([storageObjectPath(path)]);
  return { error: error?.message ?? null };
}
