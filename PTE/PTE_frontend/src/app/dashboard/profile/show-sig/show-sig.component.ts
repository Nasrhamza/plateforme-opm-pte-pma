import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-show-sig',
  templateUrl: './show-sig.component.html',
  styleUrls: ['./show-sig.component.scss']
})
export class ShowSigComponent {
 @Input("payload") payload!:any
 readonly sigUrl = environment.SIGNATURE_URL;

 constructor(public activeModal: NgbActiveModal,) {}
  ngOnInit(){
  }
}
