import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PostServiceService } from 'src/app/core/service/post-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-comments',
  templateUrl: './all-comments.component.html',
  styleUrls: ['./all-comments.component.scss'],
  providers: [ToastrService],

})
export class AllCommentsComponent {
  readonly picsUrl = environment.PICSURL;

@Input() post!: any
comment! : any
comments: any[] = [];
reversedComments: any[] = [];
showOldComment: boolean = true
userID:string = ''
userImage:string = ''
constructor( 
  private userService:UserServiceService,
  private postService:PostServiceService,
  private toastr: ToastrService,
  ){}
ngOnInit(): void {
  // console.log(this.post)
  this.userImage = localStorage.getItem('image')!
  this.userID = localStorage.getItem('userId')!
  this.getAllPostComments()
}
getAllPostComments(){
  this.postService.getAllComments(this.post._id).subscribe(resultat =>{
    this.comments=resultat
    this.reversedComments=[]
    for (let i= this.comments.length-1; i >= 0 ; i--) {
      this.reversedComments.push(this.comments[i])
    }
  })

}
submtComment(comment:any){
  if (!comment.value){
    this.toastr.warning('Comment field is empty' , "Warning")
  }else{
    const newComment={
      text:comment.value,
      post:this.post._id,
      user:localStorage.getItem("userId")
    }
    this.postService.addComment(this.post._id,newComment).subscribe(resultat=>{
      if(!resultat){
        this.toastr.error("Something went wrong!","Error")
      }else{
        this.playAudio();
        this.toastr.success("Comment uploaded successfully","Success")
        comment.value=""
        this.comments=[]
        this.getAllPostComments();
        
      }
    })
  }
}

editComment(id:string,newComment:any,cancel:any,edit:any,action:any){
  const comment = this.comments.find(comment => {
    return comment._id == id
  })
  newComment.style.display = "block"
  newComment.value =comment.text
  cancel.style.display="inline-block"
  edit.style.display="inline-block"
  action.style.display="none"
}

cancelChanges(newComment:any,cancel:any,edit:any,action:any){
  cancel.style.display="none"
  edit.style.display="none"
  newComment.style.display = "none"
  action.style.display="inline-block"
}
sendChanges(id:string,newComment:any,cancel:any,edit:any,action:any){
  this.postService.updateComment(this.post._id,id,newComment.value).subscribe(res=>{
  })
  this.playAudio();
  cancel.style.display="none"
  edit.style.display="none"
  newComment.style.display = "none"
  action.style.display="inline-block"
  this.toastr.success("Comment updated successfully", "Success");
  setTimeout(()=>{
    this.getAllPostComments()
  },500 )
  
}
playAudio(){
  let audio = new Audio();
  audio.src = "../../../assets/sound/commentSound.mp3";
  audio.load();
  audio.play();
}
deleteComment(id:string){
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
      swalWithBootstrapButtons.fire(
        'Deleted!',
        'Your comment has been deleted.',
        'success'
      )
      this.postService.deleteComment(this.post._id,id).subscribe(resultat => {
        this.reversedComments = this.reversedComments.filter(comment => comment._id !== id);
      })
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        'Your comment is safe :)',
        'error'
      )
    }
  })
}
}
