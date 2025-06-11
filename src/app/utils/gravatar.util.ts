import { Md5 } from 'ts-md5';

export function gravatarUrl(email: string, size = 80): string {
  const validEmail = email?.trim() || 'manhng132@gmail.com';
  const hash = Md5.hashStr(validEmail.toLowerCase());
  return `https://secure.gravatar.com/avatar/${hash}?s=${size}`;
}
