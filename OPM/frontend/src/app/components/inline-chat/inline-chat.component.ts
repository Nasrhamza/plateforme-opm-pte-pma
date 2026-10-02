import { Component, OnInit, ViewChild } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { FilePreviewComponent } from '../file-preview/file-preview.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddHsSpareComponent } from './add-hs-spare/add-hs-spare.component';
import { UpdateSpareComponent } from './update-spare/update-spare.component';
import { AddSolutionComponent } from './add-solution/add-solution.component';
import { RequestSolutionComponent } from './request-solution/request-solution.component';

@Component({
  selector: 'app-inline-chat',
  templateUrl: './inline-chat.component.html',
  styleUrls: ['./inline-chat.component.scss']
})
export class InlineChatComponent implements OnInit {
  @ViewChild(PerfectScrollbarComponent) componentRef?: PerfectScrollbarComponent;
  public senderList: any[] = [];
  public message: string = '';
  public message_error: boolean = false;
  public newReplay: any = '';
  public chatMessages: any[] = [];
  public currentTicketId: string;
  public currentSenderId: string;
  fileurl: string = environment.fileUrl
  fileNames: string;
  files: any = []
  currentSender;
  caseId
  spare: any[] = []; // Your spares array
  modalVisible = false;
  selectedSpare: any = null;
  public currentTicket: any;
  isAttachSolutionVisible = false;

  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentSenderId = this.authService.getAuthUser().user._id;
    this.currentSender = this.authService.getAuthUser().user;
    this.currentTicketId = this.route.snapshot.paramMap.get('id');
    this.loadChatMessages();
    this.getCurrentTicket();
    this.getSparesByTicketId();
  }
  toggleAttachSolution() {
    this.isAttachSolutionVisible = !this.isAttachSolutionVisible;
  }
  getProfileImage(imagePath: any): string {
    return `${environment.apiUrl}/uploads/${imagePath}`;
  }

  loadChatMessages() {
    if (this.currentTicketId) {
      this.backendService.get(`${environment.apiUrl}/chat/getChatForTicket/${this.currentTicketId}`)
        .subscribe((response: any) => {
          this.chatMessages = response.messages || [];
          console.log(this.chatMessages)
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
    }
  }
  getCurrentTicket() {
    this.backendService.get(`${environment.apiUrl}/ticket/getTicketById/${this.currentTicketId}`)
      .subscribe((response: any) => {
        this.currentTicket = response.rows
        console.log(this.currentTicket)
      },
      );
  }
  getSparesByTicketId() {
    this.backendService.get(`${environment.apiUrl}/spare/getSparesByTicketId/${this.currentTicketId}`)
      .subscribe((response: any) => {
        this.spare = response.rows
        console.log(this.spare)
      },
      );
  }
  openSpareModal(spare: any) {
    this.selectedSpare = spare;
    // Use jQuery or Bootstrap JS to open the modal by ID
    ($('#spareModal') as any).modal('show');
  }

  closeSpareModal() {
    this.selectedSpare = null;
    ($('#spareModal') as any).modal('hide');
  }
  onEditSpare(spare: any) {
    const modalRef = this.modalService.open(UpdateSpareComponent);
    modalRef.componentInstance.title = 'Update Spare';
    modalRef.componentInstance.currentTicket = this.currentTicket;
    modalRef.componentInstance.currentSender = this.currentSender;
    modalRef.componentInstance.currentSpare = spare;
  }

  openAttachExchangesModal() {
    const modalRef = this.modalService.open(AddHsSpareComponent);
    modalRef.componentInstance.title = 'Add Exchanges with support';
    modalRef.componentInstance.add = true;
    modalRef.componentInstance.currentTicket = this.currentTicket;
    modalRef.componentInstance.currentSender = this.currentSender;

  }
  openRequestSolutionModal() {
    const modalRef = this.modalService.open(RequestSolutionComponent);
    modalRef.componentInstance.title = 'Request Adding Solution';
    modalRef.componentInstance.currentTicket = this.currentTicket;
    modalRef.componentInstance.currentSender = this.currentSender;

  }
  openAttachSolutionModal() {
    const modalRef = this.modalService.open(AddSolutionComponent);
    modalRef.componentInstance.title = 'Add Solution';
    modalRef.componentInstance.add = true;
    modalRef.componentInstance.currentTicket = this.currentTicket;
    modalRef.componentInstance.currentSender = this.currentSender;

  }
  deleteMessage(messageId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to recover this message!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.backendService.delete(`${environment.apiUrl}/chat/deleteMessageFromChat/${messageId}`).subscribe(
          () => {
            this.chatMessages = this.chatMessages.filter(msg => msg._id !== messageId);
            Swal.fire('Deleted!', 'Your message has been deleted.', 'success');
          },
        );
      }
    });
  }

  formatMessageTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the current week (Sunday)

    const timeFormat = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${timeFormat}`;
    } else if (date.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
      return `Yesterday ${timeFormat}`;
    } else if (date >= startOfWeek) {
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long'
      }).format(date) + ` ${timeFormat}`;
    } else {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short'
      }).format(date).replace(',', '') + ` ${timeFormat}`;
    }
  }
  FindTypefile(fileName: string): string {
    const index = fileName.lastIndexOf(".");
    if (index !== -1) {
      return fileName.substring(index + 1).toUpperCase();
    }
    return '';
  }
  isImage(fileName: string): boolean {
    const fileExtension = this.FindTypefile(fileName).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension);
  }

  openFilePreview(fileUrl: string, fileType: string, fileTitle: string) {
    const modalRef = this.modalService.open(FilePreviewComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });
    console.log(fileUrl)
    console.log(fileType)
    console.log(fileTitle)
    modalRef.componentInstance.fileUrl = fileUrl;
    modalRef.componentInstance.fileType = fileType;
    modalRef.componentInstance.fileTitle = fileTitle;
  }
  declineSolution() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to decline this solution?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Decline!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          ticketId: this.currentTicketId
        };
        this.backendService.post(`${environment.apiUrl}/ticket/declineSolution`, payload)
          .subscribe(
            (response: any) => {
              Swal.fire('Success', 'Solution is declined', 'success');
              this.currentTicket.solution = response.rows;
            },
          );
      }
    });
  }
  validateSolution() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to validate this solution?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Validate!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          ticketId: this.currentTicketId
        };
        this.backendService.post(`${environment.apiUrl}/ticket/validateSolution`, payload)
          .subscribe(
            (response: any) => {
              Swal.fire('Success', 'Solution is valid', 'success');
              this.currentTicket.solution = response.rows;
            },
          );
      }
    });
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    this.files = input.files ? Array.from(input.files) : [];
    this.fileNames = this.files.map(file => file.name).join(', ');
  }
  downloadFile(fileUrl: string, fileTitle: string, fileName: string): void {
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;  // Use fileName directly here
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
  }

  triggerImageUpload() {
    document.getElementById('imgupload').click();
  }

  sentMsg(flag: number) {
    if (!this.message && this.files.length === 0) {
      this.message_error = true;
      return;
    }

    if (flag === 1) {
      this.message_error = false;
    } else {
      this.message_error = false;

      const formData = new FormData();
      formData.append('senderId', this.currentSenderId);
      formData.append('message', this.message);

      if (this.files && this.files.length > 0) {
        this.files.forEach((file: any) => {
          formData.append('files', file, file.name);
        });
      }
      this.backendService.post(`${environment.apiUrl}/chat/sendMessageToChat/${this.currentTicketId}`, formData)
        .subscribe((response: any) => {
          this.chatMessages = [...this.chatMessages, response.data];
          this.message = '';
          this.files = [];
          this.fileNames = '';
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
    }
  }
  scrollToBottom(): void {
    setTimeout(() => {
      if (this.componentRef) {
        this.componentRef.directiveRef.scrollToBottom();
      }
    }, 100);
  }
}
