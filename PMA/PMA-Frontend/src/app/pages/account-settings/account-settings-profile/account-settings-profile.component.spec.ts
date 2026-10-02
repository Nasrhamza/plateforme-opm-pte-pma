import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsProfileComponent } from './account-settings-profile.component';

describe('AccountSettingsProfileComponent', () => {
  let component: AccountSettingsProfileComponent;
  let fixture: ComponentFixture<AccountSettingsProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSettingsProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
