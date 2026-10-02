import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClanderVisitepreventiveRoutingModule } from './clander-visitepreventive-routing.module';
import { ClanderVisitepreventiveComponent } from './clander-visitepreventive.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [ClanderVisitepreventiveComponent],
  imports: [
    CommonModule,
    ClanderVisitepreventiveRoutingModule,
    SharedModule,
    FullCalendarModule,
    FormsModule
  ]
})
export class ClanderVisitepreventiveModule { }
