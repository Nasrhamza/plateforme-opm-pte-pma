import { TestBed } from '@angular/core/testing';

import { AdDocsService } from './ad-docs.service';

describe('AdDocsService', () => {
  let service: AdDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdDocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
