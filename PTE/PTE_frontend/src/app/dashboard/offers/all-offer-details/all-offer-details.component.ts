import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { InternshipOffer } from 'src/app/core/models/InternshipOffer';
import { User } from 'src/app/core/models/user';
import { InternsService } from 'src/app/core/service/interns.service';
import { QuizService } from 'src/app/core/service/quiz.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { AssignQuizToOfferComponent } from '../assign-quiz-to-offer/assign-quiz-to-offer.component';
import Swal from 'sweetalert2';
import { ResultsService } from 'src/app/core/service/results.service';
import { environment } from 'src/environments/environment.development';
import { SelectedUserResultComponent } from '../selected-user-result/selected-user-result.component';
@Component({
  selector: 'app-all-offer-details',
  templateUrl: './all-offer-details.component.html',
  styleUrls: ['./all-offer-details.component.scss'],
  providers: [ToastrService]   
})
export class AllOfferDetailsComponent {
  readonly picsUrl = environment.PICSURL;
offer!:InternshipOffer
questionForm! : FormGroup
encadrant!:User
routeId !: string
quizzes!:any
quizzID!:string
formVisibility:boolean=false
users!:any[]
userId!:string
hoverQuiz: string | null = null; 
showQuizResult:boolean=false
results:any[]=[]
questionsLength!:string
constructor(
  private router:Router,
  private route:ActivatedRoute,
  private modalService:NgbModal,
  private quizService : QuizService,
  private questionService : QuizService,
  private resultService : ResultsService,
  private userService:UserServiceService,
  private offerService:InternsService,
  private toastr: ToastrService){}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId')!
    this.routeId = this.route.snapshot.paramMap.get('id')!;    
    this.getOfferById()
    this.getquizzsByoffer()
    this.initForm()
  }
  assignQuizModal(id:string){
    const modalRef: NgbModalRef = this.modalService.open(AssignQuizToOfferComponent, {
      keyboard: false ,
      backdropClass:'light-blue-backdrop',
      size: 'lg'
    });
    modalRef.componentInstance.offerId = id
    modalRef.result.then((res)=>{
      this.getquizzsByoffer()
    })
  }
  initForm(){
    this.questionForm = new FormGroup({
      question: new FormControl('', [Validators.required]),
      response1: new FormControl('', [Validators.required]),
      response2: new FormControl('', [Validators.required]),
      response3: new FormControl('', [Validators.required]),
      isCorrect1: new FormControl(''),
      isCorrect2: new FormControl(''),
      isCorrect3: new FormControl('')
  })
  }
  getUserFromPte(id:string){
    this.userService.getUserById(id).subscribe(res=>{
      this.encadrant=res
    });
  }
  getOfferById(){
    this.offerService.getOfferById(this.routeId as string).subscribe(res=>{
      this.offer=res.data
      this.getUserFromPte(this.offer.encadrant as string)
    })
  }
  fillQuiz(quizId:string){
    this.formVisibility=true 
    this.quizzID=quizId
  }
  editQuiz(quiz:any){
    const modalRef: NgbModalRef = this.modalService.open(AssignQuizToOfferComponent, {
      keyboard: false ,
      backdropClass:'light-blue-backdrop',
      size: 'lg'
    });
    modalRef.componentInstance.quiz = quiz
    modalRef.componentInstance.action = "edit"
    modalRef.result.then((res)=>{
      this.getquizzsByoffer()
    })
  }
  deleteQuiz(quizId:string){
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
        Swal.fire({title:'Deleted!',text: 'Quiz has been deleted.',icon:'success',confirmButtonColor: '#47A992',});
        this.quizService.deleteQuiz(quizId).subscribe(res=>{
        this.quizzes = this.quizzes.filter((r:any) => r._id !== quizId);
        this.toastr.success(res.message, 'Success');
      })
  }else if (
    /* Read more about handling dismissals below */
    result.dismiss === Swal.DismissReason.cancel
  ) {
    Swal.fire({
      title:'Cancelled',
      text:'Quiz is safe :)',
      icon:'warning',
      confirmButtonColor: '#47A992',
    }
    )
  }
})
  }
  getquizzsByoffer(){
    this.quizService.getOfferQuiz(this.routeId).subscribe(res=>{
      this.quizzes = res.data
    })
  }
  onSubmitQuestion(questionForm:FormGroup) {
    let responses = []
    responses.push({text:questionForm.value.response1,isCorrect :questionForm.value.isCorrect1})
    responses.push({text:questionForm.value.response2,isCorrect :questionForm.value.isCorrect2})
    responses.push({text:questionForm.value.response3,isCorrect :questionForm.value.isCorrect3})
    let question = {
      quizId : this.quizzID,
      question: questionForm.value.question,
      responses: responses
    }
    this.quizService.createQuestion(question).subscribe((res:any)=>{
      if(res.question){
        this.questionForm.reset()
        this.toastr.success(res.message,"Success")
      }else{
        this.toastr.error(res.message,"Error")
      }
    
    })
    }
getResults(quizId:string) {
  this.resultService.getResultsByQuiz(quizId).subscribe((res:any)=>{
    this.results = res.data
  })
  this.toggleResults(quizId)
}
    toggleResults(quizId:string){
      this.showQuizResult=true
      this.quizService.getQuestionsByQuiz(quizId).subscribe((res:any)=>{
        this.questionsLength = res.data.length
      })
    }

    selectIntern(result:any){
      const modalRef: NgbModalRef = this.modalService.open(SelectedUserResultComponent, {
        ariaLabelledBy:'modal-basic-title',
        size: 'xl',
        keyboard: false ,
        backdropClass: 'light-blue-backdrop'
      });
      modalRef.componentInstance.payload=result
      modalRef.result.then((res)=>{
        this.getResults(result.quizId._id)
      })
    }
}
