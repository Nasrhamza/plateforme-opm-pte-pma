import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderDetailesComponent } from './folder-detailes.component';

describe('FolderDetailesComponent', () => {
  let component: FolderDetailesComponent;
  let fixture: ComponentFixture<FolderDetailesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderDetailesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderDetailesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
