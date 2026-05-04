import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-root',
  imports: [TrackEventDirective],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly trackConfig = trackConfig;
  protected readonly copiedSnippet = signal<string | null>(null);

  protected async copySnippet(text: string, key: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text.trim());
      this.copiedSnippet.set(key);
      setTimeout(() => this.copiedSnippet.set(null), 1600);
    } catch {
      this.copiedSnippet.set(null);
    }
  }
}
