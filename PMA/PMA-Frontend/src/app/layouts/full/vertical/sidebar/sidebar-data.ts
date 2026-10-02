import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'dashboard',
    route: '/admin/dashboard',
    roles : ['Admin']
  },
  {
    displayName: 'Projects',
    iconName: 'flag',
    route: '/projects',
    roles : ['Admin'],
  },
  {
    displayName: 'Engineers',
    iconName: 'users',
    route: '/admin/engineers',
    roles : ['Admin'],
  },
  {
    displayName: 'Clients',
    iconName: 'users',
    route: '/admin/clients',
    roles : ['Admin'],
  },
  {
    displayName: 'Team leaders',
    iconName: 'users',
    route: '/admin/teamleaders',
    roles : ['Admin'],
  },
  {
    displayName: 'Admins',
    iconName: 'user-cog',
    route: '/admin/admins',
    roles : ['Admin'],
  },
  {
    displayName: 'Signup requests',
    iconName: 'user-check',
    route: '/admin/signup-requests',
    roles : ['Admin'],
  },
  {
    displayName: 'Reclamations clients',
    iconName: 'alert-triangle',
    route: '/admin/reclamations',
    roles : ['Admin'],
  },
  {
    displayName: 'KPIs',
    iconName: 'chart-bar',  
    route: '/admin/kpis',         
    roles: ['Admin']         
  },
  {
    displayName: 'Risks',
    iconName: 'bell',
    route: '/admin/risks',
    roles : ['Admin'],
  },
  {
    displayName: 'Tasks',
    iconName: 'checklist',
    route: '/tasks',
    roles : ['Admin'],
  },
  {
    displayName: 'Proces verbaux',
    iconName: 'file',
    route: '/admin/proces-verbaux',
    roles : ['Admin'],
  },
  {
    displayName: 'Gantt',
    iconName: 'chart-dots',
    route: '/admin/gantt',
    roles : ['Admin'],
  },
  // ------------------------ engineer ---------------------
  {
    displayName: 'Dashboard',
    iconName: 'dashboard',
    route: '/engineer/dashboard',
    roles : ['Engineer'],
  },
  {
    displayName: 'Projects',
    iconName: 'flag',
    route: '/projects',
    roles : ['Engineer'],
  },
  {
    displayName: 'My Team',
    iconName: 'users-group',
    route: '/engineer/team',
    roles : ['Engineer'],
  },
  {
    displayName: 'My Tasks',
    iconName: 'checkbox',
    route: '/tasks',
    roles : ['Engineer'],
  },
  {
    displayName: 'Risks',
    iconName: 'bell',
    route: '/engineer/risks',
    roles : ['Engineer'],
  },
  // ---------------- team leader --------------------
  {
    displayName: 'Dashboard',
    iconName: 'dashboard',
    route: '/leader/dashboard',
    roles : ['Team Leader'],
  },
  {
    displayName: 'Projects',
    iconName: 'flag',
    route: '/projects',
    roles : ['Team Leader'],
  },
  // {
  //   displayName: 'My projects as executor',
  //   iconName: 'flag',
  //   route: '/projects',
  //   roles : ['Team Leader'],
  //   queryParams : { isExecutor : true }
  // },
  {
    displayName: 'Tasks',
    iconName: 'checkbox',
    route: '/tasks',
    roles : ['Team Leader'],
  },
  {
    displayName: 'Risks',
    iconName: 'bell',
    route: '/leader/risks',
    roles : ['Team Leader'],
  },
  {
    displayName: 'Reclamations clients',
    iconName: 'alert-triangle',
    route: '/leader/reclamations',
    roles : ['Team Leader'],
  },
  {
    displayName: 'Proces verbaux',
    iconName: 'file',
    route: '/leader/proces-verbaux',
    roles : ['Team Leader'],
  },
  //----------------------- client ------------------
  {
    displayName: 'Dashboard',
    iconName: 'dashboard',
    route: '/client/dashboard',
    roles : ['Client'],
  },
  {
    displayName: 'My Projects',
    iconName: 'flag',
    route: '/projects',
    roles : ['Client'],
  },
  {
    displayName: 'My Reclamations',
    iconName: 'alert-triangle',
    route: '/client/reclamations',
    roles : ['Client'],
  },

  // ----------------- shared --------------------
  {
    displayName: 'Calendar',
    iconName: 'calendar',
    route: '/calendar',
    roles : ['Admin', 'Team Leader', 'Engineer'],
  },
  {
    displayName: 'Profile',
    iconName: 'user',
    route: '/account',
    roles : ['ALL'],
  },
  // {
  //   displayName: 'Login',
  //   iconName: 'login-2',
  //   route: '/auth/login',
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'key',
  //   route: '/auth/register',
  // },
  // {
  //   navCap: 'Other',
  // },
  // {
  //   displayName: 'Menu Level',
  //   iconName: 'box-multiple',
  //   route: '/menu-level',
  //   children: [
  //     {
  //       displayName: 'Menu 1',
  //       iconName: 'point',
  //       route: '/menu-1',
  //       children: [
  //         {
  //           displayName: 'Menu 1',
  //           iconName: 'point',
  //           route: '/menu-1',
  //         },

  //         {
  //           displayName: 'Menu 2',
  //           iconName: 'point',
  //           route: '/menu-2',
  //         },
  //       ],
  //     },

  //     {
  //       displayName: 'Menu 2',
  //       iconName: 'point',
  //       route: '/menu-2',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Disabled',
  //   iconName: 'ban',
  //   route: '/disabled',
  //   disabled: true,
  // },
  // {
  //   displayName: 'Chip',
  //   iconName: 'mood-smile',
  //   route: '/',
  //   chip: true,
  //   chipClass: 'bg-primary text-white',
  //   chipContent: '9',
  // },
  // {
  //   displayName: 'Outlined',
  //   iconName: 'mood-smile',
  //   route: '/',
  //   chip: true,
  //   chipClass: 'b-1 border-primary text-primary',
  //   chipContent: 'outlined',
  // },
  // {
  //   displayName: 'External Link',
  //   iconName: 'star',
  //   route: 'https://www.google.com/',
  //   external: true,
  // },
];
