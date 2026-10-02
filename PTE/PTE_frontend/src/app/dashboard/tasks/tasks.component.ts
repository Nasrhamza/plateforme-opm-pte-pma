import { Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AddTaskComponent } from './add-task/add-task.component';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from 'src/app/core/service/task.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { InternsService } from 'src/app/core/service/interns.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  providers: [ToastrService]
})
export class TasksComponent {
  readonly picsUrl = environment.INTERN_IMAGE_URL;

  offerID!: string
  tasks: any[] = []
  offerPicked: any
  selectedTask:any
  showTaskDetails:boolean = false
  currentUserId!: string
  constructor(  
    private modalService:NgbModal,
    private taskService:TaskService,
    private internsService:InternsService,
    private route: ActivatedRoute,
    private toastr: ToastrService,) { }
  ngOnInit():void {
    this.currentUserId=localStorage.getItem('userId')!
    this.offerID = this.route.snapshot.paramMap.get('id')!
    this.getOfferTasks()
    this.getOffer()
  }
  getOffer(){
    this.internsService.getOfferById(this.offerID).subscribe(res=>{
      this.offerPicked = res.data;
    })
  }
  addTask(object:any,action:string){
    const modalRef: NgbModalRef = this.modalService.open(AddTaskComponent, {
          ariaLabelledBy:'modal-basic-title',
          size: 'lg',
          keyboard: false ,
          backdropClass:'light-blue-backdrop'
        });
        modalRef.componentInstance.offerID=this.offerID
        
        if(action === 'edit'){
          modalRef.componentInstance.payload = {object,action}
        }else{
          modalRef.componentInstance.payload={action}
        }
        modalRef.result.then((res)=>{
          this.getOfferTasks()
        })
  }
  getOfferTasks(){
    this.taskService.getOfferTasks(this.offerID).subscribe(res=>{
      this.tasks = res.data
    })
  }
  selectTask(task:any){
    this.showTaskDetails = true
    this.taskService.getTaskById(task._id).subscribe(res=>{
      this.selectedTask=res.data
    })
  }
  deleteTask(id:string){
     const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: false
        })
    
        swalWithBootstrapButtons.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel!',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({title:'Deleted!',text: 'Offer has been deleted.',icon:'success',confirmButtonColor: '#47A992',});
            this.taskService.deleteTask(id).subscribe(res=>{
            this.tasks = this.tasks.filter(r => r._id !== id);
            this.toastr.success(res.message, 'Success');
          })
      }else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire({
          title:'Cancelled',
          text:'Task is safe :)',
          icon:'warning',
          confirmButtonColor: '#47A992',
        }
        )
      }
    })
  }
}
