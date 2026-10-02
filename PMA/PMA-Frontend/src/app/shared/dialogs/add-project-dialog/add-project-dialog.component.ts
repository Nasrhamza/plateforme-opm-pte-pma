import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from 'src/app/core/services/users.service';
import { User } from 'src/app/core/models/user.model';
import { ProjectService } from 'src/app/core/services/project.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-add-project-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './add-project-dialog.component.html',
  styleUrl: './add-project-dialog.component.scss'
})
export class AddProjectDialogComponent {

  constructor(
    private _user : UserService,
    private _projectService : ProjectService,
    private _fb : FormBuilder,
    private _message : MessageService,
    public dialogRef: MatDialogRef<AddProjectDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  form : FormGroup;
  selectedImagePreview : any;
  userImage : any;
  alignhide = true;
  engineers : User[] = [];
  teamLeaders : User[] = [];
  clients : User[] = [];
  suggestedClients :{ saved : User[], unsaved : any[] } = {saved : [], unsaved : []};
  fromMail = false;
  mailText : string = '';
  mailClient = "";
  selectedClient : User;
  imagesUrl = environment.userImagesUrl;
  projectTypes : string[] = [
    'Systems Infrastructure',
    'Network Infrastructure',
    'Systems and Network Infrastructure',
    'Development',
    'Cyber Security',
    'Lab'
  ];
  loading = false;

  fetchTeamLeaders(){
    this._user.findAll({ roles : ['Team Leader'] }).subscribe(
      res=>{
        this.teamLeaders = res.data!.users!;
      }
    )
  }

  handleSavedClientSelect(client : User){
    this.selectedClient = client;
    this.form.patchValue({
      client : client._id
    })
  }

  handleBtnClick(){
    this.fromMail = !this.fromMail;
    this.mailText = "";
    this.form.reset();
  }
  
  fetchEngineers(){
    this._user.findAll({ roles : ['Engineer'] }).subscribe(
      res=>{
        this.engineers = res.data!.users!;
      }
    )
  }

  fetchClients(){
    this._user.findAll({ roles : ['Client'] }).subscribe(
      res=>{
        this.clients = res.data!.users!;
      }
    )
  }

  ngOnInit(): void {
    this.fetchEngineers();
    this.fetchTeamLeaders();
    this.fetchClients();

    this.form = this._fb.group({
      Projectname : ['', Validators.required],
      type : ['', Validators.required],
      priority : ['', Validators.required],
      client : ['', Validators.required],
      dateDebut : ['', [Validators.required]],
      dateFin : ['', [Validators.required]],
      equipe : ['', [Validators.required, Validators.minLength(1)]],
      TeamLeader : ['', Validators.required],
      description : [''],
    })
    if(this.data.action == 'update'){
      this._projectService.findById(this.data._id).subscribe(
        res => {
          this.form.patchValue({ 
            Projectname : res.data!.Projectname, 
            type : res.data!.type,
            priority : res.data!.priority,
            client : res.data!.client._id,
            dateDebut: res.data!.dateDebut,
            dateFin : res.data!.dateFin,
            equipe : res.data!.equipe.map(e => e._id),
            TeamLeader : res.data!.TeamLeader._id,
            description : res.data!.description
          });
        }
      );
    }    
  }

  get f(){
    return this.form.controls;
  }

  handleProjectDraftReception(draft : any){
    this.fromMail = !this.fromMail;
    let type = this.projectTypes.find(t => t.includes(draft.type));
    this.mailClient = draft.client;
    this.form.patchValue({ 
      Projectname : draft.Projectname, 
      type : type,
      priority : draft.priority,
      dateDebut: draft.dateDebut,
      dateFin : draft.dateFin,
      equipe : draft.equipe != null ? draft.equipe.map((e : any) => e._id) : null,
      TeamLeader : draft.TeamLeader != null ? draft.TeamLeader._id : null,
      description : draft.description
    });
    this.suggestedClients.saved = draft.internalClients;
    this.suggestedClients.unsaved = draft.externalClients;
  }


  submit(){
    if(this.fromMail){
      this.loading = true;

      if(this.mailText.trim().length == 0) {
        this._message.showErrorMessage('Please add text');
        return;
      }
      this._projectService.generateProjectFromText(this.mailText).subscribe(
        {
          next : res => {
            this.loading = false;

            this.handleProjectDraftReception(res.data);
          }
        }
      );
      return;
    }
    if(!this.form.valid) {
      this._message.showErrorMessage('Please provide all fields');
      return;
    }
    this.loading = true;
    if(this.data.action === 'Add'){
      this._projectService.addProject(this.form.value).subscribe(
        {
          next : res => {
            this.dialogRef.close({ data : res.data, action :'add' })
            this._message.showSuccessMessage(res.message);
            this.loading = false;
          },
          error : (err)=>{
            this.loading = false;
          }
        }
        
      )
    }else{
      this._projectService.updateProject(this.data._id, this.form.value).subscribe(
        {
          next : res => {
            this.dialogRef.close({ data : res.data, action :'update' })
            this._message.showSuccessMessage(res.message);
            this.loading = false;
          },
          error : (err)=>{
            this.loading = false;
          }
        }
      )
    }
  }
}
