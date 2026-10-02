import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateEquipemontSofetComponent } from './add-update-equipemont-sofet.component';

describe('AddUpdateEquipemontSofetComponent', () => {
  let component: AddUpdateEquipemontSofetComponent;
  let fixture: ComponentFixture<AddUpdateEquipemontSofetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateEquipemontSofetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateEquipemontSofetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
