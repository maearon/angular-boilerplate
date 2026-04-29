import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MicropostJson } from '../../core/models/api.types';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-micropost-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './micropost-item.component.html',
})
export class MicropostItemComponent {
  // 🔥 signal input
  item = input.required<MicropostJson>();

  readonly auth = inject(AuthSessionService);

  // 🔥 emit delete ra ngoài (để container xử lý API)
  delete = output<number>();

  onDelete(ev: Event) {
    ev.preventDefault();
    this.delete.emit(this.item().id); // ✅ emit number
  }
}
