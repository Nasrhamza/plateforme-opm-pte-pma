import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualisationEnvironmentComponent } from './virtualisation-environment.component';

describe('VirtualisationEnvironmentComponent', () => {
  let component: VirtualisationEnvironmentComponent;
  let fixture: ComponentFixture<VirtualisationEnvironmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualisationEnvironmentComponent]
    });
    fixture = TestBed.createComponent(VirtualisationEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
