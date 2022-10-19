import { TestBed } from '@angular/core/testing';

import { SignStatusService } from './sign-status.service';

describe('SignStatusService', () => {
  let service: SignStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
