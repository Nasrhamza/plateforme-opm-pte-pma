import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { AddUpdateSupportComponent } from '../support/add-update-support/add-update-support.component';



@Component({
  selector: 'app-typesupports',
  templateUrl: './typesupports.component.html',
  styleUrls: ['./typesupports.component.scss']
})
export class TypesupportsComponent implements OnInit {
  public newTodoCard: any;
  searchTerm: string = '';
  listTypeSupport: any = [];
  page: number = 1;

  constructor(
    public sahredserv: SharedService,
    private backendService: BackendService,
    public sharedService: SharedService,
    public router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.getListTypeSupport();

  }
  clearAllTodoCardTask() {
    const cardTodoList = document.querySelectorAll('#task-list li');
    for (let i = 0; i < cardTodoList.length; i++) {
      cardTodoList[i].remove();
    }
    this.newTodoCard = '';
  }

  openAddTypeSupport() {
    const modalRef = this.modalService.open(AddUpdateSupportComponent);
    modalRef.componentInstance.title = 'New Support Type';
    modalRef.componentInstance.add = true;
  }
  openUpdateTypeSupport(item) {
    const modalRef = this.modalService.open(AddUpdateSupportComponent);
    modalRef.componentInstance.title = 'Update Support Type';
    modalRef.componentInstance.objectReceved = item;
    modalRef.componentInstance.add = false;
  }
  opendelleteTypeSupport(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Support Type ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id };
        const aoiurl = environment.apiUrl + '/typeSupport/deleteTypeSupport';
        this.backendService.post(aoiurl, obj).subscribe(new Observer(
          this.router, // just un class dans angular
          null, // 
          true, // relode
          true, // sweet alert
          this.sharedService, // oblegtour si ona reload
        ).OBSERVER_POST());
      }
    });
  }
  getImagePath(imagePath: string): string {
    return `${environment.apiUrl}/uploads/${imagePath}`;
  }
  getListTypeSupport() {
    this.backendService.get(`${environment.apiUrl}/typeSupport/getAllTypeSupport`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listTypeSupport = response.rows;
      })
    );
  }
}
