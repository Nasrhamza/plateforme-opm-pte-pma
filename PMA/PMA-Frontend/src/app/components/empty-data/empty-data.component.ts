import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-empty-data',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './empty-data.component.html',
  styleUrl: './empty-data.component.scss'
})
export class EmptyDataComponent {

}
