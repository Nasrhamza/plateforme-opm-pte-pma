import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { StoreService } from "../../../services/store.service";

@Component({
  selector: 'app-add-files-to-contract',
  templateUrl: './add-files-to-contract.component.html',
  styleUrls: ['./add-files-to-contract.component.scss']
})
export class AddFilesToContractComponent implements OnInit {
  @Input() title;
  @Input() add;
  @Input() _id;

  FilelistsContratSigne: any;
  FilelistsMatriceDescalade: any;
  FilelistsAutre:any;

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    public router: Router,
    private _store : StoreService
    
  ) { }

  ngOnInit() {}

  Onsubmit(f: NgForm) {
    let data = new FormData();
    if (this.FilelistsContratSigne) {
      for (let index = 0; index < this.FilelistsContratSigne.length; index++) {
        data.append("contratSigneFiles", this.FilelistsContratSigne[index]);
      }
    }
    if (this.FilelistsMatriceDescalade) {
      for (let index = 0; index < this.FilelistsMatriceDescalade.length; index++) {
        data.append("matriceDescaladeFiles", this.FilelistsMatriceDescalade[index]);
      }
    }
    if (this.FilelistsAutre) {
      for (let index = 0; index < this.FilelistsAutre.length; index++) {
        data.append("autreFiles", this.FilelistsAutre[index]);
      }
    }
    data.append("_id", this._id);

    this._store.addFileContract(data)
    this.activeModal.close(); 
  }
}
