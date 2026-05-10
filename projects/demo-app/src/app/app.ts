import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';
import { devLog } from './mixpanel-live-adapter';

@Component({
  selector: 'app-root',
  imports: [TrackEventDirective],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly trackConfig = trackConfig;
  protected readonly log = devLog;

  protected clearLog(): void {
    devLog.set([]);
  }
}
