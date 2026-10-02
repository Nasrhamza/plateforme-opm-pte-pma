import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { EMPTY, switchMap, take } from 'rxjs';
import { MessageService } from 'src/app/core/services/message.service';
import { EventService } from 'src/app/core/services/event.service';

@Component({
  selector: 'app-add-calendar-event-dialog',
  templateUrl: './add-calendar-event-dialog.component.html',
  styleUrls: ['./add-calendar-event-dialog.component.scss'],
  standalone: true,
  imports: [
    SharedModule
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCalendarEventDialogComponent implements OnInit{

  dialogTitle: string = "Add Event";
  eventForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddCalendarEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private _userEventsService : EventService,
    private _authService : AuthService,
    private _message : MessageService
  ) {}

  initEventForm() {
    this.eventForm = this.formBuilder.group({
      title : ['', Validators.required],
      startDate : [new Date(), Validators.required],
      endDate : [new Date(), Validators.required],
      details : [''],
      color : ['#5d87ff'],
      category : ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.initEventForm();
    if (this.data.action === 'update') {
      this.dialogTitle = "Update Event";
      this.fetchEventById(this.data.data.id);
    } else {
      this.dialogTitle = 'Add Event';
    }
  }

  fetchEventById(id : string){
    this._userEventsService.findById(id).subscribe(
      (res : any)=>{
        this.eventForm.patchValue(res.data!)
      }
    )
  }

  submit(){
    if(this.data.action == 'Add'){
      this._authService.authenticatedUser$.pipe(
        take(1),
        switchMap(user => {
          if(!user) return EMPTY;
          return this._userEventsService.add({ ...this.eventForm.value, user : user.id })
        })
      ).subscribe(
        (res : any) => {
          this.dialogRef.close({ data : res.data, action : 'add' });
          this._message.showSuccessMessage(res.message);
        }
      )
    }else{
      this._userEventsService.update(this.data.data!.id, this.eventForm.value).subscribe(
        (res : any) => {
          this.dialogRef.close({ data : res.data, action : 'update' });
          this._message.showSuccessMessage(res.message);
        }
      )
    }
  }

  handleColorChange(event : any){
    this.eventForm.patchValue({ color : event.target.value })
  }

  get f(){
    return this.eventForm.controls;
  }
}
