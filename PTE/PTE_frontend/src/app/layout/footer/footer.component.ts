import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.sass']
})
export class FooterComponent implements OnInit {
  theme!:string
  constructor() { }

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme')!;
    this.isTheme()
  }

  isTheme(){
    if(this.theme=="light")
      return true
    else 
      return false
    
  }

}
