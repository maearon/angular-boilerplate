import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    if (!iso) {
      return '';
    }
    const then = new Date(iso).getTime();
    const now = Date.now();
    const sec = Math.max(0, Math.floor((now - then) / 1000));
    if (sec < 60) {
      return `${sec}s`;
    }
    const min = Math.floor(sec / 60);
    if (min < 60) {
      return `${min}m`;
    }
    const h = Math.floor(min / 60);
    if (h < 24) {
      return `${h}h`;
    }
    const d = Math.floor(h / 24);
    return `${d}d`;
  }
}
