import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ShortenPipe } from 'src/app/core/pipes/shorten.pipe';
import { CalendarModule } from 'angular-calendar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StarRatingComponent } from 'src/app/components/star-rating/star-rating.component';
import { LoaderComponent } from 'src/app/components/loader/loader.component';



@NgModule({
  declarations: [],
  imports: [
    ShortenPipe,
    StarRatingComponent,
    LoaderComponent
  ],
  exports : [
    CommonModule,
    RouterModule, 
    MaterialModule, 
    FormsModule, 
    ReactiveFormsModule,
    TablerIconsModule,
    TranslateModule,
    NgScrollbarModule,
    ShortenPipe,
    CalendarModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    StarRatingComponent,
    LoaderComponent,
  ],
  providers : [
    provideNativeDateAdapter()
  ]
})
export class SharedModule { }
