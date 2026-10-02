import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserImageComponent } from './update-user-image.component';

describe('UpdateUserImageComponent', () => {
  let component: UpdateUserImageComponent;
  let fixture: ComponentFixture<UpdateUserImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateUserImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateUserImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
