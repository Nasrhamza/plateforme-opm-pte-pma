import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateFoldersComponent } from './add-update-folders.component';

describe('AddUpdateFoldersComponent', () => {
  let component: AddUpdateFoldersComponent;
  let fixture: ComponentFixture<AddUpdateFoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateFoldersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
