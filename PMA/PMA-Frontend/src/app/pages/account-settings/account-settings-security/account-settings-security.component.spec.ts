import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsSecurityComponent } from './account-settings-security.component';

describe('AccountSettingsSecurityComponent', () => {
  let component: AccountSettingsSecurityComponent;
  let fixture: ComponentFixture<AccountSettingsSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsSecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSettingsSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
