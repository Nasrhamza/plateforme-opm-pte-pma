import { Component } from '@angular/core';
import { NgbCarouselConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { NewPostComponent } from '../new-post/new-post.component';
import { PostServiceService } from 'src/app/core/service/post-service.service';
import { ToastrService } from 'ngx-toastr';
import { post } from 'src/app/core/models/post';
import { Comment } from 'src/app/core/models/comment';
import Swal from 'sweetalert2';
import { EditPostComponent } from '../edit-post/edit-post.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-newspaper',
  templateUrl: './newspaper.component.html',
  styleUrls: ['./newspaper.component.scss'],
  providers: [NgbCarouselConfig,ToastrService],

})
export class NewspaperComponent {
  readonly picsUrl = environment.PICSURL;

  posts: any[] = [];
  reversedPosts: any[] = [];
  myApprovedPosts!:number
  myDeclinedPosts!:number
  myPendingPosts!:number
  mySavedPosts!:number
  allPosts!:number
  postRequests!:number
  user!:any
  showCommentSection:boolean = false
  alignCommentSection:boolean []= []
  showUserLike:boolean []= []
  showOldDescription:boolean = true
  idpost!:string
  userID:string = ''
  likeID:string = ''
  userRole:string=''
  isLiked:boolean = false
  isSaved:boolean = false
  userLikeId :string =''
  posts1: any[] = [];

  constructor(private config: NgbCarouselConfig,
              private userService:UserServiceService,
              private postService:PostServiceService,
              private modalService: NgbModal,
              private toastr: ToastrService,

              ) {
    // customize default values of carousels used by this component tree
    config.showNavigationArrows = true;
    config.showNavigationIndicators = false;
  }

  ngOnInit(): void {
    this.userID = localStorage.getItem('userId')!
    this.userRole = localStorage.getItem('roles')!
    this.userService.getUserById(this.userID).subscribe(resultat =>{
        this.user = resultat as any
    })
    this.getApproved()
    this.getDeclined()
    this.getPending()
    this.getSaved()
    this.getPostRequest()
    setTimeout(() => {
      this.getAllPosts()
      this.checkIsLiked()
      this.checkIsSaved()
    },500)
  }
  showSection(index:number) {
    // this.alignCommentSection=this.reversedPosts.map(comment => false)      
    this.alignCommentSection[index]=true
    this.idpost=this.posts[index]._id
  }
  
  checkIsSaved(){
    this.postService.getAllPosts().subscribe(res =>{
      this.posts1 = res 
      this.posts1.forEach((p:any)=>{
        let USaved : any
        USaved = p.userSaved
        USaved.forEach((u:any) => {
          if(u === localStorage.getItem('userId')){
            this.isSaved = true
          }else{
            this.isSaved =false
          }
        });
      })
    })
  }

  checkIsLiked(){
    this.postService.getAllPosts().subscribe(res =>{
      this.posts1 = res 
      this.posts1.forEach((p : any) =>{
        let likes : any
        likes = p.likes
        likes.forEach((l : any) => {
          this.postService.getLike(l._id).subscribe(res=>{
              this.likeID = res.user 
              this.userLikeId = res.post
              if (this.userID == this.likeID && this.userLikeId === p._id){
                this.isLiked = true
              }else{
                this.isLiked = false
              }
              
            })        
        })
      })
    })
  }

  addLik(id:string){
    
    let likeList=[]
    this.postService.addLike(id,this.userID).subscribe(resultat=>{
      likeList=resultat.likes
      likeList.forEach((element: any) => {
        this.postService.getLike(element._id).subscribe(res=>{
          // console.log(res)
          this.likeID = res.user
          this.userLikeId = res.post
          if (this.userID == this.likeID && this.userLikeId === id){
            this.isLiked = true
          }else{
            this.isLiked = false
          }
        })        
      });
    })
  }
  deletePost(id:string){
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
          'Your Post has been deleted.',
          'success'
        )
        this.postService.deletePost(id).subscribe(resultat => {
          this.reversedPosts = this.reversedPosts.filter(post => post._id !== id);
        })
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your post is safe :)',
          'error'
        )
      }
    })
  }
  openNewPostModal(){
    const modalRef: NgbModalRef = this.modalService.open(NewPostComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });     
    modalRef.result.then((result) => {
      this.getAllPosts()
    })
  }
  openEditPostModal(post:any){
    const modalRef: NgbModalRef = this.modalService.open(EditPostComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });     
    modalRef.componentInstance.payload=post
  }
  getApproved(){
    this.postService.getMyApprovedPosts(this.userID).subscribe(res=>{
      this.posts= res as any
      this.myApprovedPosts=this.posts.length
      this.reversedPosts=[]
      for (let i= this.posts.length-1; i >= 0 ; i--) {
        this.reversedPosts.push(this.posts[i])
      }
    })
  }
  getDeclined(){
    this.postService.getMyDeclinededPosts(this.userID).subscribe(res=>{
      this.posts= res as any
      this.myDeclinedPosts=this.posts.length
      this.reversedPosts=[]
      for (let i= this.posts.length-1; i >= 0 ; i--) {
        this.reversedPosts.push(this.posts[i])
      }
    })
  }
  getPending(){
    this.postService.getMyPendingPosts(this.userID).subscribe(res=>{
      this.posts= res as any
      this.myPendingPosts=this.posts.length
      this.reversedPosts=[]
      for (let i= this.posts.length-1; i >= 0 ; i--) {
        this.reversedPosts.push(this.posts[i])
      }
    })
  }
  getAllPosts(){
    this.postService.getAllPosts().subscribe(res=>{
      this.posts= res as any
      this.allPosts=this.posts.length
      this.reversedPosts=[]
      for (let i= this.posts.length-1; i >= 0 ; i--) {
        this.reversedPosts.push(this.posts[i])
      }
    })
  }
  getSaved(){
    this.postService.userSavedPosts(this.userID).subscribe(res=>{
      this.posts= res as any
      this.mySavedPosts=this.posts.length
      this.reversedPosts=[]
      for (let i= this.posts.length-1; i >= 0 ; i--) {
        this.reversedPosts.push(this.posts[i])
      }
    })
  }
  savePost(postid:string,userid:string){
    this.postService.savePost(postid,userid).subscribe(res=>{
      if(res.toString()==='Post saved'){
        this.isSaved = true
        this.toastr.info(res.toString())
    }else{
        this.isSaved = false
        this.toastr.info(res.toString())
    }
  })
}
getPostRequest(){
    this.postService.getAll().subscribe(res=>{
      this.posts= res as any
      this.postRequests=this.posts.length
      this.reversedPosts=[]
      for (let i= this.posts.length-1; i >= 0 ; i--) {
        this.reversedPosts.push(this.posts[i])
      }
    })
}
acceptPost(id:string){
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
    confirmButtonText: 'Yes, Approve it!',
    reverseButtons: false
  }).then((result) => {
    if (result.isConfirmed) {
      swalWithBootstrapButtons.fire(
        'Confirmed!',
        'Post request has been accepted.',
        'success'
      )
      this.postService.managerAccept(id).subscribe(resultat => {
        this.getPostRequest()
      })
    } 
  })
}
declinePost(id:string){
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
        'Your Post has been declined.',
        'success'
      )
      this.postService.managerDecline(id).subscribe(resultat => {
        this.getPostRequest()

      })
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        'Your post is safe :)',
        'error'
      )
    }
  })
}
}
