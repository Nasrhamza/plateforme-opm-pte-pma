import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { BackendService } from './backend.service'; // Import your backend service
import { AuthService } from './auth.service'; // Import AuthService to get the current user
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SolutionRequestsService {
    private requestsCountSubject = new BehaviorSubject<number>(0);
    public requestsCount$ = this.requestsCountSubject.asObservable();

    constructor(private backendService: BackendService, private socket: Socket) { }

    loadCount() {
        this.backendService.get(`${environment.apiUrl}/solution/getAllRequests`).subscribe(
            (res: any) => {
                const count = res.rows.filter(r => r.valid === false).length;
                this.requestsCountSubject.next(count);
            }
        );
    }

    listenSockets() {
        this.socket.fromEvent('solution-request-added').subscribe(() => this.loadCount());
        this.socket.fromEvent('solution-request-validated').subscribe(() => this.loadCount());
    }
}
