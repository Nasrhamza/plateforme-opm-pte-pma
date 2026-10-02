import { Component } from '@angular/core';
import { NgbCarouselConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PostServiceService } from 'src/app/core/service/post-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import Swal from 'sweetalert2';
import { NewPostComponent } from '../new-post/new-post.component';
import { EditPostComponent } from '../edit-post/edit-post.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuotesServiceService } from 'src/app/core/service/quotes-service.service';
import { environment } from 'src/environments/environment';
import { LikersModalComponent } from './likers-modal/likers-modal.component';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss'],
  providers: [NgbCarouselConfig, ToastrService],

})
export class FeedsComponent {
  readonly picsUrl = environment.PICSURL;
  readonly postPics = environment.POST_IMAGE_URL

  active!: number;
  approved: any[] = [];
  pending: any[] = [];
  declined: any[] = [];
  saved: any[] = [];
  request: any[] = [];

  ReversedApproved: any[] = [];
  ReversedPending: any[] = [];
  ReversedDeclined: any[] = [];
  ReversedSaved: any[] = [];
  ReversedRequest: any[] = [];

  likesCount!: number
  commentsCount!: number

  posts: any[] = [];
  reversedPosts: any[] = [];
  myApprovedPosts!: number
  myDeclinedPosts!: number
  myPendingPosts!: number
  mySavedPosts!: number
  allPosts!: number
  postRequests!: number
  user!: any
  showCommentSection: boolean = false
  alignCommentSection: boolean[] = []
  showUserLike: string[] = []
  showUserSave: string[] = []
  showOldDescription: boolean = true
  idpost!: string
  userID: string = ''
  likeID: string = ''
  userRole: string = ''
  isLiked: boolean = false
  isSaved: boolean = false
  userLikeId: string = ''
  posts1: any[] = [];

  quote!: any
  news!: any
  loading!: boolean

  postForm!: FormGroup
  images: File[] = [];

  constructor(private config: NgbCarouselConfig,
    private userService: UserServiceService,
    private postService: PostServiceService,
    private modalService: NgbModal,
    private quotesService: QuotesServiceService,
    private toastr: ToastrService) {
    config.showNavigationArrows = true;
    config.showNavigationIndicators = false;
  }

  ngOnInit(): void {
    this.userID = localStorage.getItem('userId')!
    this.userRole = localStorage.getItem('roles')!
    this.userService.getUserById(this.userID).subscribe(resultat => {
      this.user = resultat as any
    })
    this.getApproved()
    this.getDeclined()
    this.getPending()
    this.getSaved()
    this.getPostRequest()
    this.getAllPosts()
    this.checkIsLiked()
    this.checkIsSaved()
    this.getQuotes()
    this.getNews()

    this.postForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.minLength(5)]),
      switch: new FormControl(false),
      images: new FormControl(),
    })
  }
  onSubmit(postForm: FormGroup, desc: any) {
    this.loading = true
    const postData = new FormData()
    postData.append("description", this.postForm.value.description)
    postData.append("user", localStorage.getItem("userId")!)
    for (var i = 0; i < this.images.length; i++) {
      postData.append("images", this.images[i]);
    }
    this.postService.addPost(postData).subscribe(resultat => {
      this.playAudio()
      if (resultat) {
        this.toastr.success('Post uploaded successfully, you have to wait for the admin confirmation', "Success")
        this.getPostRequest()
        this.getPending()
        desc.value = ""
        this.images = []
        this.loading = false
      } else {
        this.toastr.error('oops! something went wrong', 'Error');
        this.loading = false
      }
    })
  }
  playAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/sound/postSound.wav";
    audio.load();
    audio.play();
  }
  playLikeAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/sound/like.mp3";
    audio.load();
    audio.play();
  }
  onSelect(event: any) {
    //console.log(event);
    this.images.push(...event.addedFiles);
  }
  onRemove(event: any) {
    //console.log(event);
    this.images.splice(this.images.indexOf(event), 1);
  }
  showSection(index: number) {
    // this.alignCommentSection=this.reversedPosts.map(comment => false)      
    this.alignCommentSection[index] = true
    this.idpost = this.posts[index]._id
  }
  checkIsSaved() {
    this.postService.getAllPosts().subscribe(res => {
      this.posts1 = res
      this.posts1.forEach((p: any) => {
        let USaved: any
        USaved = p.userSaved
        USaved.forEach((u: any) => {
          if (u === localStorage.getItem('userId')) {
            this.isSaved = true
          } else {
            this.isSaved = false
          }
        });
      })
    })
  }
  checkIsLiked() {
    this.postService.getAllPosts().subscribe(res => {
      this.posts1 = res
      this.posts1.forEach((p: any) => {
        let likes: any
        likes = p.likes
        likes.forEach((l: any) => {
          this.postService.getLike(l._id).subscribe(res => {
            this.likeID = res.user
            this.userLikeId = res.post
            if (this.userID == this.likeID && this.userLikeId === p._id) {
              this.isLiked = true
            } else {
              this.isLiked = false
            }

          })
        })
      })
    })
  }
  isLike(idP: string) {

    for (let i = 0; i < this.showUserLike.length; i++) {
      if (idP === this.showUserLike[i]) {
        return true
      }
    }
    return false
  }
  isSave(idp: string) {
    for (let i = 0; i < this.showUserSave.length; i++) {
      if (idp === this.showUserSave[i]) {
        return true
      }
    }
    return false
  }
  isUnsave(idp: string) {
    let exist = this.showUserSave.find(p => p == idp)
    if (exist) {
      this.showUserSave = this.showUserSave.filter(p => p != idp)
    } else {
      this.showUserSave.push(idp)
    }
  }
  isdislike(idp: string) {
    let exist = this.showUserLike.find(p => p == idp)
    if (exist) {
      this.showUserLike = this.showUserLike.filter(p => p != idp)
    } else {
      this.showUserLike.push(idp)
    }
  }
  addLik(id: string) {
    this.isdislike(id)
    this.postService.addLike(id, this.userID).subscribe(resultat => {
      this.playLikeAudio()
      this.getAllPosts()
    })
  }
  deletePost(id: string) {
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
  openNewPostModal() {
    const modalRef: NgbModalRef = this.modalService.open(NewPostComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false,
      backdropClass: 'light-blue-backdrop'
    });
    modalRef.result.then((result) => {
      this.getAllPosts()
    })
  }
  openEditPostModal(post: any) {
    const modalRef: NgbModalRef = this.modalService.open(EditPostComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false,
      backdropClass: 'light-blue-backdrop'
    });
    modalRef.componentInstance.payload = post
    modalRef.result.then(res => {
      this.getAllPosts()
    })
  }
  getApproved() {
    this.postService.getMyApprovedPosts(this.userID).subscribe(res => {
      this.approved = res as any
      this.myApprovedPosts = this.approved.length
      this.ReversedApproved = []
      for (let i = this.approved.length - 1; i >= 0; i--) {
        this.ReversedApproved.push(this.approved[i])
      }
    })
  }
  getDeclined() {
    this.postService.getMyDeclinededPosts(this.userID).subscribe(res => {
      this.declined = res as any
      this.myDeclinedPosts = this.declined.length
      this.ReversedDeclined = []
      for (let i = this.declined.length - 1; i >= 0; i--) {
        this.ReversedDeclined.push(this.declined[i])
      }
    })
  }
  getPending() {
    this.postService.getMyPendingPosts(this.userID).subscribe(res => {
      this.pending = res as any
      this.myPendingPosts = this.pending.length
      this.ReversedPending = []
      for (let i = this.pending.length - 1; i >= 0; i--) {
        this.ReversedPending.push(this.pending[i])
      }
    })
  }
  getAllPosts() {

    this.postService.getAllPosts().subscribe(res => {
      this.posts = res as any
      this.allPosts = this.posts.length
      this.reversedPosts = []
      for (let i = this.posts.length - 1; i >= 0; i--) {
        this.reversedPosts.push(this.posts[i])
      }
      res.forEach((element: any) => {
        element.likes.forEach((l: any) => {
          this.postService.getLike(l._id).subscribe(res => {
            this.likeID = res.user
            this.userLikeId = res.post
            if (this.userID == this.likeID && this.userLikeId === element._id) {
              this.showUserLike.push(element._id)
            }
          })
        })

      });
    })
  }
  getSaved() {
    this.postService.userSavedPosts(this.userID).subscribe(res => {
      this.saved = res as any
      this.mySavedPosts = this.saved.length
      this.ReversedSaved = []
      for (let i = this.saved.length - 1; i >= 0; i--) {
        this.ReversedSaved.push(this.saved[i])
      }
      this.saved.forEach((element: any) => {
        element.userSaved.forEach((e: any) => {
          if (this.userID == e) {
            this.showUserSave.push(element._id)
          }
        })
      })
    })
  }
  savePost(postid: string, userid: string) {
    this.isUnsave(postid)
    this.postService.savePost(postid, userid).subscribe(res => {
      this.getSaved()
      if (res.toString() === 'Post saved') {
        this.toastr.info(res.toString())
      }
      else {
        this.toastr.info(res.toString())
      }
    })
  }
  getPostRequest() {
    this.postService.getAll().subscribe(res => {
      this.request = res as any
      this.postRequests = this.request.length
      this.ReversedRequest = []
      for (let i = this.request.length - 1; i >= 0; i--) {
        this.ReversedRequest.push(this.request[i])
      }
    })
  }
  acceptPost(id: string) {
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
          this.getAllPosts()
        })
      }
    })
  }
  declinePost(id: string) {
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
          this.getDeclined()

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

  showLikes(likes: any) {
    const modalRef: NgbModalRef = this.modalService.open(LikersModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false,
      backdropClass: 'light-blue-backdrop'
    });
    modalRef.componentInstance.payload = likes

  }







  getQuotes() {
    this.quotesService.getQuotes().subscribe(res => {
      this.quote = res
      // console.log("Getting quotes",this.quote)
    })
  }
  getNews() {
    this.quotesService.getTopNews().subscribe(res => {
      this.news = res
      //  console.log("Getting news",this.news)
    })
  }
}
