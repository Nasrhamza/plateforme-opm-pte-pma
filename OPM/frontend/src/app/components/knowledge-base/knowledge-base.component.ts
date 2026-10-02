import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent implements OnInit {
  fileurl: string = environment.fileUrl
  public size = 'large-view';
  public showView1 = false;
  public allTickets: any[] = [];
  public selectedTicketIndex: number | null = null;
  term: string = '';
  page: number = 1;
  solutionCount: number = 0;
  expandedTickets: { [key: number]: boolean } = {};
  totalPages: number = 0;
  itemsPerPage: number = 6;

  constructor(private backendService: BackendService) { }

  ngOnInit(): void {
    this.getAllTickets();
  }


  getAllTickets() {
    this.backendService.post(`${environment.apiUrl}/ticket/getAllTicketsKnowloadgeBase`, {
      page: this.page,
      limit: this.itemsPerPage,
      searchTerm: this.term
    }).subscribe((response: any) => {
      this.allTickets = response.rows;
      this.solutionCount = response.totalCount;
      this.totalPages = Math.ceil(response.totalCount / this.itemsPerPage);
    });
  }

  pageChanged(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.getAllTickets();
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
  toggleDetails(index: number) {
    this.expandedTickets[index] = !this.expandedTickets[index];

    this.selectedTicketIndex = index;
    this.showView1 = true;
  }

  closeDetails() {
    this.showView1 = false;
    this.selectedTicketIndex = null;
  }

  deleteSolution(ticketId: number) {
    // Add delete functionality here if needed
  }
}
