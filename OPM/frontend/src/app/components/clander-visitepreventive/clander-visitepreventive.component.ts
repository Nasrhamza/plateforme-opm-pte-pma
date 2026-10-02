import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/angular';
import Observer from 'src/app/services/observer';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/backend.service';
import localeFrTn from '@angular/common/locales/fr-TN';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { style } from '@angular/animations';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clander-visitepreventive',
  templateUrl: './clander-visitepreventive.component.html',
  styleUrls: ['./clander-visitepreventive.component.scss']
})
export class ClanderVisitepreventiveComponent implements OnInit {
  clanderinfoEvent: any = [];
  infoEvent = { vistStatus: "", id: "", client: "", contractSatus: false, title: "", ticketNumber: "", startDate: "", endDate: "", siteName: "", siteAdres: "", technicienName: "", status: "", typeContract: "", natureContract: "", startDateContract: "", endDateContract: "", SLA: "", responsableContr: "", techRespossable: "", techVisite: "", LEscalade: "" };
  calendarOptions: CalendarOptions;
  user;
  searchQuery: string = '';
  constructor(
    private backendService: BackendService,
    private modalService: NgbModal,
    private authService: AuthService,

  ) { }
  ngOnInit() {
    this.user = this.authService.getAuthUser().user;
    this.getAllEventsForAdmin();
  }

  filterEvents() {
    const filteredEvents = this.clanderinfoEvent
      .filter(event => event.title.toLowerCase().includes(this.searchQuery.toLowerCase()))
      .map(e => ({
        ...e,
        color: this.getEventColor(e), // Reapply color logic
        textColor: e.status === 'Pending' ? '#000' : '#FFFFFF'
      }));

    this.calendarOptions = { ...this.calendarOptions, events: filteredEvents };
  }

  getEventColor(event: any): string {
    if (event.title.startsWith('Infogerance')) {
      return '#17A2B8'; // Cyan for Infogerance
    } else if (event.status === 'Pending') {
      return '#FF9800'; // Yellow for Pending
    } else if (event.status === 'In progress') {
      return '#2196F3'; // Blue for In progress (Fixed extra `#`)
    } else if (event.status === 'Done') {
      return '#4CAF50'; // Green for Done
    }
    return ''; // Default color if none match
  }

  resetSearch() {
    this.searchQuery = '';
    this.calendarOptions.events = [...this.clanderinfoEvent]; // Reset to original events
  }

  async getAllEventsForAdmin() {
    let urlVisiteInfogerance
    let urlVisitePreventive
    let allEvents = [];
    if (this.user.authority === 'admin' || this.user.authority === 'pmo') {
      urlVisitePreventive = '/vistepreventive/getlistvisiteprevForAdmin'
      urlVisiteInfogerance = `/visteInfogerance/getlistvisiteInfogForAdmin`

    } else
      if (this.user.authority === 'client') {
        urlVisitePreventive = `/vistepreventive/getlistvisiteprevForClient/${this.user._id}`
        urlVisiteInfogerance = `/visteInfogerance/getlistvisiteInfogForClient/${this.user._id}`
      } else
        if (this.user.authority === 'technician') {
          urlVisitePreventive = `/vistepreventive/getlistvisiteprevForTech/${this.user._id}`
          urlVisiteInfogerance = `/visteInfogerance/getlistvisiteInfogForTech/${this.user._id}`
        }
        else
          if (this.user.authority === 'commercial') {
            urlVisitePreventive = `/vistepreventive/getlistvisiteprevForCommercial/${this.user._id}`
            urlVisiteInfogerance = `/visteInfogerance/getlistvisiteInfogForCommercial/${this.user._id}`

          }

    await this.backendService.get(`${environment.apiUrl}${urlVisitePreventive}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        const preventiveEvents = response.rows;
        preventiveEvents.forEach(event => {
          event.start = formatDate(event.start, 'yyyy-MM-dd', 'en-US');
          event.end = formatDate(event.end, 'yyyy-MM-dd', 'en-US');
        });
        allEvents = allEvents.concat(preventiveEvents);
        this.backendService.get(`${environment.apiUrl}${urlVisiteInfogerance}`).subscribe(
          new Observer().OBSERVER_GET((response) => {
            const infogeranceEvents = response.rows;
            infogeranceEvents.forEach(event => {
              event.start = formatDate(event.start, 'yyyy-MM-dd', 'en-US');
              event.end = formatDate(event.end, 'yyyy-MM-dd', 'en-US');
            });
            allEvents = allEvents.concat(infogeranceEvents);
            this.clanderinfoEvent = allEvents;
            this.initializeCalendar();
          })
        );
      })
    );
  }

  async getInfoOneVisite(id) {
    await this.backendService.get(`${environment.apiUrl}/vistepreventive/getOneVisitePrevBayId/${id}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.infoEvent.title = response.rows.title;
        this.infoEvent.ticketNumber = response.rows.ticket.number;
        this.infoEvent.startDate = response.rows.startDate;
        this.infoEvent.endDate = response.rows.endDate;
        this.infoEvent.siteName = response.rows.siteID.nomSite;
        this.infoEvent.siteAdres = response.rows.siteID.adress;
        if (response.rows.technicians && response.rows.technicians.length > 0) {
          this.infoEvent.technicienName = response.rows.technicians.map((technician: any) => technician.firstName + ' ' + technician.lastName)
            .join(' + ');
        }
        this.infoEvent.status = response.rows.status;
        this.infoEvent.id = response.rows.contractID.id;
        this.infoEvent.client = response.client;
        this.infoEvent.typeContract = response.rows.contractID.type;
        this.infoEvent.natureContract = response.rows.contractID.nature;
        this.infoEvent.startDateContract = response.rows.contractID.startDate;
        this.infoEvent.endDateContract = response.rows.contractID.endDate;
        this.infoEvent.SLA = response.rows.contractID.SLA;

      })
    );
  }
  async getInfoOneVisiteInfog(id) {
    await this.backendService.get(`${environment.apiUrl}/visteInfogerance/getOneVisiteInfogById/${id}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.infoEvent.title = response.rows.title;
        this.infoEvent.startDate = response.rows.date;
        this.infoEvent.id = response.rows.contractID.id;
        this.infoEvent.ticketNumber = '123--123';
        this.infoEvent.siteName = '123--123';
        this.infoEvent.siteAdres = '123--123';
        this.infoEvent.technicienName = '123--123';
        this.infoEvent.client = response.client;
        this.infoEvent.endDate = response.rows.date;
        this.infoEvent.status = '123--123';
        this.infoEvent.typeContract = response.rows.contractID.type;
        this.infoEvent.natureContract = response.rows.contractID.nature;
        this.infoEvent.startDateContract = response.rows.contractID.startDate;
        this.infoEvent.endDateContract = response.rows.contractID.endDate;

      })
    );
  }
  addCalendarEvent(event) {
    this.clanderinfoEvent.push(event);
    this.initializeCalendar();
  }
  initializeCalendar() {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      events: this.clanderinfoEvent.map(e => ({
        ...e,
        color: this.getEventColor(e),
        textColor: e.status === 'Pending' ? '#000' : '#FFFFFF'
      })),
      eventClick: this.handleEventClick.bind(this)
    };
  }

  handleEventClick(info) {
    const event = info.event;
    const id = event.id;
    const contractNature = event.natureContract;
    this.openMyModal('modal-1');
    if (event._def.title.includes('Infogerance')) {
      this.getInfoOneVisiteInfog(id);
    } else
      this.getInfoOneVisite(id);
  }

  openMyModal(modalID: string) {
    document.querySelector('#' + modalID).classList.add('md-show');
  }

  closeMyModal(event) {
    ((event.target.parentElement.parentElement).parentElement).classList.remove('md-show');
  }
}