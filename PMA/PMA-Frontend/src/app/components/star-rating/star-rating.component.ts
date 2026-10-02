import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss'
})
export class StarRatingComponent {

  @Output() rating = new EventEmitter<number>()

  emptyPath = "../../../assets/images/svgs/empty-star.svg";
  filledPath = "../../../assets/images/svgs/filled-star.svg";
  stars = [
    { id: 1, path : this.emptyPath },
    { id: 2, path : this.emptyPath },
    { id: 3, path : this.emptyPath },
    { id: 4, path : this.emptyPath },
    { id: 5, path : this.emptyPath }
  ]
  
  handleClick(id : number){
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].path = i < id ? this.filledPath : this.emptyPath;
    }
    const rating = this.stars.filter(s => s.path === this.filledPath).length * 0.2;
    this.rating.emit(+rating.toPrecision(1));
  }

}
