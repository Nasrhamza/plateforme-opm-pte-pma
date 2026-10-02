import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-clander',
  templateUrl: './info-clander.component.html',
  styleUrls: ['./info-clander.component.scss']
})
export class InfoClanderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  closeMyModal(event) {
    ((event.target.parentElement.parentElement).parentElement).classList.remove('md-show');
  }
}
