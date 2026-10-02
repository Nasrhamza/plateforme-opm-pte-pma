import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  // Array to store breadcrumb states with URLs and their IDs
  breadcrumbs: { title: string, url: string }[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.updateBreadcrumb(currentUrl);
    });
  }

  // Add or update breadcrumb
  updateBreadcrumb(url: string) {
    const existing = this.breadcrumbs.find(bc => bc.url === url);
    
    if (!existing) {
      // Extract route title and parameters manually here if needed
      this.breadcrumbs.push({ title: this.getTitleFromUrl(url), url });
    }
  }

  // Use this method to restore the previous breadcrumb URL
  getBreadcrumbs(): { title: string, url: string }[] {
    return [...this.breadcrumbs];
  }

  // A helper to extract or generate a title from the URL
  getTitleFromUrl(url: string): string {
    if (url.includes('folderDetailes')) {
      return 'Folder Details';
    }
    if (url.includes('listTickets')) {
      return 'Ticket List';
    }
    // Add more cases if needed
    return 'Page';
  }

  // Clear breadcrumbs if necessary (e.g., on logout or reset)
  clearBreadcrumbs() {
    this.breadcrumbs = [];
  }
}
