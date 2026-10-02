import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TaskService } from 'src/app/core/service/task.service';
import { Task } from 'src/app/core/models/Task';
import { ResultsService } from 'src/app/core/service/results.service';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss'],
  providers: [ToastrService]
})
export class AddTaskComponent {
  @Input('offerID') offerID!: string
  @Input('payload') payload!: any
  taskForm!: FormGroup
  selectedResults: any[] = []
  offerApplicants: any[] = []
  constructor(
    public activeModal: NgbActiveModal,
    private taskService:TaskService,
    private resultService:ResultsService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.initForm()
    this.getOfferApplicants()
    if(this.payload.action == 'add'){
      this.initForm()
    }else{
      if(this.payload.object.assignedTo == null){
        this.patchFormWithoutExecutor()
      }else{
        this.patchForm()
      }
    }
    
  }
  initForm() {
    this.taskForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      priority: new FormControl('', [Validators.required]),
      assignedTo: new FormControl(),
    })
    }
    patchForm(){
      this.taskForm.patchValue({
        title: this.payload.object.title,
        description: this.payload.object.description,
        startDate: this.payload.object.startDate,
        endDate: this.payload.object.endDate,
        priority: this.payload.object.priority,
        assignedTo: this.payload.object.assignedTo._id,
      })
    }
    patchFormWithoutExecutor(){
      this.taskForm.patchValue({
        title: this.payload.object.title,
        description: this.payload.object.description,
        startDate: this.payload.object.startDate,
        endDate: this.payload.object.endDate,
        priority: this.payload.object.priority,
      })
    }

 
  getOfferApplicants(){
    this.resultService.getAllSelectedInterns().subscribe(res=>{
      this.selectedResults=res.data
      this.selectedResults.forEach(item=> {
        if(item.quizId.offer === this.offerID){
          this.offerApplicants.push(item.userId)
        }
      })
    })
  }
  onSubmit(taskForm: FormGroup) {
    let task
      if(taskForm.value.assignedTo===""){
        task ={
          title: taskForm.value.title,
          description: taskForm.value.description,
          startDate: taskForm.value.startDate,
          endDate: taskForm.value.endDate,
          priority: taskForm.value.priority,
          internshipOffer : this.offerID,
        }
      }else{
          task ={
            title: taskForm.value.title,
            description: taskForm.value.description,
            startDate: taskForm.value.startDate,
            endDate: taskForm.value.endDate,
            priority: taskForm.value.priority,
            assignedTo: taskForm.value.assignedTo,
            internshipOffer : this.offerID,
          }
        }
    if(this.payload.action == 'edit'){
      this.taskService.editTask(this.payload.object._id, task).subscribe(res=>{
        if(res.data){
          this.toastr.success('Task updated successfully')
          this.activeModal.close('close')
        }else{
          this.toastr.error('Error while updating task')
        }
      })
    }else{
      this.taskService.createTask(task).subscribe(res=>{
        if(res.data){
          this.toastr.success("Task created successfully!","Success")
          this.activeModal.close(true)
        }else{
          this.toastr.error("Failed to create task!","Error")
        }
      })
    }
    
  }
}
