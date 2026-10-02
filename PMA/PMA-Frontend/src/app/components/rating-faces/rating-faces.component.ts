import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { labelTypes } from 'src/app/core/helpers/rating.helpers';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { LabelType } from '../duration-rating-pills/duration-rating-pills.component';

@Component({
  selector: 'app-rating-faces',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './rating-faces.component.html',
  styleUrl: './rating-faces.component.scss'
})
export class Ratingfaces implements OnInit{

  @Output() onSelect = new EventEmitter<number>();
  @Input() typeInput : string;
  @Input() labels : string[];
  selected : number;
  selectedType : LabelType | null;

  constructor(){
  }
  
  ngOnInit(): void {
    this.selectedType = labelTypes.find(t => t.type === this.typeInput) || null;
  }

  handleSelect(value : number){
    //ENSURE ITS 100 BASED RATING
    this.selected = value;
    this.onSelect.emit(value);
  }
}