import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareFilesComponent } from './share-files.component';

describe('ShareFilesComponent', () => {
  let component: ShareFilesComponent;
  let fixture: ComponentFixture<ShareFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
