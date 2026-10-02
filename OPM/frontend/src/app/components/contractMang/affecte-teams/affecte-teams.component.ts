import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-affecte-teams',
  templateUrl: './affecte-teams.component.html',
  styleUrls: ['./affecte-teams.component.scss']
})
export class AffecteTeamsComponent implements OnInit {
  fileurl: string = environment.fileUrl

  @Input() title: string;
  @Input() contractID: string;
  @Input() add: boolean;
  @Input() objectUsers: any;
  @Output() callback = new EventEmitter<any>();
  model: any = {};
  selectedType: string = ''; // Stores the selected type ("technician" or "commercial")
  dynamicList: any[] = []; // Stores the list of either technicians or commercials
  listtechAffecte: string[] = []; // List of already assigned technicians
  nivauxEscalade: any; // Escalation levels

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private _store: StoreService,
    private backendService: BackendService,
    public router: Router
  ) { }

  ngOnInit(): void {
    if (this.add) {
      this.model = {};
    } else {
      this.model.selectedPerson = this.objectUsers.id_tech;
      this.model.role = this.objectUsers.role;
      this.model.isTeamLeader = this.objectUsers.isTeamLeader; // Ensure it exists when not adding

    }
  }

  onTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedType = selectedValue;

    if (selectedValue === 'technician') {
      this.getListTech();
    } else if (selectedValue === 'commercial') {
      this.getListCommercial();
    }
  }

  getListTech(): void {
    this.backendService.get(`${environment.apiUrl}/tech/getAllEmployeesByContract/${this.contractID}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.dynamicList = response.rows.map(tech => ({
          ...tech,
          fullName: `${tech.firstName} ${tech.lastName}`,
          imageUrl: tech.image.fileName
        }));
      })
    );
  }

  getListCommercial(): void {
    this.backendService.get(`${environment.apiUrl}/user/getListCommercial/`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.dynamicList = response.rows.map(commercial => ({
          ...commercial,
          fullName: `${commercial.firstName} ${commercial.lastName}`,
          imageUrl: commercial.image.fileName
        }));
      })
    );
  }

  getValiousTypeAccount(event: Event): void {
    this.model.role = (event.target as HTMLSelectElement).value;
  }

  Onsubmit(f: NgForm): void {
    if (this.add) {
      this._store.addTeam(f.value);
      this.activeModal.close();
    }
  }


}
