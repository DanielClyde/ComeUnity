import { TestBed } from '@angular/core/testing';

import { IntroGuard } from './intro.guard';

describe('IntroService', () => {
  let service: IntroGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntroGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
