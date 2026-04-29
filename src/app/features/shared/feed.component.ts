import { Component, input, output } from '@angular/core';
import type { MicropostJson } from '../../core/models/api.types';
import { MicropostItemComponent } from '../microposts/micropost.component';

type Meta = {
  current_page: number;
  last_page: number;
  total: number;
};

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [MicropostItemComponent],
  templateUrl: './feed.component.html',
})
export class FeedComponent {
  // 🔥 signal inputs
  feed = input<MicropostJson[]>([]);
  meta = input<Meta | null>(null);
  loading = input(false);

  deleteItem = output<number>(); // ✅ number

  // 🔥 output signal
  pageChange = output<number>();

  goPage(p: number) {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.last_page) return;

    this.pageChange.emit(p);
  }
}
