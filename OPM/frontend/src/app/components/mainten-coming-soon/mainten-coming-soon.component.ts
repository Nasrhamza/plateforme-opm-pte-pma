import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mainten-coming-soon',
  templateUrl: './mainten-coming-soon.component.html',
  styleUrls: ['./mainten-coming-soon.component.scss']
})
export class MaintenComingSoonComponent implements OnInit {

  constructor( private router:Router) { }

  ngOnInit() {
  }
  goToHome() {
    this.router.navigate(['/main/sample-page']);
  }
}
