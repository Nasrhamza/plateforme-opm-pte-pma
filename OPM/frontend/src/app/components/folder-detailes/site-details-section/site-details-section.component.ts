import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AddUpdateSitesComponent } from '../../contractMang/add-update-sites/add-update-sites.component';
import { AddUpdateEquipemontComponent } from '../../contractMang/add-update-equipemont/add-update-equipemont.component';
import { AddUpdateEquipemontSofetComponent } from '../../contractMang/add-update-equipemont-sofet/add-update-equipemont-sofet.component';
import { ImpoertListEquipmentHaredComponent } from '../../contractMang/impoert-list-equipment-hared/impoert-list-equipment-hared.component';
import { ImpoertListEquipmentSoftComponent } from '../../contractMang/impoert-list-equipment-soft/impoert-list-equipment-soft.component';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-site-details-section',
  templateUrl: './site-details-section.component.html',
  styleUrls: ['./site-details-section.component.scss']
})
export class SiteDetailsSectionComponent implements OnInit, OnChanges {

  @Input() selectedSite: any | null = null;
  @Input() selectedContract: any | null = null;
  @Input() folderID: string | null = null;
  @Input() folderInfo = null;
  term: string = '';
  searchTerm: string = '';
  hardEquipmentCollapsed = false;
  softEquipmentCollapsed = false;
  public rowsOnPage = 10;
  public filterQuery = '';
  public sortBy = 'id';
  public sortOrder = 'asc';
  pHard: number = 1;
  pSoft: number = 1;

  user
  userAuthority
  constructor(

    private modalService: NgbModal,
    private backendService: BackendService,
    public sharedService: SharedService,
    public router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user;
    this.userAuthority = this.user.authority;
  }
  onSearchChange() {
    this.pHard = 1;  
    this.cdr.detectChanges();
  }

  set search(value: string) {
    this.term = value;
    this.onSearchChange(); 
  }

  get search(): string {
    return this.term;
  }
  onSoftSearchChange() {
    this.pSoft = 1; 
    this.cdr.detectChanges();
  }
  
  set softSearch(value: string) {
    this.searchTerm = value;
    this.onSoftSearchChange(); 
  }
  
  get softSearch(): string {
    return this.searchTerm;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedSite) {
      this.selectedSite = changes.selectedSite.currentValue;
    }
  }
  openUpdateSites() {
    const modalRef = this.modalService.open(AddUpdateSitesComponent);
    modalRef.componentInstance.title = 'Update Site';
    modalRef.componentInstance.objSites = this.selectedSite;
    modalRef.componentInstance.add = false;
    modalRef.result.then((result) => {
      this.selectedSite = {
        ...this.selectedSite,
        adress: result.result.adress,
        nomSite: result.result.nomSite,
      }
      Swal.fire({
        title: 'Updated!',
        text: 'The site has been updated successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    });
  }
  openAddEquipement() {
    const modalRef = this.modalService.open(AddUpdateEquipemontComponent);
    modalRef.componentInstance.title = 'New Equipment hard';
    modalRef.componentInstance.id_Sites = this.selectedSite._id;
    modalRef.componentInstance.id_contract = this.selectedContract._id;
    modalRef.componentInstance.add = true;
  }
  updateEquipment(item) {
    const modalRef = this.modalService.open(AddUpdateEquipemontComponent);
    modalRef.componentInstance.title = 'Update Equipment ';
    modalRef.componentInstance.equipement = item;
    modalRef.componentInstance.id_contract = this.selectedContract._id;
    modalRef.componentInstance.add = false;
  }
  openAddEquipementSoft() {
    const modalRef = this.modalService.open(AddUpdateEquipemontSofetComponent);
    modalRef.componentInstance.title = 'New Equipment Soft ';
    modalRef.componentInstance.id_Sites = this.selectedSite._id;
    modalRef.componentInstance.id_contract = this.selectedContract._id;
    modalRef.componentInstance.add = true;
  }
  updateEquipmentSoft(item) {
    const modalRef = this.modalService.open(AddUpdateEquipemontSofetComponent);
    modalRef.componentInstance.title = 'Update Equipment ';
    modalRef.componentInstance.equipement = item;
    modalRef.componentInstance.id_contract = this.selectedContract._id;
    modalRef.componentInstance.add = false;
  }
  deleteEquipmentSoft(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Equipment ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id, siteId: this.selectedSite._id };
        const aoiurl = environment.apiUrl + '/equipmentSoft/deleteEquipmentSoft';
        this.backendService.post(aoiurl, obj).subscribe(
          (res: any) => {
            this.selectedSite.listEquipmentSoft = this.selectedSite.listEquipmentSoft.filter(x => x._id != res.rows._id)
            Swal.fire({
              title: 'Deleted!',
              text: 'The Soft Equipment has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },
        );
      }
    });
  }


  deleteEquipment(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Equipment ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id, folderId: this.folderID, siteId: this.selectedSite._id };
        const aoiurl = environment.apiUrl + '/equipment/deleteEquipment';
        this.backendService.post(aoiurl, obj).subscribe(
          (res: any) => {
            this.selectedSite.listEquipment = this.selectedSite.listEquipment.filter(x => x._id != res.rows._id)
            Swal.fire({
              title: 'Deleted!',
              text: 'The Hard Equipment has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },
        );
      }
    });
  }
  importCSVHard(event: any) {
    const modalRef = this.modalService.open(ImpoertListEquipmentHaredComponent);
    modalRef.componentInstance.title = 'Import list of hard equipment';
    modalRef.componentInstance._id = this.selectedSite._id;
    modalRef.componentInstance.add = true;
  }

  importCSVSoft(event: any) {
    const modalRef = this.modalService.open(ImpoertListEquipmentSoftComponent);
    modalRef.componentInstance.title = 'Import list of soft equipment';
    modalRef.componentInstance._id = this.selectedSite._id;
    modalRef.componentInstance.add = true;
  }
  exportToCSVHard() {
    const rows = this.createFullTable(this.selectedSite.listEquipment).querySelectorAll('tr');
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    const headers = ["nomPice", "SN", "TypeSupport", "startDateSupport", "endDateSupport", "valid"];
    csvContent += headers.join(',') + "\r\n"; // Add headers row

    // Process each row
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const rowData = [
          (cells[0] as HTMLElement).innerText, // nomPice
          (cells[1] as HTMLElement).innerText, // SN
          (cells[2] as HTMLElement).innerText, // TypeSupport
          (cells[4] as HTMLElement).innerText, // startDateSupport
          (cells[5] as HTMLElement).innerText, // endDateSupport
          (cells[6] as HTMLElement).innerText  // valid
        ];
        csvContent += rowData.join(',') + "\r\n"; // Add each data row
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `List_of_hard_equipment_${this.selectedSite.nomSite}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPDF() {
    setTimeout(() => {
      const tempTable = this.createFullTable(this.selectedSite.listEquipment);
      const headers = tempTable.querySelectorAll('th');
      if (headers.length > 0) {
        headers[headers.length - 1].remove();
      }

      const rows = tempTable.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          cells[cells.length - 1].remove();
        }
      });

      const style = document.createElement('style');
      style.innerHTML = `
        #tabCollerz.table-hover tbody tr:hover {
          background-color: rgb(138, 188, 226);
        }
        #tabCollerz tbody {
          background-color: rgb(173, 218, 212);
          color: rgb(111, 105, 105);
        }
      `;
      tempTable.appendChild(style);

      const tempDiv = document.createElement('div');
      tempDiv.appendChild(tempTable);
      document.body.appendChild(tempDiv);

      html2canvas(tempTable).then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');

        const marginX = 10;
        const imgWidth = 190; // Page width - 2 * marginX
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const date = new Date().toLocaleDateString();
        pdf.setFontSize(10);
        pdf.setFont('Helvetica', 'regular'); // Set font to normal
        pdf.setTextColor(0, 0, 0); // Black color
        pdf.text('Date: ' + date, marginX, 15); // Adjusted x to marginX and y to 25

        pdf.setFont('Helvetica', 'bold'); // Set font to bold
        pdf.setTextColor(0, 55, 153); // Set color to blue
        pdf.setFontSize(16);
        pdf.text('List of Hard Equipment', 105, 20, { align: 'center' });

        const logo = new Image();
        logo.src = 'assets/logo/logoPrologic.png'; // Update this path as necessary
        logo.onload = () => {
          pdf.addImage(logo, 'PNG', 170, 5, 30, 15); // Positioning logo in the upper-right corner

          const position = 40; // Adjust the position for the table to avoid overlapping with the logo and date
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', marginX, position, imgWidth, imgHeight);

          pdf.save(`List_of_hard_equipment_${this.selectedSite.nomSite}.pdf`);
        };
      }).catch(error => {
        console.error("Error generating PDF:", error);
      });

      document.body.removeChild(tempDiv);
    }, 1000);
  }
  exportToCSVSoft() {
    const tempTable = this.createFullTable2(this.selectedSite.listEquipmentSoft);
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    const headers = ["equipmentName", "version", "constructure", "TypeSupport", "startDateSupport", "endDateSupport", "valid"];
    csvContent += headers.join(',') + "\r\n"; // Add headers row

    // Process each row
    const rows = tempTable.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const rowData = [
          (cells[0] as HTMLElement).innerText, // equipmentName
          (cells[1] as HTMLElement).innerText, // version
          (cells[2] as HTMLElement).innerText, // constructure
          (cells[3] as HTMLElement).innerText, // startDateSupport
          (cells[5] as HTMLElement).innerText, // endDateSuppt
          (cells[6] as HTMLElement).innerText,
          (cells[7] as HTMLElement).innerText,
          (cells[8] as HTMLElement).innerText
        ];
        csvContent += rowData.join(',') + "\r\n"; // Add each data row
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `List_of_soft_equipment_${this.selectedSite.nomSite}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  exportToPDF2() {
    setTimeout(() => {
      const tempTable = this.createFullTable2(this.selectedSite.listEquipmentSoft);

      const headers = tempTable.querySelectorAll('th');
      if (headers.length > 0) {
        headers[headers.length - 1].remove();
      }

      const rows = tempTable.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          cells[cells.length - 1].remove();
        }
      });

      const style = document.createElement('style');
      style.innerHTML = `
        #tabColler10.table-hover tbody tr:hover {
          background-color: rgb(138, 188, 226);
        }
        #tabColler10 tbody {
          background-color: rgb(173, 218, 212);
          color: rgb(111, 105, 105);
        }
      `;
      tempTable.appendChild(style);

      const tempDiv = document.createElement('div');
      tempDiv.appendChild(tempTable);
      document.body.appendChild(tempDiv);

      html2canvas(tempTable).then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');

        const marginX = 10;
        const imgWidth = 190; // Page width - 2 * marginX
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const date = new Date().toLocaleDateString();
        pdf.setFontSize(10);
        pdf.setFont('Helvetica', 'regular'); // Set font to normal
        pdf.setTextColor(0, 0, 0); // Black color
        pdf.text('Date: ' + date, marginX, 15); // Position for date

        pdf.setFont('Helvetica', 'bold'); // Set font to bold
        pdf.setTextColor(0, 55, 153); // Set color to blue
        pdf.setFontSize(16);
        pdf.text('List of Soft Equipment', 105, 20, { align: 'center' });

        const logo = new Image();
        logo.src = 'assets/logo/logoPrologic.png'; // Update this path as necessary
        logo.onload = () => {
          pdf.addImage(logo, 'PNG', 170, 5, 30, 15); // Positioning logo in the upper-right corner

          const position = 40; // Adjust position for the table
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', marginX, position, imgWidth, imgHeight);

          pdf.save(`list_of_soft_equipment_${this.selectedSite.nomSite}.pdf`);
        };
      }).catch(error => {
        console.error("Error generating PDF:", error);
      });

      document.body.removeChild(tempDiv);
    }, 1000);
  }

  getDaysSupportStyle(endDateSupport: string): string {
    const daysLeft = this.getNbrJour(endDateSupport);
    if (daysLeft < 0) return 'style="background-color: #847A7A; color: white;"';
    if (daysLeft >= 30 && daysLeft < 60) return 'style="background-color:#FFC107; color: black;"';
    if (daysLeft >= 0 && daysLeft < 30) return 'style="background-color: #DC3545; color: white;"';
    return 'style="color: black;"';
  }
  getNbrJour(endDateSupport: string): number {
    const endDate = new Date(endDateSupport);
    const currentDate = new Date();
    const diffTime = endDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }


  createFullTable2(data: any[]): HTMLElement {
    const table = document.createElement('table');
    table.setAttribute('style', 'text-align: center;');
    table.setAttribute('class', 'table table-striped table-bordered nowrap table-hover');

    const thead = document.createElement('thead');
    thead.setAttribute('class', 'task-page');
    thead.setAttribute('style', 'background-color: rgb(58, 114, 179);');

    const headerRow = document.createElement('tr');
    const headers = ['Equipment Name', 'Version', 'Constructure', 'Support type', 'Days left for support', 'Start Date Support', 'End Date Support', 'Status', 'Action'];
    headers.forEach(header => {
      const th = document.createElement('th');
      th.innerText = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement('tbody');

    data.forEach(item => {
      const daysLeft = this.getNbrJour(item.endDateSupport);
      const daysLeftText = daysLeft < 0 ? 'End of Support' : `${daysLeft} Days`;
      const row = document.createElement('tr');
      row.innerHTML = `
      <td class="text-center">${item.equipmentName}</td>
      <td class="text-center">${item.version}</td>
      <td class="text-center">${item.constructure}</td>
      <td class="text-center">${item.TypeSupport.supportName}</td>
      <td class="text-center" ${this.getDaysSupportStyle(item.endDateSupport)}>${daysLeftText}</td>
      <td class="text-center">${item.startDateSupport}</td>
      <td class="text-center">${item.endDateSupport}</td>
      <td class="text-center">${item.valid ? 'Active' : 'Inactive'}</td>
      <td class="text-center">
        <i (click)="updateEquipment Soft(${item})" class="fas fa-edit f-18 ml-2"></i>
        <i (click)="deleteEquipmentSoft(${item._id})" class="fas fa-trash-alt f-18 ml-2"></i>
      </td>
    `;
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
  }
  createFullTable(data: any[]): HTMLElement {
    const table = document.createElement('table');
    table.setAttribute('style', 'text-align: center;');
    table.setAttribute('class', 'table table-striped table-bordered nowrap table-hover');

    const thead = document.createElement('thead');
    thead.setAttribute('class', 'task-page');
    thead.setAttribute('style', 'background-color: rgb(58, 114, 179);');

    const headerRow = document.createElement('tr');
    const headers = ['Equipment Name', 'Serial Number', 'Support Type', 'Days left for support', 'Start Date Support', 'End Date Support', 'Status', 'Action'];
    headers.forEach(header => {
      const th = document.createElement('th');
      th.innerText = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement('tbody');

    data.forEach(item => {
      const daysLeft = this.getNbrJour(item.endDateSupport);
      const daysLeftText = daysLeft < 0 ? 'End of Support' : `${daysLeft} Days`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="text-center">${item.nomPice}</td>
        <td class="text-center">${item.SN}</td>
        <td class="text-center">${item.TypeSupport.supportName}</td>
        <td class="text-center" ${this.getDaysSupportStyle(item.endDateSupport)}>${daysLeftText}</td>
        <td class="text-center">${item.startDateSupport}</td>
        <td class="text-center">${item.endDateSupport}</td>
        <td class="text-center">${item.valid ? 'Active' : 'Inactive'}</td>
        <td class="text-center">
          <i (click)="updateEquipment(${item})" class="fas fa-edit f-18 ml-2"></i>
          <i (click)="deleteEquipment(${item._id})" class="fas fa-trash-alt f-18 ml-2"></i>
        </td>
      `;
      tbody.appendChild(row);
    });


    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
  }
}
