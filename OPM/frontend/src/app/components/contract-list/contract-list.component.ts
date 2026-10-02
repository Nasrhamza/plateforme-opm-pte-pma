import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddUpdateFoldersComponent } from '../MangFolders/add-update-folders/add-update-folders.component';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { StoreService } from 'src/app/services/store.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss']
})
export class ContractListComponent implements OnInit {
  fileurl: string = environment.fileUrl
  listContract
  term: any;
  folderCount: number = 0;
  page: number = 1;
  user;
  userAuthority;


  constructor(
    public sahredserv: SharedService,
    private backendService: BackendService,
    public sharedService: SharedService,
    public router: Router,
    private modalService: NgbModal,
    public _store: StoreService,
    private authService: AuthService,

  ) { }
  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user;
    this.userAuthority = this.user.authority;
    this.getListFolsers()
  }

  getListFolsers() {
    this.backendService.get(`${environment.apiUrl}/folder/getAllFolders`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        if (this.userAuthority == 'commercial') {
          const userId = this.user._id;
          this.listContract = response.rows.filter(folder => folder.contractId.some(x => x.commercial === userId));
          this.folderCount = this.listContract.length;
        } else
          this.listContract = response.rows;
        this.folderCount = this.listContract.length
      })
    );
  }

  navigateToDetails(item) {
    const id = item._id
    this.router.navigate(['main/test/folderDetailes/detailes', id]);

  }

  openAddFolder() {
    const modalRef = this.modalService.open(AddUpdateFoldersComponent);
    modalRef.componentInstance.title = 'Add new Folder';
    modalRef.componentInstance.add = true;
  }

  openUpdateFolder(item) {
    const modalRef = this.modalService.open(AddUpdateFoldersComponent);
    modalRef.componentInstance.title = 'Update Folder';
    modalRef.componentInstance.add = false;
    modalRef.componentInstance.id_folder = item._id;
    modalRef.componentInstance.name = item.name;
    modalRef.componentInstance.color = item.colorfoldr;
    modalRef.componentInstance.type = item.type;
  }

  deleteFolder(id) {
    let obj = { _id: id };
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this folder ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // const obj = { _id: id, contrcatID: this.newInfoContract._id };
        const aoiurl = environment.apiUrl + '/folder/deleteFolder';
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
  isLightColor(color: string): boolean {
    // Convert hex color to RGB
    const rgb = this.hexToRgb(color);
    if (!rgb) return false;

    // Calculate the perceived brightness using the formula
    // brightness = (R * 299 + G * 587 + B * 114) / 1000
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    // Return true if brightness is greater than 128, else false
    return brightness > 128;
  }

  // Method to convert hex color to RGB
  hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

}
