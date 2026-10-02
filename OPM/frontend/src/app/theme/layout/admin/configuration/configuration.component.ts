import {Component, NgZone, OnInit, ViewEncapsulation} from '@angular/core';
import {DattaConfig} from '../../../../app-config';
import {Location} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfigurationComponent implements OnInit {
  public styleSelectorToggle: boolean; // open configuration menu
  public stylePreBuiltToggle: boolean; // open prebuilt configuration menu
  public layoutType: string; // layout type
  public rtlLayout: any; // rtl type
  public menuFixedLayout: any; // menu/navbar fixed flag
  public headerFixedLayout: any; // header fixed flag
  public boxLayout: any; // box layout flag
  public isColoredIcon: any; // menu icon color
  public headerBackgroundColor: string; // header background color
  public navbarBackgroundColor: string; // navbar background color
  public brandBackgroundColor: string; // brand/logo background color
  public navBackgorundImage: any; // navbar background image

  public menuDropdownIcon: string; // navbar background image
  public menuListIcon: string; // navbar background image

  public navActiveColor: string;
  public navTitleColor: string;
  public menuTitleHide: any;

  public headerBackColor: string;

  public eliteConfig: any;
  public isConfig: boolean;

  constructor(private zone: NgZone, private location: Location, private router: Router) {
    this.eliteConfig = DattaConfig.config;
    this.setThemeLayout();
  }

  ngOnInit() {
    this.styleSelectorToggle = false;

    this.layoutType =  this.eliteConfig['layout-type'];
    this.setLayout(this.layoutType);

    this.isColoredIcon = this.eliteConfig['nav-icon-color'];
    this.changeIconColor(this.isColoredIcon);

    this.headerBackgroundColor = this.eliteConfig['header-back-color'];
    this.navbarBackgroundColor = this.eliteConfig['nav-back-color'];
    this.brandBackgroundColor = this.eliteConfig['nav-brand-color'];
    this.navBackgorundImage = this.eliteConfig['nav-back-image'];

    this.setHeaderBackground(this.headerBackgroundColor);
    this.setNavbarBackground(this.navbarBackgroundColor);
    this.setBrandBackground(this.brandBackgroundColor);
    this.setBackgroundImage(this.navBackgorundImage);

    this.rtlLayout = this.eliteConfig['rtl-layout'];
    this.changeRtlLayout(this.rtlLayout);

    this.menuFixedLayout = this.eliteConfig['nav-fixed-layout'];
    if (this.eliteConfig['layout'] === 'vertical') {
      this.changeMenuFixedLayout(this.menuFixedLayout);
    }

    this.headerFixedLayout = this.eliteConfig['header-fixed-layout'];
    this.changeHeaderFixedLayout(this.headerFixedLayout);

    this.boxLayout = this.eliteConfig['box-layout'];
    this.changeBoxLayout(this.boxLayout);

    this.menuDropdownIcon = this.eliteConfig['nav-dropdown-icon'];
    this.setMenuDropdownIcon(this.menuDropdownIcon);

    this.menuListIcon = this.eliteConfig['nav-list-icon'];
    this.setMenuListIcon(this.menuListIcon);

    this.navActiveColor = this.eliteConfig['nav-active-list-color'];
    this.setNavActiveColor(this.navActiveColor);

    this.navTitleColor = this.eliteConfig['nav-list-title-color'];
    this.setNavTitleColor(this.navTitleColor);

    this.menuTitleHide = this.eliteConfig['nav-list-title-hide'];
    this.changeMenuTitle(this.menuTitleHide);

    if (this.eliteConfig['pre-layout'] !== '' && this.eliteConfig['pre-layout'] !== null) {
      this.setPreBuildLayout(this.eliteConfig['pre-layout']);
    }
    // this.router.navigate(['/dashboard/default']);
  }

  setThemeLayout() {
    let current_url = this.location.path();
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path();
    }

    switch (current_url) {
      case this.location['_baseHref'] + '/layout/static':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['nav-fixed-layout'] = false;
        this.eliteConfig['header-fixed-layout'] = false;
        break;
      case this.location['_baseHref'] + '/layout/fixed':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['nav-fixed-layout'] = true;
        this.eliteConfig['header-fixed-layout'] = true;
        break;
      case this.location['_baseHref'] + '/layout/nav-fixed':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['nav-fixed-layout'] = true;
        this.eliteConfig['header-fixed-layout'] = false;
        break;
      case this.location['_baseHref'] + '/layout/nav-image':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['nav-back-image'] = 'navbar-image-3';
        break;
      case this.location['_baseHref'] + '/layout/collapse-menu':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['collapse-menu'] = true;
        break;
      case this.location['_baseHref'] + '/layout/horizontal':
        this.eliteConfig['layout'] = 'horizontal';
        break;
      case this.location['_baseHref'] + '/layout/box':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['box-layout'] = true;
        this.eliteConfig['collapse-menu'] = true;
        break;
      case this.location['_baseHref'] + '/layout/rtl':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['rtl-layout'] = true;
        break;
      case this.location['_baseHref'] + '/layout/light':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['layout-type'] = 'menu-light';
        break;
      case this.location['_baseHref'] + '/layout/dark':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['layout-type'] = 'dark';
        this.eliteConfig['nav-back-color'] = 'navbar-dark';
        this.eliteConfig['nav-brand-color'] = 'brand-dark';
        break;
      case this.location['_baseHref'] + '/layout/icon-color':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['layout-type'] = 'menu-light';
        this.eliteConfig['nav-icon-color'] = true;
        break;
      case this.location['_baseHref'] + '/layout/layout-1':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['pre-layout'] = 'layout-1';
        break;
      case this.location['_baseHref'] + '/layout/layout-2':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['pre-layout'] = 'layout-2';
        this.eliteConfig['nav-back-color'] = 'navbar-blue';
        break;
      case this.location['_baseHref'] + '/layout/layout-3':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['pre-layout'] = 'layout-3';
        this.eliteConfig['layout-type'] = 'menu-light';
        this.eliteConfig['header-fixed-layout'] = true;
        this.eliteConfig['nav-fixed-layout'] = true;
        this.eliteConfig['nav-brand-color'] = 'brand-blue';
        this.eliteConfig['header-back-color'] = 'header-blue';
        break;
      case this.location['_baseHref'] + '/layout/layout-4':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['pre-layout'] = 'layout-4';
        this.eliteConfig['nav-brand-color'] = 'brand-blue';
        this.eliteConfig['header-fixed-layout'] = false;
        this.eliteConfig['nav-fixed-layout'] = false;
        this.eliteConfig['nav-icon-color'] = true;
        this.eliteConfig['layout-type'] = 'menu-light';
        break;
      case this.location['_baseHref'] + '/layout/layout-5':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['pre-layout'] = 'layout-5';
        this.eliteConfig['header-fixed-layout'] = false;
        this.eliteConfig['nav-fixed-layout'] = false;
        break;
      case this.location['_baseHref'] + '/layout/layout-12':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['layout-type'] = 'menu-light';
        this.eliteConfig['pre-layout'] = 'layout-12';
        this.eliteConfig['nav-fixed-layout'] = true;
        break;
      case this.location['_baseHref'] + '/layout/nav-color':
        this.eliteConfig['layout'] = 'vertical';
        this.eliteConfig['layout-type'] = 'menu-light';
        this.eliteConfig['nav-icon-color'] = true;
        this.eliteConfig['header-back-color'] = 'header-info';
        this.eliteConfig['nav-brand-color'] = 'brand-info';
        this.eliteConfig['nav-fixed-layout'] = true;
        this.eliteConfig['header-fixed-layout'] = true;
        break;
      default:
        break;
    }
  }

  setPreBuildLayout(pre_layout) {
    document.querySelector('body').classList.add(pre_layout);
  }

  setHeaderBackColor(color) {
    this.headerBackColor = color;
    (document.querySelector('body') as HTMLElement).style.background = color;
  }

  // change main layout
  setLayout(layout) {
    this.isConfig = true;
    this.setNavbarBackground(this.eliteConfig['nav-back-color']);
    this.setBrandBackground(this.eliteConfig['nav-brand-color']);
    document.querySelector('.pcoded-navbar').classList.remove('menu-light');
    document.querySelector('.pcoded-navbar').classList.remove('menu-dark');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-dark');
    document.querySelector('.pcoded-navbar').classList.remove('brand-dark');
    document.querySelector('body').classList.remove('elite-dark');
    this.setHeaderBackground('header-default');

    this.layoutType = layout;
    if (layout === 'menu-light') {
      this.setNavbarBackground(this.navbarBackgroundColor);
      this.setBrandBackground(this.brandBackgroundColor);
      document.querySelector('.pcoded-navbar').classList.add(layout);
    }
    if (layout === 'dark') {
      document.querySelector('.pcoded-navbar').classList.add('navbar-dark');
      document.querySelector('.pcoded-navbar').classList.add('brand-dark');

      this.setNavbarBackground('navbar-dark');
      this.setBrandBackground('brand-dark');
      if (this.eliteConfig['pre-layout'] !== 'layout-4' ) {
        this.setHeaderBackground('header-dark');
      }

      document.querySelector('body').classList.add('elite-dark');
    }
    if (layout === 'reset') {
      this.reset();
    }
  }

  reset() {
    document.querySelector('.pcoded-navbar').classList.remove('icon-colored');
    this.ngOnInit();
  }

  setColoredIcon(e) {
    const flag = !!(e.target.checked);
    this.changeIconColor(flag);
  }

  changeIconColor(flag) {
    if (flag) {
      document.querySelector('.pcoded-navbar').classList.add('icon-colored');
    } else {
      document.querySelector('.pcoded-navbar').classList.remove('icon-colored');
    }
  }

  setRtlLayout(e) {
    const flag = !!(e.target.checked);
    this.changeRtlLayout(flag);
  }

  changeRtlLayout(flag) {
    if (flag) {
      document.querySelector('body').classList.add('elite-rtl');
    } else {
      document.querySelector('body').classList.remove('elite-rtl');
    }
  }

  setMenuFixedLayout(e) {
    const flag = !!(e.target.checked);
    this.changeMenuFixedLayout(flag);
  }

  changeMenuFixedLayout(flag) {
    setTimeout(() => {
      if (flag) {
        document.querySelector('.pcoded-navbar').classList.remove('menupos-static');
        document.querySelector('.pcoded-navbar').classList.add('menupos-fixed');
        (document.querySelector('#nav-ps-elite') as HTMLElement).style.maxHeight = 'calc(100vh - 70px)'; // calc(100vh - 70px) amit
      } else {
        document.querySelector('.pcoded-navbar').classList.add('menupos-static');
        document.querySelector('.pcoded-navbar').classList.remove('menupos-fixed');
        (document.querySelector('#nav-ps-elite') as HTMLElement).style.maxHeight = 'calc(100vh - 70px)'; // calc(100% - 70px) amit
      }
    }, 100);
  }

  setHeaderFixedLayout(e) {
    const flag = !!(e.target.checked);
    this.changeHeaderFixedLayout(flag);
  }

  changeHeaderFixedLayout(flag) {
    if (flag) {
      document.querySelector('.pcoded-header').classList.add('headerpos-fixed');
      // document.querySelector('.pcoded-header').classList.add('header-blue');
    } else {
      document.querySelector('.pcoded-header').classList.remove('headerpos-fixed');
    }
  }

  setBoxLayout(e) {
    const flag = !!(e.target.checked);
    this.changeBoxLayout(flag);
  }

  changeBoxLayout(flag) {
    if (flag) {
      document.querySelector('body').classList.add('container');
      document.querySelector('body').classList.add('box-layout');
    } else {
      document.querySelector('body').classList.remove('box-layout');
      document.querySelector('body').classList.remove('container');
    }
  }

  hideMenuTitle(e) {
    const flag = !!(e.target.checked);
    this.changeMenuTitle(flag);
  }

  changeMenuTitle(flag) {
    if (flag) {
      document.querySelector('.pcoded-navbar').classList.add('caption-hide');
    } else {
      document.querySelector('.pcoded-navbar').classList.remove('caption-hide');
    }
  }

  setHeaderBackground(background) {
    this.headerBackgroundColor = background;
    document.querySelector('.pcoded-header').classList.remove('header-blue');
    document.querySelector('.pcoded-header').classList.remove('header-red');
    document.querySelector('.pcoded-header').classList.remove('header-purple');
    document.querySelector('.pcoded-header').classList.remove('header-info');
    document.querySelector('.pcoded-header').classList.remove('header-dark');
    if (background !== 'header-default') {
      document.querySelector('.pcoded-header').classList.add(background);
    }
  }

  setNavbarBackground(background) {
    this.setBackgroundImage(this.eliteConfig['nav-back-image']);

    document.querySelector('.pcoded-navbar').classList.remove('navbar-blue');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-red');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-purple');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-info');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-dark');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-blue');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-red');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-purple');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-info');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-dark');

    this.navbarBackgroundColor = background;

    // add default menu brand background color
    document.querySelector('.pcoded-navbar').classList.add('brand-default');
    if (background !== 'navbar-default') {
      document.querySelector('.pcoded-navbar').classList.remove('menu-light');
      document.querySelector('.pcoded-navbar').classList.add(background);
    }
  }

  setBrandBackground(background) {
    this.brandBackgroundColor = background;
    document.querySelector('.pcoded-navbar').classList.remove('brand-default');
    document.querySelector('.pcoded-navbar').classList.remove('brand-blue');
    document.querySelector('.pcoded-navbar').classList.remove('brand-red');
    document.querySelector('.pcoded-navbar').classList.remove('brand-purple');
    document.querySelector('.pcoded-navbar').classList.remove('brand-info');
    document.querySelector('.pcoded-navbar').classList.remove('brand-dark');
    document.querySelector('.pcoded-navbar').classList.add(background);
  }

  setBackgroundImage(image) {
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-1');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-2');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-3');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-4');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-5');
    if (image) {
      document.querySelector('.pcoded-navbar').classList.remove('navbar-blue');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-red');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-purple');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-info');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-dark');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-blue');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-red');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-purple');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-info');
      document.querySelector('.pcoded-navbar').classList.remove('navbar-gradient-dark');

      document.querySelector('.pcoded-navbar').classList.remove('menu-light');
      this.navBackgorundImage = image;
      document.querySelector('.pcoded-navbar').classList.add(image);
    }
  }

  setMenuDropdownIcon(icon) {
    document.querySelector('.pcoded-navbar').classList.remove('drp-icon-style1');
    document.querySelector('.pcoded-navbar').classList.remove('drp-icon-style2');
    document.querySelector('.pcoded-navbar').classList.remove('drp-icon-style3');
    if (icon !== 'style1') {
      document.querySelector('.pcoded-navbar').classList.add('drp-icon-' + icon);
    }
  }

  setMenuListIcon(icon) {
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style1');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style2');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style3');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style4');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style5');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style6');
    if (icon !== 'style1') {
      document.querySelector('.pcoded-navbar').classList.add('menu-item-icon-' + icon);
    }
  }

  setNavActiveColor(style) {
    this.navActiveColor = style;
    document.querySelector('.pcoded-navbar').classList.remove('active-default');
    document.querySelector('.pcoded-navbar').classList.remove('active-blue');
    document.querySelector('.pcoded-navbar').classList.remove('active-red');
    document.querySelector('.pcoded-navbar').classList.remove('active-purple');
    document.querySelector('.pcoded-navbar').classList.remove('active-info');
    document.querySelector('.pcoded-navbar').classList.remove('active-dark');
    if (style !== 'active-default') {
      document.querySelector('.pcoded-navbar').classList.add(style);
    }
  }

  setNavTitleColor(style) {
    this.navTitleColor = style;
    document.querySelector('.pcoded-navbar').classList.remove('title-default');
    document.querySelector('.pcoded-navbar').classList.remove('title-blue');
    document.querySelector('.pcoded-navbar').classList.remove('title-red');
    document.querySelector('.pcoded-navbar').classList.remove('title-purple');
    document.querySelector('.pcoded-navbar').classList.remove('title-info');
    document.querySelector('.pcoded-navbar').classList.remove('title-dark');
    if (style !== 'title-default') {
      document.querySelector('.pcoded-navbar').classList.add(style);
    }
  }

}
