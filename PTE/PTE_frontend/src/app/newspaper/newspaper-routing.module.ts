import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewspaperComponent } from './all-news/newspaper.component';
import { NewPostComponent } from './new-post/new-post.component';
import { FeedsComponent } from './feeds/feeds.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full'},
  // { path: 'allnews', component: NewspaperComponent },
  { path: 'allnews', component: FeedsComponent },
  { path: 'newPost', component: NewPostComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewspaperRoutingModule { }
