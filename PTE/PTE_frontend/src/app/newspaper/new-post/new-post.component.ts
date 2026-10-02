import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { post } from 'src/app/core/models/post';
import { PostServiceService } from 'src/app/core/service/post-service.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss'],
  providers:[ToastrService]

})
export class NewPostComponent {
  postForm!:FormGroup
  images: File[] = [];
  userRole!:string
  // showAttachement:boolean=false

  constructor( public activeModal: NgbActiveModal,
               public postService: PostServiceService,
               private toastr: ToastrService,
               ){}

ngOnInit(){
  this.userRole = localStorage.getItem('roles')!
    this.postForm = new FormGroup({
      description: new FormControl('',[Validators.required , Validators.minLength(5)]),
      switch:new FormControl(false),
      images: new FormControl(),
    })
    // if (this.postForm.value.switch.checked){
    //   this.showAttachement=true;
    // }else{
    //   this.showAttachement=false;
    // }
  } 

onSubmit(postForm:FormGroup){
  const postData= new FormData()
  
    postData.append("description",this.postForm.value.description)
    postData.append("user",localStorage.getItem("userId")!)
    for (var i =0;i<this.images.length;i++) {
      postData.append("images",this.images[i]);
    }
  this.postService.addPost(postData).subscribe(resultat => {
    this.playAudio()
    if (resultat){  
      this.toastr.success('Post uploaded successfully, you have to wait for the admin confirmation' , "Success")
        this.activeModal.close()
    }else{
      this.toastr.error('oops! something went wrong', 'Error');
    }
    })
}
playAudio(){
  let audio = new Audio();
  audio.src = "../../../assets/sound/postSound.wav";
  audio.load();
  audio.play();
}
onSelect(event:any) {
  //console.log(event);
  this.images.push(...event.addedFiles);
}

onRemove(event:any) {
  //console.log(event);
  this.images.splice(this.images.indexOf(event), 1);
}
}
