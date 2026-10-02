import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { QuizService } from 'src/app/core/service/quiz.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-assign-quiz-to-offer',
  templateUrl: './assign-quiz-to-offer.component.html',
  styleUrls: ['./assign-quiz-to-offer.component.scss'],
  providers: [ToastrService]  
})
export class AssignQuizToOfferComponent {
  @Input('offerId') offerId! : string
  @Input('quiz') quiz! : any
  @Input('action') action! : string
  quizForm! : FormGroup
  questionForm! : FormGroup
  userId!: string
  user!:User
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private quizService : QuizService,
    private userService:UserServiceService,
    private toastr: ToastrService) {}

    ngOnInit(): void {
      this.userId = localStorage.getItem('userId')!
      this.getEncadrant()
      this.initFormQuiz()
      this.setValues()
    }
    getEncadrant(){
      this.userService.getUserById(this.userId as string).subscribe(res=>{
        this.user = res
      })
    }
    setValues(){
      if(this.action==='edit'){
        this.quizForm.patchValue({
          title: this.quiz.title,
          description: this.quiz.description,
        });
      }
    }
    initFormQuiz(){
        this.quizForm = new FormGroup({
          title: new FormControl('', [Validators.required]),
          description: new FormControl('', [Validators.required]),
        })
    }
    

    onSubmitQuiz(quizForm:FormGroup){  
      const quiz = {
        title : quizForm.value.title,
        description : quizForm.value.description,
        createdBy: this.user._id,
        offer : this.offerId
      }
      if(this.action==="edit"){
        this.quizService.updateQuiz(this.quiz._id, quiz).subscribe(res=>{
          if(res.data){
            this.toastr.success('Quiz updated successfully')
            this.activeModal.close('close')
          }else{
            this.toastr.error('Error while updating quiz')
          }
        })
      }else{
        this.quizService.createQuiz(quiz).subscribe(res=>{
          if(res.data){
            this.quizForm.reset();
            this.toastr.success('Quiz added successfully.' , "Success")
            this.activeModal.close('Offer added successfully');
          }else{
            this.toastr.error('Failed to add quiz.' , "Error")
          }
        })
      }
    }
    onSubmitQuestion(questionForm:FormGroup){    }
    addQuiz(){    }
    addResponse(){    }
}
