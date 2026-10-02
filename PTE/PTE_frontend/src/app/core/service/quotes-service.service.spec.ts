import { TestBed } from '@angular/core/testing';

import { QuotesServiceService } from './quotes-service.service';

describe('QuotesServiceService', () => {
  let service: QuotesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuotesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
