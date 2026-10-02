import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-share-files',
  templateUrl: './share-files.component.html',
  styleUrls: ['./share-files.component.scss']
})
export class ShareFilesComponent implements OnInit {
  fileurl: string = environment.fileUrl
  @Input() title;
  @Input() file;
  @Input() clients: any[] = [];
  model: any = { client: [] };
  user;

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    private authService: AuthService,
    public router: Router,
    private _store: StoreService


  ) { }

  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user;
    if (this.file.listUsers && this.file.listUsers.length > 0) {
      this.model.client = this.file?.listUsers?.map((user) => user)
    }
  }

  Onsubmit(form: NgForm) {

    const data = {
      fileId: this.file._id, // File ID from input
      clients: this.model.client || [] // Selected clients from the form
    };
    this._store.shareFile(data)
    this.activeModal.close();
  }
}
