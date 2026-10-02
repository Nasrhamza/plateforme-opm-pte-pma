import { TestBed } from '@angular/core/testing';

import { NetworkRequestService } from './network-request.service';

describe('NetworkRequestService', () => {
  let service: NetworkRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
