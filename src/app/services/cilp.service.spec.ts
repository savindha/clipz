import { TestBed } from '@angular/core/testing';

import { CilpService } from './cilp.service';

describe('CilpService', () => {
  let service: CilpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CilpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
