import { TestBed } from '@angular/core/testing';

import { EntityFactoryService } from './entity-factory.service';

describe('EntityFactoryService', () => {
  let service: EntityFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
