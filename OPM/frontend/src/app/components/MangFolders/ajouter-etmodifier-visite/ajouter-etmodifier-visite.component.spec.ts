import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterEtmodifierVisiteComponent } from './ajouter-etmodifier-visite.component';

describe('AjouterEtmodifierVisiteComponent', () => {
  let component: AjouterEtmodifierVisiteComponent;
  let fixture: ComponentFixture<AjouterEtmodifierVisiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjouterEtmodifierVisiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterEtmodifierVisiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
