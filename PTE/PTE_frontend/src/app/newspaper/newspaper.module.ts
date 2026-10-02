import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewspaperRoutingModule } from './newspaper-routing.module';
import { NewspaperComponent } from './all-news/newspaper.component';
import { NewPostComponent } from './new-post/new-post.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ToastrModule } from 'ngx-toastr';
import { AllCommentsComponent } from './all-comments/all-comments.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { EditPostComponent } from './edit-post/edit-post.component';
import { FeedsComponent } from './feeds/feeds.component';
import { ShortPipePipe } from '../core/pipes/short-pipe.pipe';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { LikersModalComponent } from './feeds/likers-modal/likers-modal.component';

@NgModule({
  declarations: [
    NewspaperComponent,
    NewPostComponent,
    AllCommentsComponent,
    EditPostComponent,
    FeedsComponent,
    ShortPipePipe,
    LikersModalComponent
  ],
  imports: [
    CommonModule,
    NewspaperRoutingModule,
    NgScrollbarModule,
    NgbModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left'
    }),
    ReactiveFormsModule,
    FormsModule,
    NgxDropzoneModule,
    MatMenuModule,
    MatIconModule
  ]
  
})
export class NewspaperModule { }
