import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexLegend,
  ApexFill,
  ApexPlotOptions,
  ApexResponsive,
} from 'ng-apexcharts';
import { PostServiceService } from 'src/app/core/service/post-service.service';
import { RoomServiceService } from 'src/app/core/service/room-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';
import { EventInfoModalComponent } from '../vehicle/event-info-modal/event-info-modal.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventInfoRoomModalComponent } from '../room/event-info-room-modal/event-info-room-modal.component';
import { EventInfoTechModalComponent } from '../technician/event-info-tech-modal/event-info-tech-modal.component';
import { LabServiceService } from 'src/app/core/service/lab-service.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LeaveServiceService } from 'src/app/core/service/leave-service.service';
import { User } from 'src/app/core/models/user';
import { ResultsService } from 'src/app/core/service/results.service';
import { InternsService } from 'src/app/core/service/interns.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
};
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  public lineChartOptions!: Partial<ChartOptions>;
  public barChartOptions!: Partial<ChartOptions>;
  public stackBarChart!: Partial<ChartOptions>;
  users: any[] = [];
  user!: any
  userRoles: string = ''
  userCount!: number
  vehicleCount!: number
  roomCount!: number
  postCount!: number

  posts!: any
  approvedCount!: number
  declinedCount!: number
  pendingCount!: number

  MyApprovedPostsCount!: number
  MyDeclinedPostsCount!: number
  MyPendingPostsCount!: number
  MyActiveLabs!: number

  leaves!: any
  MyLeave!: number
  MyPendingLeave!: number
  MyAcceptedLeave!: number

  allLeaves!: any
  allLeave!: number
  allPendingLeave!: number
  allAcceptedLeave!: number


  labs!: any
  MyLabs!: number
  MyPendingLabs!: number
  MyAcceptedLabs!: number

  allSelectedInterns!:number
  allInternshipOffers!:number
  allInternshipLabs!:number

  labRequestCount!: number
  activeLabs: any[] = [];

  isCollapsedCalendar = false;
  isCollapsedLabs = true;

  rows: any[] = [];
  temp: any[] = [];
  timeout: any;
  expanded: any = {};
  loadingIndicator = true;
  reorderable = true;
  @ViewChild('table') table!: DatatableComponent;
  scrollBarHorizontal = window.innerWidth < 1200;
  userEvents: any[] = [];
  vehicleEvents: any[] = [];
  roomEvents: any[] = [];
  userTempEvents: any[] = [];
  vehicleTempEvents: any[] = [];
  roomTempEvents: any[] = [];
  calendarEvents!: EventInput[];
  selectedOption: string = 'vehicle';
  filterItems: string[] = [
    'Vehicle',
    'Room',
    'Technician',
  ];
  public filters = [
    { name: 'Vehicle', value: 'Vehicle', checked: false },
    { name: 'Room', value: 'Room', checked: false },
    { name: 'Technician', value: 'Technician', checked: false },

  ];


  constructor(
    private userService: UserServiceService,
    private vehicleService: VehicleServiceService,
    private roomService: RoomServiceService,
    private postService: PostServiceService,
    private modalService: NgbModal,
    private labService: LabServiceService,
    private leaveService: LeaveServiceService,
    private resultService: ResultsService,
    private internService: InternsService
  ) {
    this.userCount = 0
    this.vehicleCount = 0
    this.roomCount = 0
    this.postCount = 0
    this.MyLeave = 0
    this.MyPendingLeave = 0
    this.MyAcceptedLeave = 0
    this.labRequestCount = 0
    this.MyLabs = 0
    this.MyPendingLabs = 0
    this.MyAcceptedLabs = 0
    this.MyApprovedPostsCount = 0
    this.MyDeclinedPostsCount = 0
    this.MyPendingPostsCount = 0
    this.MyActiveLabs = 0
    this.allLeave = 0
    this.allPendingLeave = 0
    this.allAcceptedLeave = 0
    this.approvedCount = 0
    this.declinedCount = 0
    this.pendingCount = 0
    this.allSelectedInterns = 0
    this.allInternshipOffers = 0
    this.allInternshipLabs = 0
  }

  ngOnInit() {
    this.userRoles = localStorage.getItem('roles')!
    // this.chart1();
    // this.chart2();
    // this.chart3();
    this.postService.getMyApprovedPosts(localStorage.getItem('userId')!).subscribe(res => {
      this.MyApprovedPostsCount = res.length
    })
    this.postService.getMyDeclinededPosts(localStorage.getItem('userId')!).subscribe(res => {
      this.MyDeclinedPostsCount = res.length
    })
    this.postService.getMyPendingPosts(localStorage.getItem('userId')!).subscribe(res => {
      this.MyPendingPostsCount = res.length
    })
    if (localStorage.getItem('roles') === "LAB-MANAGER") {
      this.labService.getAllLabsRequests().subscribe(res => {
        this.labRequestCount = res.length
        this.labs = res

        for (let i = 0; i < this.labs.length; i++) {
          if (this.labs[i].status === "Active") {
            this.MyAcceptedLabs++
          } else if (this.labs[i].status === "Pending") {
            this.MyPendingLabs++
          }
        }
      })
    } else {
      this.labService.userLabRequests(localStorage.getItem('userId')!).subscribe(res => {
        this.labRequestCount = res.length
        this.labs = res
        for (let i = 0; i < this.labs.length; i++) {
          if (this.labs[i].status === "Active") {
            this.MyAcceptedLabs++
          } else if (this.labs[i].status === "Pending") {
            this.MyPendingLabs++
          }
        }
      })
    }


    this.leaveService.getUserLeave(localStorage.getItem('userId')!).subscribe(res => {
      this.MyLeave = res.length
    })
    this.userService.getEmployees().subscribe(res => {
      this.userCount = res.length
      this.users = res
    })
    this.userService.getUserById(localStorage.getItem('userId')!).subscribe(res => {
      this.user = res as User
    })
    this.vehicleService.getVehicles().subscribe(res => {
      this.vehicleCount = res.length
    })
    this.roomService.getRooms().subscribe(res => {
      this.roomCount = res.length
    })
    this.postService.getAllstat().subscribe(res => {
      this.postCount = res.length
      this.posts = res
      for (let i = 0; i < this.posts.length; i++) {
        if (this.posts[i].status === "Approved") {
          this.approvedCount++
        } else if (this.posts[i].status === "Pending") {
          this.pendingCount++
        } else if (this.posts[i].status === "Declined") {
          this.declinedCount++
        }
      }
    })


    if (localStorage.getItem('roles') !== "ADMIN") {
      this.leaveService.getUserLeave(localStorage.getItem('userId')!).subscribe(res => {
        this.leaves = res
        this.MyLeave = res.length
        for (let i = 0; i < this.leaves.length; i++) {
          if (this.leaves[i].status === "Approved") {
            this.MyAcceptedLeave++
          } else if (this.leaves[i].status === "Pending 1/2" || this.leaves[i].status === "Pending 0/2") {
            this.MyPendingLeave++
          }
        }
      })
    } else {
      this.leaveService.getAllLeaves().subscribe(res => {
        this.allLeaves = res
        this.allLeave = res.length
        for (let i = 0; i < this.allLeaves.length; i++) {
          if (this.allLeaves[i].status === "Approved") {
            this.allAcceptedLeave++
          } else if (this.allLeaves[i].status === "Pending 1/2" || this.allLeaves[i].status === "Pending 0/2") {
            this.allPendingLeave++
          }
        }
      })
    }

    this.getVehiclesEvents()
    this.getActiveLabs()
    this.getAllSelectedInterns()
    this.getAllinternshipOffers()
    this.getAllInternLabs()
  }


  getAllSelectedInterns(){
    this.resultService.getAllSelectedInterns().subscribe(res=>{
      this.allSelectedInterns = res.data.length
    })
  }
  getAllinternshipOffers(){
    this.internService.getOffers().subscribe(res=>{
      this.allInternshipOffers = res.data.length
    })
  }
  getAllInternLabs(){
    this.labService.getAllInternLabs().subscribe(res=>{
      this.allInternshipLabs = res.data.length
    })
  }



  getActiveLabs() {
    this.labService.getActiveLabs().subscribe(res => {
      this.rows = res
      this.rows.reverse()
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    })
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  onPage(event: any) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
    }, 100);
  }

  getRowHeight(row: any) {
    return row.height;
  }
  toggleExpandRow(row: any) {
    //console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event: any) {
    // console.log('Detail Toggled', event);
  }
  changeCalendar() {
    if (this.selectedOption == 'vehicle') {
      this.getVehiclesEvents()
    } else if (this.selectedOption == 'room') {
      this.getRoomsEvents()
    } else if (this.selectedOption == 'technician') {
      this.getUserEvents()
    }
  }
  changeCategory(event: any, filter: any) {
    if (event.target.checked) {
      this.filterItems.push(filter.name);
    } else {
      this.filterItems.splice(this.filterItems.indexOf(filter.name), 1);
    }
    this.filterEvent(this.filterItems);
  }
  filterEvent(element: any) {
    const list = this.calendarEvents.filter((x) =>
      element.map((y: any) => y).includes(x.groupId)
    );
    this.calendarOptions.events = list;
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    initialView: "dayGridMonth",
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventContent: (arg) => {
      return { html: `<b>${arg.event._def.extendedProps['applicant'].firstName+" "+arg.event._def.extendedProps['applicant'].lastName}</b>` };
    },
    // select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    // eventsSet: this.handleEvents.bind(this),
    //events:[]
  };
  handleEventClick(clickInfo: EventClickArg) {
    this.eventClick(clickInfo);
  }
  eventClick(row: any) {
    if (this.selectedOption == 'vehicle') {
      const modalRef: NgbModalRef = this.modalService.open(EventInfoModalComponent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        keyboard: false,
        backdropClass: 'light-blue-backdrop'
      });
      modalRef.componentInstance.payload = row.event.id;
    }
    else if (this.selectedOption == 'room') {
      const modalRef: NgbModalRef = this.modalService.open(EventInfoRoomModalComponent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        keyboard: false,
        backdropClass: 'light-blue-backdrop'
      });
      modalRef.componentInstance.payload = row.event.id;
    } else if (this.selectedOption == 'technician') {
      const modalRef: NgbModalRef = this.modalService.open(EventInfoTechModalComponent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        keyboard: false,
        backdropClass: 'light-blue-backdrop'
      });
      modalRef.componentInstance.payload = row.event.id;
    }
  }
  getUserEvents() {
    this.userService.getAllEvents().subscribe(resultat => {
      this.userEvents = resultat as any
      // console.log("fhisdhiovgsduiohfviodhivopho",this.userEvents)
      this.userEvents.forEach(event => {
        let techEvents = {
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.end,
          engineer: event.engineer,
          applicant: event.applicant,
          classNames: ['fc-event-primary']
        }
        this.userTempEvents.push(techEvents);
      })
      this.calendarOptions.events = this.userTempEvents
      this.userEvents = this.userTempEvents
      this.userTempEvents = []

    })
  }
  getRoomsEvents() {
    this.roomService.getAllEvents().subscribe(resultat => {
      this.roomEvents = resultat as any
      this.roomEvents.forEach(event => {
        let roomEvents = {
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.end,
          room: event.room,
          applicant: event.applicant,
          classNames: ['fc-event-success']
        }
        this.roomTempEvents.push(roomEvents);
      })
      this.calendarOptions.events = this.roomTempEvents
      this.roomEvents = this.roomTempEvents
      this.roomTempEvents = []

    })
  }
  getVehiclesEvents() {
    this.vehicleService.getAllEvents().subscribe(resultat => {
      this.vehicleEvents = resultat as any
      this.vehicleEvents.forEach(event => {
        let vehicleEvents = {
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.end,
          vehicle: event.vehicle,
          driver: event.driver,
          applicant: event.applicant,
          destination: event.destination,
          classNames: ['fc-event-warning']
        }
        this.vehicleTempEvents.push(vehicleEvents);
      })
      this.calendarOptions.events = this.vehicleTempEvents
      this.vehicleEvents = this.vehicleTempEvents
      this.vehicleTempEvents = []

    })
  }
  // private chart1() {
  //   this.lineChartOptions = {
  //     series: [
  //       {
  //         name: 'Data 1',
  //         data: [80, 250, 30, 120, 260, 100, 180, 2, 20, 5, 50, 60],
  //       },
  //       {
  //         name: 'Data 2',
  //         data: [85, 130, 85, 225, 80, 190, 120, 2, 20, 5, 50, 60],
  //       },
  //     ],
  //     chart: {
  //       height: 350,
  //       type: 'line',
  //       foreColor: '#9aa0ac',
  //       dropShadow: {
  //         enabled: true,
  //         color: '#000',
  //         top: 18,
  //         left: 7,
  //         blur: 10,
  //         opacity: 0.2,
  //       },
  //       toolbar: {
  //         show: false,
  //       },
  //     },
  //     colors: ['#6777EF', '#8B8697'],
  //     stroke: {
  //       curve: 'smooth',
  //     },
  //     grid: {
  //       row: {
  //         colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
  //         opacity: 0.5,
  //       },
  //       borderColor: '#9aa0ac',
  //     },
  //     fill: {
  //       type: 'gradient',
  //       gradient: {
  //         gradientToColors: ['#54CA68', '#EF447C'],
  //         stops: [0, 50, 65, 91],
  //       },
  //     },
  //     markers: {
  //       size: 3,
  //     },
  //     xaxis: {
  //       categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sept','Oct', 'Nov','Dec'],
  //     },
  //     yaxis: {
  //       // opposite: true,
  //     },
  //     legend: {
  //       position: 'top',
  //       horizontalAlign: 'right',
  //       floating: true,
  //       offsetY: -25,
  //       offsetX: -5,
  //     },
  //     tooltip: {
  //       theme: 'dark',
  //       marker: {
  //         show: true,
  //       },
  //       x: {
  //         show: true,
  //       },
  //     },
  //   };
  // }
  // private chart2() {
  //   this.barChartOptions = {
  //     series: [
  //       {
  //         name: 'Males',
  //         data: [2.4, 4.65, 2.88, 2.9, 3.9, 2.2, 3, 4.1, 3.9, 3],
  //       },
  //       {
  //         name: 'Females',
  //         data: [-3.8, -3.18, -2.4, -3.7, -3.96, -2.3, -3.1, -4, -4.1, -2.8],
  //       },
  //     ],
  //     chart: {
  //       type: 'bar',
  //       height: 350,
  //       stacked: true,
  //       toolbar: {
  //         show: false,
  //       },
  //       foreColor: '#9aa0ac',
  //     },
  //     colors: ['#6236AF', '#F02769'],
  //     plotOptions: {
  //       bar: {
  //         horizontal: false,
  //         barHeight: '80%',
  //         columnWidth: '30%',
  //         borderRadius: 5,
  //       },
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     stroke: {
  //       width: 1,
  //       colors: ['#fff'],
  //     },

  //     grid: {
  //       xaxis: {
  //         lines: {
  //           show: false,
  //         },
  //       },
  //       borderColor: '#9aa0ac',
  //     },
  //     yaxis: {
  //       min: -5,
  //       max: 5,
  //       title: {
  //         // text: 'Age',
  //       },
  //     },
  //     tooltip: {
  //       shared: false,
  //       theme: 'dark',
  //       x: {
  //         formatter: function (val) {
  //           return val.toString();
  //         },
  //       },
  //       y: {
  //         formatter: function (val) {
  //           return val.toString() + '%';
  //         },
  //       },
  //     },
  //     xaxis: {
  //       categories: [
  //         '90+',
  //         '80-89',
  //         '70-79',
  //         '60-69',
  //         '50-59',
  //         '40-49',
  //         '30-39',
  //         '20-29',
  //         '10-19',
  //         '0-9',
  //       ],
  //       title: {
  //         text: 'Percent',
  //       },
  //       labels: {
  //         formatter: function (val) {
  //           return Math.abs(Math.round(parseInt(val, 10))) + '%';
  //         },
  //       },
  //     },
  //   };
  // }

  // private chart3() {
  //   this.stackBarChart = {
  //     series: [
  //       {
  //         name: 'Data 1',
  //         data: [44, 55, 41, 67, 22, 43],
  //       },
  //       {
  //         name: 'Data 2',
  //         data: [13, 23, 20, 8, 13, 27],
  //       },
  //       {
  //         name: 'Data 3',
  //         data: [11, 17, 15, 15, 21, 14],
  //       },
  //       {
  //         name: 'Data 4',
  //         data: [21, 7, 25, 13, 22, 8],
  //       },
  //     ],
  //     chart: {
  //       type: 'bar',
  //       height: 310,
  //       foreColor: '#9aa0ac',
  //       stacked: true,
  //       toolbar: {
  //         show: false,
  //       },
  //     },
  //     responsive: [
  //       {
  //         breakpoint: 480,
  //         options: {
  //           legend: {
  //             position: 'bottom',
  //             offsetX: -10,
  //             offsetY: 0,
  //           },
  //         },
  //       },
  //     ],
  //     plotOptions: {
  //       bar: {
  //         horizontal: false,
  //         columnWidth: '20%',
  //       },
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     grid: {
  //       borderColor: '#9aa0ac',
  //     },
  //     xaxis: {
  //       type: 'category',
  //       categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  //     },
  //     legend: {
  //       show: false,
  //     },
  //     fill: {
  //       opacity: 1,
  //       colors: ['#F0457D', '#704DAD', '#FFC107', '#a5a5a5'],
  //     },
  //   };
  // }
}
