import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddAndUpdateContractComponent } from '../contractMang/add-and-update-contract/add-and-update-contract.component';
import { ShareFilesComponent } from '../contractMang/share-files/share-files.component';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { AddFilesToContractComponent } from '../contractMang/add-files-to-contract/add-files-to-contract.component';
import { AddUpdateSitesComponent } from '../contractMang/add-update-sites/add-update-sites.component';
import { StoreService } from "../../services/store.service"
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-folder-detailes',
  templateUrl: './folder-detailes.component.html',
  styleUrls: ['./folder-detailes.component.scss']
})
export class FolderDetailesComponent implements OnInit {

  fileurl: string = environment.fileUrl
  id_folder: string;
  folderInfo: any = {}
  openTab: string | null = 'contract';
  openFileTab: string | null = null;
  openSiteTab: string | null = null;
  activeContractVisible;
  activeSiteVisible;
  activeContract: any | null = null;
  activeContract$ = this._store.activeContract$;
  activeSite: any | null = null;
  activeSite$ = this._store.activeSite$;
  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public sahredserv: SharedService,
    private backendService: BackendService,
    public sharedService: SharedService,
    public router: Router,
    private _store: StoreService,
    private authService: AuthService,

  ) { }
  user
  userAuthority
  newListOfFiles: any = [];
  newListContract: any = [];
  newListSites: any = [];
  newAssociatedCustomerList: any = []
  newEquipeTechniquet: any = []
  newplanificationVistePreventive: any = []
  newVisAvis: any = { _id: "", company: "", tel: "", email: "", valid: "", folderId: "" }
  newInfoContract: any = {};
  infoOneSite: any = null;
  responsableEquipeTechnique: any = { nomPrinom: "", _id: "" }
  showDataContract = false;
  showDataSites = false;
  public rowsOnPage = 10;
  public filterQuery = '';
  public sortBy = 'id';
  public sortOrder = 'asc';
  FileMatrisEsqalade: any = {};
  Fileequipement: any = {};

  async ngOnInit() {
    this.user = this.authService.getAuthUser().user;
    this.userAuthority = this.user.authority;
    this.id_folder = this.route.snapshot.paramMap.get('id');
    this.getListContract()
    this.getinfoOfOneFolder()

    this.activeContract$.subscribe(r => { this.activeContract = r })
    this.activeSite$.subscribe(r => this.activeSite = r)
  }
  handleTabOpen(e: any, tab: string) {
    e.preventDefault();
    this.openTab = this.openTab == tab ? null : tab;
    if (tab === 'contract') {
      this.handleFileTabOpen(e, 'files')
      this.handleSiteTabOpen(e, 'site')
    } else {
      this.openFileTab = null;
    }
  }
  handleSiteTabOpen(e: any, tab: string) {
    e.preventDefault();
    this.openSiteTab = this.openSiteTab == tab ? null : tab;
  }
  handleFileTabOpen(e: any, tab: string) {
    e.preventDefault();
    this.openFileTab = this.openFileTab == tab ? null : tab;
  }
  getinfoOfOneFolder() {
    return this.backendService.get(`${environment.apiUrl}/folder/getFolderById/${this.id_folder}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.folderInfo = response.rows;
      })
    );
  }
  getListContract() {
    return this.backendService.get(`${environment.apiUrl}/folder/getContractsByFolderId/${this.id_folder}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        if (this.userAuthority == 'commercial') {
          const userId = this.user._id;
          this.newListContract = response.rows.filter(x => x.commercial === userId);
        } else
          this.newListContract = response.rows;
      })
    );
  }
  downloadFile(fileUrl: string, fileTitle: string, fileName: string): void {
    const fileExtension = fileName.split('.').pop();
    const fullFileName = `${fileTitle}.${fileExtension}`;

    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fullFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
  }

  showInfoSites(item) {
    this.activeContractVisible = false;
    this.activeSiteVisible = true;
    this.showDataSites = true
    this.infoOneSite = item;
    this._store.getSiteById(item._id);
  }

  openAddContract() {
    const modalRef = this.modalService.open(AddAndUpdateContractComponent);
    modalRef.componentInstance.title = 'New contract';
    modalRef.componentInstance.id_folder = this.id_folder;
    modalRef.componentInstance.add = true;
    modalRef.result.then(res => {
      if (res !== null) {
        this.newListContract = [... this.newListContract, res]
      }
    })
  }

  shareFile(fileId: string) {
    const modalRef = this.modalService.open(ShareFilesComponent);
    modalRef.componentInstance.title = 'Share Files';
    modalRef.componentInstance.file = fileId;
    modalRef.componentInstance.clients = this.activeContract.clients;
    // modalRef.result.then(res => {
    //   if (res !== null) {
    //     this.newListContract = [... this.newListContract, res]
    //   }
    // })
  }

  deleteSite(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Site ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id, contractId: this.activeContract._id };
        const apiurl = environment.apiUrl + '/contract/deleteSite';
        this.backendService.post(apiurl, obj).subscribe(
          (res: any) => {
            this.activeContract.listSite = this.activeContract.listSite.filter(x => x._id != res.rows._id)
            Swal.fire({
              title: 'Deleted!',
              text: 'The Site has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }
  FindTypefile(fileName: string): string {
    const index = fileName.lastIndexOf(".");
    if (index !== -1) {
      return fileName.substring(index + 1).toUpperCase();
    }
    return '';
  }
  deleteContract(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this contract ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id, folderId: this.id_folder };
        const aoiurl = environment.apiUrl + '/contract/deleteContract';
        this.backendService.post(aoiurl, obj).subscribe(
          (res: any) => {
            this.newListContract = this.newListContract.filter(x => x._id != res.rows._id)
            Swal.fire({
              title: 'Deleted!',
              text: 'The contract has been deleted successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          }
        );
      }
    });
  }

  showInfoContract(item) {
    this._store.getContractById(item._id);
    this.showDataSites = false;
    console.log(item)
    this.activeSiteVisible = false;
    this.activeContractVisible = true;
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
        this.backendService.post(aoiurl, obj).subscribe(
          (res: any) => {
            const a = {
              ... this._store.activeContractSubject.value,
              listOfFiles: this._store.activeContractSubject.value.listOfFiles.filter(x => x._id != res.rows._id)
            }
            this._store.activeContractSubject.next(a)
            Swal.fire({
              title: 'Deleted!',
              text: 'The File has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }
  openAddSites() {
    if (this.activeContract) {
      const modalRef = this.modalService.open(AddUpdateSitesComponent, { scrollable: true });
      modalRef.componentInstance.title = 'New Site';
      modalRef.componentInstance._id = this.activeContract._id;
      modalRef.componentInstance.add = true;
      modalRef.result.then(res => {
        if (res !== null) {
          this.activeContract.listSite = [...this.activeContract.listSite, res];
        }
      })
    }
    else {
      Swal.fire({
        title: 'warning!',
        text: 'No Contract Selected.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }
  oppenAddFile() {
    if (this.activeContract) {
      const modalRef = this.modalService.open(AddFilesToContractComponent);
      modalRef.componentInstance.title = 'Add files to contract';
      modalRef.componentInstance._id = this.activeContract._id;
      modalRef.componentInstance.add = true;
    }
    else {
      Swal.fire({
        title: 'warning!',
        text: 'No Contract Selected.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  calculateDifferenceInDays(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const diffInTime = date2.getTime() - date1.getTime();
    return Math.round(diffInTime / oneDay);
  }

  convertStringToDate(dateString: string): Date {
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts[0].length === 4) {
        // Format is yyyy-MM-dd
        const [year, month, day] = parts.map(part => parseInt(part, 10));
        return new Date(year, month - 1, day); // month is 0-based
      } else {
        // Format is dd-MM-yyyy
        const [day, month, year] = parts.map(part => parseInt(part, 10));
        return new Date(year, month - 1, day); // month is 0-based
      }
    } else {
      throw new Error("Invalid date format");
    }
  }

  convertArrayToCSV(data: any[]): string {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }


}
