import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(private httpClient: HttpClient,private router: Router,) {}

  get(endpoint: string, limit?: number, offset?: number) {
    return this.httpClient.get(
      limit  ? `${endpoint}?limit=${limit}&offset=${offset}` : endpoint
    );
  }
  delete(endpoint: string) {
    return this.httpClient.delete(endpoint,{});
  }

  post(endpoint: string, object: any) { 
    return this.httpClient.post(endpoint, object);
  }
  put(endpoint: string, object: any) {
    return this.httpClient.put(endpoint, object);
  }
  reloadComponent() {
    const currentRoute = this.router.url;
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);
    });
  }

}