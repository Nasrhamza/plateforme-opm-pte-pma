import { Component, Input, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { NavigationItem } from '../../../layout/admin/navigation/navigation';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @Input() type: string;

  public navigation: any;
  breadcrumbList: Array<any> = [];
  public navigationList: Array<any> = [];
  storedParams: { [key: string]: string } = {}; // Store params like 'id'

  constructor(private _router: Router, public nav: NavigationItem, private titleService: Title) {
    this.navigation = this.nav.get();
    this.type = 'theme2';
  }

  ngOnInit() {
    // Save scroll position before navigating away
    this._router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      const currentUrl = this.getRouteWithoutId(this._router.url);
      const scrollPosition = window.scrollY || window.pageYOffset;
      sessionStorage.setItem('scrollPosition_' + currentUrl, scrollPosition.toString());
    });

    // Restore scroll position after navigation
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const routerUrl = this._router.url;
      if (routerUrl) {
        this.filterNavigation(routerUrl);
      }

      setTimeout(() => {
        const cleanUrl = this.getRouteWithoutId(routerUrl);
        const savedPosition = sessionStorage.getItem('scrollPosition_' + cleanUrl);
        if (savedPosition !== null) {
          this.smoothScrollTo(parseInt(savedPosition, 10));
        }
      }, 300); // Small delay ensures content is loaded before scrolling
    });
  }

  goBack() {
    // Save current scroll position before navigating back
    const scrollPosition = window.scrollY || window.pageYOffset;
    const currentUrl = this.getRouteWithoutId(this._router.url);
    sessionStorage.setItem('scrollPosition_' + currentUrl, scrollPosition.toString());

    if (window.history.length > 1) {
      window.history.back();
    } else {
      this._router.navigate(['/']); // Navigate to a fallback page if no history
    }
  }

  filterNavigation(activeLink: string) {
    let result: any[] = [];
    let title = 'Welcome';

    const findBreadcrumbs = (navigation: any[], url: string) => {
      for (const item of navigation) {
        if (item.type === 'item' && item.url && this.isMatchingUrl(item.url, url)) {
          const updatedUrl = this.replaceRouteParams(item.url, activeLink);
          result = [{ url: updatedUrl, title: item.title, breadcrumbs: item.breadcrumbs !== false }];
          title = item.title;
          return true;
        }
        if (item.children) {
          for (const child of item.children) {
            if (findBreadcrumbs([child], url)) {
              const updatedUrl = this.replaceRouteParams(item.url, activeLink);
              result.unshift({ url: updatedUrl, title: item.title, breadcrumbs: item.breadcrumbs !== false });
              return true;
            }
          }
        }
      }
      return false;
    };

    findBreadcrumbs(this.navigation, activeLink);

    this.navigationList = result;
    this.titleService.setTitle(title + ' | OPM');
  }

  replaceRouteParams(url: string, activeLink: string): string {
    if (!url) return '';

    const activeSegments = activeLink.split('/');
    const urlSegments = url.split('/');

    urlSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.substring(1);
        const paramValue = activeSegments[index] || this.storedParams[paramName]; // Use stored value if missing
        this.storedParams[paramName] = paramValue; // Save for later use
      }
    });

    return urlSegments.map((segment) => (segment.startsWith(':') ? this.storedParams[segment.substring(1)] : segment)).join('/');
  }

  isMatchingUrl(routeUrl: string, activeLink: string): boolean {
    const segments = routeUrl.split('/');
    const activeSegments = activeLink.split('/');
    if (segments.length !== activeSegments.length) {
      return false;
    }
    return segments.every((segment, index) => {
      return segment.startsWith(':') || segment === activeSegments[index];
    });
  }

  getRouteWithoutId(url: string): string {
    return url.replace(/\/[a-f0-9]{24}$/, ''); // Normalize URL by removing 24-char MongoDB-like IDs
  }

  /**
   * Smoothly scrolls to the target position with an easing effect.
   * @param targetY The target Y position to scroll to.
   * @param duration The duration of the animation (default: 500ms).
   */
  smoothScrollTo(targetY: number, duration = 500) {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    let startTime: number | null = null;

    function step(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuad = progress * (2 - progress); // Easing function for smooth effect

      window.scrollTo(0, startY + distance * easeOutQuad);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }
}
