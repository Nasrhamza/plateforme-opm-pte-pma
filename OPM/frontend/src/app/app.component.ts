import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import { AuthService } from './services/auth.service';
import { SolutionRequestsService } from './services/solution-requests.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'elite-able';

  constructor(private router: Router, private _auth : AuthService,private solReqService: SolutionRequestsService ) { }

  ngOnInit() {
      this.solReqService.loadCount();
  this.solReqService.listenSockets();
    this._auth.autoLogin()
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

}
