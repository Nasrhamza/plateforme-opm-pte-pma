import { Injectable } from '@angular/core';
import { SolutionRequestsService } from '../../../../services/solution-requests.service';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  roles?: []
  badge?: {
    title?: string;
    type?: string;
  };
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}

const navigation = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    url: '/main/sample-page',
    icon: 'feather icon-align-left',
    children: [
      {
        id: 'sample-page',
        title: 'Dashboard',
        type: 'item',
        url: '/main/sample-page',
        classes: 'nav-item',
        icon: 'feather icon-grid',
        roles: ['admin', 'client', 'technician', 'pmo', 'assistant']
      },

      {
        id: 'user-management',
        title: 'User Management',
        type: 'item',
        url: '/main/test/userManagement',
        classes: 'nav-item',
        icon: 'feather icon-users',
        roles: ['admin']
      },
      {
        id: 'listContrct',
        title: 'Client Folders',
        type: 'item',
        url: '/main/test/listContract',
        classes: 'nav-item',
        icon: 'feather icon-folder',
        roles: ['admin', 'commercial', 'pmo', 'assistant'],
        children: [
          {
            id: 'folderDetails',
            title: 'Folder Details',
            type: 'item',
            url: '/main/test/folderDetailes/detailes/:id',
            classes: 'nav-item',
            children: [
              {
                id: 'listTickets',
                title: 'Ticket List',
                type: 'item',
                url: '/main/test/listTickets/detailes/:id',
                classes: 'nav-item',
              }
            ]
          }
        ]
      },

      {
        id: 'ticketsTech',
        title: 'List Tickets',
        type: 'item',
        url: '/main/test/ticketsTech/list-tickets',
        classes: 'nav-item',
        icon: 'feather icon-clipboard',
        roles: ['technician'],
        children: [
          {
            id: 'chat',
            title: 'Ticket Messages',
            type: 'item',
            url: '/main/test/chat/:id',
            classes: 'nav-item',
          }
        ]
      },
      // {
      //   id: 'clientListContract',
      //   title: 'List of customer contracts',
      //   type: 'item',
      //   url: '/main/clientMang/contract-List-Cli',
      //   classes: 'nav-item',
      //   icon: 'feather icon-file-text',
      //   roles: ['client'],
      // },
      {
        id: 'ticketsCustomer',
        title: 'List Tickets',
        type: 'item',
        url: '/main/clientMang/customer-tickets/tiketes-List',
        classes: 'nav-item',
        icon: 'feather icon-clipboard',
        roles: ['client'],
        children: [
          {
            id: 'chat',
            title: 'Ticket Messages',
            type: 'item',
            url: '/main/test/chat/:id',
            classes: 'nav-item',
          }
        ]
      },

      {
        id: 'helpDesk',
        title: 'Helpdesk',
        type: 'collapse',
        icon: 'feather icon-help-circle',
        roles: ['assistant', 'admin', 'pmo'],
        children: [
          {
            id: 'helpDeskTickets',
            title: 'Helpdesk Tickets',
            type: 'item',
            url: '/main/test/helpDesk',
            icon: 'feather icon-clipboard',
            children: [
              {
                id: 'chat',
                title: 'Ticket Messages',
                type: 'item',
                url: '/main/test/chat/:id',
                classes: 'nav-item',
              }
            ]
          },
          {
            id: 'listUsers',
            title: 'User List',
            type: 'item',
            url: '/main/test/helpDesk/list-user',
            icon: 'feather icon-user-plus',
          }
        ]
      },
      {
        id: 'spare',
        title: 'Spare',
        type: 'item',
        url: '/main/test/spare',
        classes: 'nav-item',
        icon: 'feather icon-server',
        roles: ['admin', 'pmo']
      },
      {
        id: 'solutionRequests',
        title: 'Solution Requests',
        type: 'item',
        url: '/main/test/solutionRequests',
        classes: 'nav-item',
        icon: 'feather icon-inbox',
        roles: ['admin', 'pmo'],
        badge: { title: '', type: 'badge-danger' }   // <= badge object already exists
      },

      {
        id: 'listTypeSupport',
        title: 'Type Support',
        type: 'item',
        url: '/main/test/typesupports',
        classes: 'nav-item',
        icon: 'feather icon-server',
        roles: ['admin', 'pmo']
      },
      {
        id: 'CalnderAdmin',
        title: 'Calendar',
        type: 'item',
        url: '/main/test/clanderVisitepreventive',
        classes: 'nav-item',
        icon: 'feather icon-calendar',
        roles: ['admin', 'commercial', 'pmo', 'client', 'technician']
      },
      {
        id: 'Kpis',
        title: 'Kpis',
        type: 'item',
        url: '/main/test/kpis',
        classes: 'nav-item',
        icon: 'feather icon-layers',
        roles: ['admin']
      },
      {
        id: 'knowledgeBase',
        title: 'Knowledge Base',
        type: 'item',
        url: '/main/test/knowledgeBase',
        classes: 'nav-item',
        icon: 'feather icon-layers',
        roles: ['admin', 'technician', 'pmo']
      },
      {
        id: 'Profile',
        title: 'Profile',
        type: 'item',
        url: '/main/test/profile',
        classes: 'nav-item',
        icon: 'feather icon-user',
        roles: ['admin', 'client', 'technician', 'helpdesk', 'commercial', 'pmo', 'assistant']
      }
    ]
  }
];

@Injectable()
export class NavigationItem {
  constructor(private solReqService: SolutionRequestsService) {
    this.solReqService.requestsCount$.subscribe(count => {
      this.updateSolutionsBadge(count);
    });
  }

  get userRole(): string {
    return localStorage.getItem('AUTHORITY') || '';
  }

  get(): any[] {
    return this.filterByRole(navigation, this.userRole);
  }

  private updateSolutionsBadge(count: number) {
    const item = this.findItemById(navigation, 'solutionRequests');
    if (item) {
      item.badge = {
        title: count.toString(),
        type: count > 0 ? 'badge-danger' : 'badge-default'
      };
    }
  }

  private findItemById(items: any[], id: string): any {
    for (let i of items) {
      if (i.id === id) return i;
      if (i.children) {
        const result = this.findItemById(i.children, id);
        if (result) return result;
      }
    }
    return null;
  }

  private filterByRole(items: any[], role: string): any[] {
    return items
      .filter(item => !item.roles || item.roles.includes(role))
      .map(item => {
        const children = item.children ? this.filterByRole(item.children, role) : undefined;
        return { ...item, children };
      });
  }
}
