import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-nav-search',
  templateUrl: './nav-search.component.html',
  styleUrls: ['./nav-search.component.scss']
})
export class NavSearchComponent implements OnInit {

  public currentLanguage: string = 'English';
  public currentFlag: string = 'assets/flags/en.png';
  public languageDropdownVisible: boolean = false;
  public languages = [
    { code: 'en', name: 'English', flag: 'assets/flags/en.png' },
    { code: 'fr', name: 'French', flag: 'assets/flags/fr.png' }
  ];
  constructor(
    private translate: TranslateService,

  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    // Load language from localStorage if available
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      const language = JSON.parse(savedLanguage);
      this.currentLanguage = language.name;
      this.currentFlag = language.flag;
      this.translate.use(language.code); // Set language using ngx-translate
    }
  }

  toggleLanguage() {
    this.languageDropdownVisible = !this.languageDropdownVisible;
  }

  changeLanguage(languageCode: string) {
    const selectedLang = this.languages.find(lang => lang.code === languageCode);
    if (selectedLang) {
      this.currentLanguage = selectedLang.name;
      this.currentFlag = selectedLang.flag;
      this.translate.use(languageCode);

      // Save the selected language in localStorage
      localStorage.setItem('language', JSON.stringify({
        code: languageCode,
        name: selectedLang.name,
        flag: selectedLang.flag
      }));

      this.languageDropdownVisible = false; // Close dropdown after selecting a language
    }
  }


}
