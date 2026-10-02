import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostServiceService } from 'src/app/core/service/post-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-likers-modal',
  templateUrl: './likers-modal.component.html',
  styleUrls: ['./likers-modal.component.scss']
})
export class LikersModalComponent {
  currentUserId!:string
  @Input("payload") payload:any
  likers:any[] =[]
  readonly picsUrl = environment.PICSURL;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private likesServie: PostServiceService

    ) {}
  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('userId')!
    this.getLikers()

  }

  getLikers(){
    for (let i in this.payload) {
      this.likesServie.getLikers(this.payload[i]._id).subscribe(res => {
        this.likers.push(res.user)
      })
    }
  }
}