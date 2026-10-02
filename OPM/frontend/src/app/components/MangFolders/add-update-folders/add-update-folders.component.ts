import { formatDate } from '@angular/common';
import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-update-folders',
  templateUrl: './add-update-folders.component.html',
  styleUrls: ['./add-update-folders.component.scss']
})
export class AddUpdateFoldersComponent implements OnInit {
  @Input() title;
  @Input() id_folder;
  @Input() add;
  @Input() name;
  @Input() color;
  @Input() type;
  model: any = { name: "" }
  public showColorCode = '#db968d';
  FileLogo: any

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router

  ) { }

  ngOnInit() {
    if (this.add) {
      this.model = {}
    } else {
      this.model.name = this.name
      this.showColorCode = this.color
    }
  }
  Onsubmit(f: NgForm) {
    const data = new FormData();
    data.append("name", f.value.name);
    data.append("colorfoldr", this.showColorCode);

    if (this.FileLogo) {
      data.append("files", this.FileLogo);
    }
    if (this.add) {
      this.backendService
        .post(`${environment.apiUrl}/folder/createFolder`, data)
        .subscribe(new Observer(
          this.router,
          null,
          true,
          true,
          this.sharedService,
          this.activeModal
        ).OBSERVER_POST());
    } else {
      data.append("_id", this.id_folder);
      this.backendService
        .put(`${environment.apiUrl}/folder/updateFolder`, data)
        .subscribe(new Observer(
          this.router,
          null,
          true,
          true,
          this.sharedService,
          this.activeModal
        ).OBSERVER_PUT());
    }
  }

  onColorChange(event) {
    this.showColorCode = event
  }

  updateFileName(event: any) {
    this.FileLogo = event.target.files[0]
    const fileName = event.target.files[0].name;
    const fileLabel = document.getElementById('fileInputLabel');
    if (fileLabel) {
      fileLabel.textContent = fileName;
    }
  }
}
