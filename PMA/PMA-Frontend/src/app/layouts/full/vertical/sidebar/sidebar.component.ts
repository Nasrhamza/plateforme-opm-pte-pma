import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { BrandingComponent } from './branding.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    BrandingComponent, 
    SharedModule
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor() {}
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void {}
}