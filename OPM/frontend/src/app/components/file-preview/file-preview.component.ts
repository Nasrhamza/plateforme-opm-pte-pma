import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent {
  @Input() fileUrl!: string;
  @Input() fileType!: string;
  @Input() fileTitle!: string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    console.log(this.fileUrl);
    console.log(this.fileType);
    console.log(this.fileTitle);
  }

  isImage(): boolean {
    return ['jpg', 'jpeg', 'png', 'gif'].includes(this.fileType.toLowerCase());
  }

  isPDF(): boolean {
    return this.fileType.toLowerCase() === 'pdf';
  }

  downloadFile(fileUrl: string, fileType: string, fileTitle: string): void {
    // Extract extension from title
    const fileExtension = fileTitle.split('.').pop();

    // Check if fileTitle already ends with the extension
    const fullFileName = fileTitle.endsWith(`.${fileExtension}`)
      ? fileTitle
      : `${fileTitle}.${fileExtension}`;

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
        link.download = fullFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
  }
}
