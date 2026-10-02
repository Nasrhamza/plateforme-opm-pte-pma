import { Component, Input } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-project-timeline',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './project-timeline.component.html',
  styleUrl: './project-timeline.component.scss'
})
export class ProjectTimelineComponent {

  @Input() start : Date;
  @Input() deadline : Date;
  @Input() closing : Date;


  isOverdue() {
    if (this.closing) {
      const closingDate = new Date(this.closing).setHours(0, 0, 0, 0);
      const deadlineDate = new Date(this.deadline).setHours(0, 0, 0, 0);
      
      return closingDate > deadlineDate;
    }
    return false;
  }
}
