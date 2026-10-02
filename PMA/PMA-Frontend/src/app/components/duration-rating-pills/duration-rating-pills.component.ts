import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RatingTypes } from 'src/app/core/helpers/rating.helpers';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-duration-rating-pills',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './duration-rating-pills.component.html',
  styleUrl: './duration-rating-pills.component.scss'
})
export class DurationRatingPillsComponent implements OnInit{

  @Output() onSelect = new EventEmitter<number>();
  selected : number;
  @Input() typeInput : string;
  selectedType : LabelType | null;

  constructor(){
  }
  
  ngOnInit(): void {
    this.selectedType = labelTypes.find(t => t.type === this.typeInput) || null;
  }

  handleSelect(value : number){
    //ENSURE ITS 100 BASED RATING
    this.onSelect.emit(value);
    this.selected = value;
  }
}

const labelTypes: LabelType[] = [
  {
    type: RatingTypes.Complexity,
    labels: [
      { level: 1, value: 'Very easy' },
      { level: 2, value: 'Easy' },
      { level: 3, value: 'Medium' },
      { level: 4, value: 'Complex' },
      { level: 5, value: 'Very complex' },
    ],
  },
  {
    type: RatingTypes.Duration,
    labels: [
      { level: 1, value: 'Very short' },
      { level: 2, value: 'Short' },
      { level: 3, value: 'Medium' },
      { level: 4, value: 'Long' },
      { level: 5, value: 'Very long' },
    ],
  },
  {
    type: RatingTypes.Intensity,
    labels: [
      { level: 1, value: 'Very low' },
      { level: 2, value: 'Low' },
      { level: 3, value: 'Medium' },
      { level: 4, value: 'High' },
      { level: 5, value: 'Major' },
    ],
  },
  {
    type: RatingTypes.Urgency,
    labels: [
      { level: 1, value: 'Not urgent at all' },
      { level: 2, value: 'Slightly urgent' },
      { level: 3, value: 'Moderately urgent' },
      { level: 4, value: 'Urgent' },
      { level: 5, value: 'Very urgent' },
    ],
  },
  {
    type: RatingTypes.Autonomy,
    labels: [
      { level: 1, value: 'Very low autonomy' },
      { level: 2, value: 'Low autonomy' },
      { level: 3, value: 'Moderate autonomy' },
      { level: 4, value: 'High autonomy' },
      { level: 5, value: 'Very high autonomy' },
    ],
  },
];


export interface LabelType {
  type: string;
  labels: { level : number, value : string }[];
}
