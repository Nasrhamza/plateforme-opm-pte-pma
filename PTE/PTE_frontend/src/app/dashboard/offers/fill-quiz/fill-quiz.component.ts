import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { QuizService } from 'src/app/core/service/quiz.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-fill-quiz',
  templateUrl: './fill-quiz.component.html',
  styleUrls: ['./fill-quiz.component.scss'],
  providers: [ToastrService]
})
export class FillQuizComponent {
  questionForm! : FormGroup
  userId!: string
  user!:User

  constructor(
    private formBuilder: FormBuilder,
    private quizService : QuizService,
    private userService:UserServiceService,
    private toastr: ToastrService
  ){
    this.questionForm = this.formBuilder.group({
      questions: this.formBuilder.array([]) // Initialize FormArray for questions
    });
  }
  ngOnInit():void{ 
    this.initForm()
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

  onSubmitQuestion(questionForm:FormGroup) {
  }
}
