import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-micropost-form',
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)">
      @if (errors().length) {
        <div class="alert alert-danger">
          <ul class="mb-0">
            @for (err of errors(); track err) {
              <li>{{ err }}</li>
            }
          </ul>
        </div>
      }

      <div class="mb-3">
        <textarea
          class="form-control"
          rows="3"
          placeholder="Compose new micropost..."
          [value]="draft()"
          (input)="onInput($event)"
        ></textarea>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button
          type="submit"
          class="btn btn-primary me-2"
          [disabled]="loading()"
        >
          Post
        </button>

        <input
          type="file"
          class="form-control form-control-sm"
          accept="image/jpeg,image/png,image/gif,image/webp"
          (change)="onFile($event)"
        />
      </div>
    </form>
  `,
})
export class MicropostFormComponent {
  // ✅ input từ parent
  loading = input<boolean>();

  // ✅ output sạch (KHÔNG phải Event)
  submitPost = output<{ content: string; file: File | null }>();

  // ✅ local UI state
  draft = signal('');
  image = signal<File | null>(null);
  errors = signal<string[]>([]);

  onInput(ev: Event): void {
    const value = (ev.target as HTMLTextAreaElement).value;
    this.draft.set(value);
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.image.set(input.files?.[0] ?? null);
  }

  onSubmit(ev: Event): void {
    ev.preventDefault();

    const content = this.draft().trim();

    if (!content) {
      this.errors.set(["Content can't be blank"]);
      return;
    }

    this.errors.set([]);

    // ✅ emit data
    this.submitPost.emit({
      content,
      file: this.image(),
    });

    // reset UI
    this.draft.set('');
    this.image.set(null);
  }
}
