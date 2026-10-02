import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { MessageService } from './core/services/message.service';
import { SharedModule } from './shared/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'SmartERP';
  banner = "1";

  constructor(
    private _auth : AuthService,
    private _message : MessageService,
    private translate: TranslateService,
  ){}

  ngOnInit() {
    this.initUserLanguage();
    this._auth.autoLogin();

    const banner_value = localStorage.getItem("banner");
    if(banner_value != null || banner_value != undefined){
      this.banner = banner_value;
    }else{
      this.banner = "1";
    }
    this.autoLogout()
  }

  initUserLanguage(){
    const userLanguage = localStorage.getItem('PMA_USER_LANGUAGE');
    if(userLanguage){
      const language:{ language: string, code: string, type: string, icon: string } = JSON.parse(userLanguage);
      this.translate.use(language.code);
      return;
    }
    this.translate.use('en');
  };

  closeBanner(){
    if(this.banner = "1"){
      localStorage.setItem("banner", "0");
      this.banner = "0";
    }
  }
  autoLogout(){
    const payload = this._auth.getAuthUser();
    if (payload && payload.token) {
      const tokenPayload = JSON.parse(atob(payload.token.split('.')[1]));
      const expirationDate = new Date(tokenPayload.exp * 1000);
      const now = new Date();
      if (expirationDate > now) {
        this._auth.autoLogout(expirationDate.getTime() - now.getTime());
      } else {
        this._auth.logout();
        this._message.showErrorMessage("Token expired, you're logged out");
      }
    }else{
      this._auth.logout();
    }
  }

}
