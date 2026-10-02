import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { BackendService } from 'src/app/services/backend.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';  // Ensure this is imported

import Observer from 'src/app/services/observer';
import { AddCustomerManagementComponent } from '../../contractMang/add-customer-management/add-customer-management.component';
import { AffecteTeamsComponent } from '../../contractMang/affecte-teams/affecte-teams.component';
import { AjouterEtmodifierVisiteComponent } from '../../MangFolders/ajouter-etmodifier-visite/ajouter-etmodifier-visite.component';
import { CustomerAddAffectComponent } from '../../contractMang/customer-add-affect/customer-add-affect.component';
import { StoreService } from 'src/app/services/store.service';
import { AddAndUpdateContractComponent } from '../../contractMang/add-and-update-contract/add-and-update-contract.component';
import { AddUpdateHealthcheckComponent } from '../../contractMang/add-update-healthcheck/add-update-healthcheck.component';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-details-section',
  templateUrl: './details-section.component.html',
  styleUrls: ['./details-section.component.scss']
})
export class DetailsSectionComponent implements OnInit, OnChanges {
  fileurl: string = environment.fileUrl
  @Input() selectedContract: any | null = null;
  @Input() folderID: string | null = null;
  @Input() folderInfo = null;
  searchCustomer: string = '';
  tech: string = '';
  searchText: string = '';
  equipeTechnique: any[] = [];
  teamManagementCollapsed = false;
  healthCheckCollapsed = false;
  customerManagementCollapsed = false;
  preventiveMaintVisiteCollapsed = false;
  page: number = 1;
  pagetech: number = 1;
  pageCustomer: number = 1;
  pHealth: number = 1;
  user
  userAuthority
  constructor(

    private modalService: NgbModal,
    private route: ActivatedRoute,
    private backendService: BackendService,
    public sharedService: SharedService,
    public router: Router,
    private _store: StoreService,
    private authService: AuthService,

  ) { }

  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user;
    this.userAuthority = this.user.authority;
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedContract) {
      this.selectedContract = changes.selectedContract.currentValue;
    }
  }

  exportToPDFHealthCheck() {

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = 'Health Check Report';
    const titleX = (pageWidth - doc.getTextWidth(title)) / 2;
    const currentDate = "Date: " + new Date().toLocaleDateString();
    const dateX = pageWidth - doc.getTextWidth(currentDate) + 5;
    const head = [['Designation', 'Model', 'SN', 'Affectation', 'Emplacement', 'Adresse IP', 'Ressources', 'Observation']];
    const body = this.selectedContract.healthChecklist.map(item => [
      item.designation,
      item.model,
      item.SN,
      item.affectation,
      item.emplacement,
      item.adresseIP,
      item.resources,
      item.observation
    ]);
    doc.text(title, titleX, 10);
    doc.setFontSize(8);

    doc.text(currentDate, dateX, 5);

    autoTable(doc, {
      head: head,
      body: body,
      startY: 20,
      margin: { left: 1, right: 1 },
      styles: {
        fontSize: 7
      },
      headStyles: {
        halign: 'center',
        cellWidth: 'wrap',
        fillColor: [41, 128, 185],
      },
      bodyStyles: {
        halign: 'center',
      },
      columnStyles: {
        2: { cellWidth: 15 }, // Affectation
        5: { cellWidth: 20 }, // Affectation
      }
    });
    doc.save('health-check-report.pdf');
  }

  openUpdateContract() {
    const modalRef = this.modalService.open(AddAndUpdateContractComponent);
    modalRef.componentInstance.title = 'Update contract';
    modalRef.componentInstance.objectContract = this.selectedContract;
    modalRef.componentInstance.id_folder = this.folderID;
    modalRef.componentInstance.add = false;
  }
  deleteResponsableEquipe() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this Technical Team Manager?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this._store.deleteRespInContract();
        Swal.fire({
          title: 'Deleted!',
          text: 'The Technical Team Manager has been deleted.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    });
  }
  deleteMemeberEquipe(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: "You want to delete this Team Member?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this._store.deleteTechInContract(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'The Team Member has been deleted.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    });
  }
  openAddNewOledCustomers() {
    const modalRef = this.modalService.open(CustomerAddAffectComponent);
    modalRef.componentInstance.id_contract = this.selectedContract._id;
    modalRef.componentInstance.id_folder = this.folderID;
    modalRef.componentInstance.companyName = this.folderInfo.name;
    if (
      this.selectedContract.clients &&
      this.selectedContract.clients.some((client) => client.role === 'clientManager')
    ) {
      modalRef.componentInstance.mangerAddet = true;
    } else {
      modalRef.componentInstance.mangerAddet = false;
    }
  }
  openUpdatUsers(item) {
    const obj = item
    const modalRef = this.modalService.open(AddCustomerManagementComponent);
    modalRef.componentInstance.title = 'Update Customer ';
    modalRef.componentInstance.objCustomer = obj;
    modalRef.componentInstance.add = false;
  }
  deleteUserContract(id) {
    let obj = { _id: id, contrcatID: this.selectedContract._id };
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this User?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const aoiurl = environment.apiUrl + '/contract/deleteUserfromContract';
        this.backendService.post(aoiurl, obj).subscribe(
          res => {
            this.selectedContract.clients = this.selectedContract.clients.filter(x => x._id != id);
            Swal.fire({
              title: 'Deleted!',
              text: 'The Customer User has been successfully deleted from the contract.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },
        );
      }
    });
  }

  deleteVisaAvisContract() {
    let obj = {
      _id: this.selectedContract.visAvis._id,
      contractID: this.selectedContract._id
    };
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this Contract manager?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const aoiurl = environment.apiUrl + '/contract/deleteVisaAvisContract';
        this.backendService.post(aoiurl, obj).subscribe(
          res => {
            this.selectedContract.visAvis = null;
            Swal.fire({
              title: 'Deleted!',
              text: 'The Contract Manager has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },
        );
      }
    });
  }

  deleteFile(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this file ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id };
        const aoiurl = environment.apiUrl + '/files/deleteFile';
        this.backendService.post(aoiurl, obj).subscribe(new Observer(
          this.router, 
          null, 
          true, 
          true, 
          this.sharedService, 
        ).OBSERVER_POST());
      }
    });
  }

  goToTickets() {
    this.router.navigate(['main/test/listTickets/detailes', this.selectedContract._id])
  }

  addtemsToContract() {
    const modalRef = this.modalService.open(AffecteTeamsComponent);
    modalRef.componentInstance.title = 'Team Management';
    modalRef.componentInstance.contractID = this.selectedContract._id;
    modalRef.componentInstance.add = true;

  }

  openAddVistepreventive() {
    const modalRef = this.modalService.open(AjouterEtmodifierVisiteComponent);
    modalRef.componentInstance.mytitle = 'New Preventive Visit Planning';
    modalRef.componentInstance.add = true;
    modalRef.componentInstance.id_folder = this.folderID;
    modalRef.componentInstance.id_contract = this.selectedContract._id;
  }
  openUpdateVisite(item) {
    let obj = item;
    const modalRef = this.modalService.open(AjouterEtmodifierVisiteComponent);
    modalRef.componentInstance.mytitle = 'Update Preventive Visit Planning';
    modalRef.componentInstance.add = false;
    modalRef.componentInstance.id_folder = this.folderID;
    modalRef.componentInstance.id_contract = this.selectedContract._id;
    modalRef.componentInstance.obj = obj
  }
  openAddHealthCheck() {
    const modalRef = this.modalService.open(AddUpdateHealthcheckComponent);
    modalRef.componentInstance.title = 'Health Check';
    modalRef.componentInstance.add = true;
    modalRef.componentInstance.id_contract = this.selectedContract._id;
  }
  updateHealthCheck(item) {
    let obj = item;
    const modalRef = this.modalService.open(AddUpdateHealthcheckComponent);
    modalRef.componentInstance.title = 'Update Health Check ';
    modalRef.componentInstance.obj = obj;
    modalRef.componentInstance.add = false;
  }

  deleteVisite(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Preventive maintenance visit ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id };
        const aoiurl = environment.apiUrl + '/contract/deleteVisitePrev';
        this.backendService.post(aoiurl, obj).subscribe(
          res => {
            this.selectedContract.Vistepreventive = this.selectedContract.Vistepreventive.filter(x => x._id != id)
            Swal.fire({
              title: 'Deleted!',
              text: 'The Preventive visit has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          })
      }
    });
  }
  deleteHealthCheck(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Health Check ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id };
        const aoiurl = environment.apiUrl + '/healthCheck/deleteHealthCheck';
        this.backendService.post(aoiurl, obj).subscribe(
          res => {
            this.selectedContract.healthChecklist = this.selectedContract.healthChecklist.filter(x => x._id != id)
            Swal.fire({
              title: 'Deleted!',
              text: 'The Health Check has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          })
      }
    });
  }


}
