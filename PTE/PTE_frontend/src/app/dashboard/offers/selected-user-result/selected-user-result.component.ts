import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { QuizService } from 'src/app/core/service/quiz.service';
import { ResultsService } from 'src/app/core/service/results.service';
import { environment } from 'src/environments/environment.development';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-selected-user-result',
  templateUrl: './selected-user-result.component.html',
  styleUrls: ['./selected-user-result.component.scss'],
  providers: [ToastrService]   

})
export class SelectedUserResultComponent {
  @Input('payload') payload!: any
  readonly picsUrl = environment.INTERN_IMAGE_URL;
  questionsLength!:string
  questions!:any

  constructor(
    public activeModal: NgbActiveModal,
    private quizService : QuizService,
    private resultService : ResultsService,
    private toastr: ToastrService

  ) {}
  ngOnInit(): void {
    this.getQuestions()
  }
  getQuestions(){
    this.quizService.getQuestionsByQuiz(this.payload.quizId._id).subscribe((res:any)=>{
      this.questions = res.data
      this.questionsLength = res.data.length
    })
  }


  selectIntern(){
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
        confirmButtonText: 'Yes, select it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({title:'Select Intern!',text: 'Intern has been select.',icon:'success',confirmButtonColor: '#47A992',});
          this.resultService.selectIntern(this.payload._id).subscribe(res=>{
            this.toastr.success(res.message,"Success")
            this.activeModal.close('User selected successfully!');
          })
    }else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      Swal.fire({
        title:'Cancelled',
        text:'intern result is safe :)',
        icon:'warning',
        confirmButtonColor: '#47A992',
      }
      )
    }
  })
  }
}
