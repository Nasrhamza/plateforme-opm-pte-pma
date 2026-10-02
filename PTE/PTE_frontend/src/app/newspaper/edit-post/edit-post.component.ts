import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PostServiceService } from 'src/app/core/service/post-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
  providers:[ToastrService]
})
export class EditPostComponent {
  @Input('payload') payload!:any
  editPostForm!:FormGroup
  images: File[] = [];

  
  constructor(
    public activeModal: NgbActiveModal,
    private postService:PostServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.editPostForm = new FormGroup({
      description: new FormControl(this.payload.description),     
    })
    this.images=this.payload.images
  }
  
  onSubmit(editPostForm:FormGroup){
    const postData= new FormData()
    postData.append("description",this.editPostForm.value.description)
    for (var i =0;i<this.images.length;i++) {
      postData.append("images",this.images[i]);
    }
    if (editPostForm){
      this.postService.updatePost(this.payload._id,postData).subscribe(resultat => {
        this.toastr.success('Post updated successfully.' , "Success")
        this.activeModal.close("Post updated successfully");
        // setTimeout(() => {
        //   location.reload();        
        // }, 900);
      })
    }else{
      this.toastr.error('Post update did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss("Post update failed");
        // setTimeout(() => {
        //   location.reload();        
        // }, 900);
    }
  }
  onSelect(event:any) {
    //console.log(event);
    this.images.push(...event.addedFiles);
  }
  
  onRemove(event:any) {
    //console.log(event);
    this.images.splice(this.payload.images.indexOf(event), 1);
  }
}
