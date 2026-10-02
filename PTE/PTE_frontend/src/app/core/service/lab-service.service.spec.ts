import { TestBed } from '@angular/core/testing';

import { LabServiceService } from './lab-service.service';

describe('LabServiceService', () => {
  let service: LabServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
