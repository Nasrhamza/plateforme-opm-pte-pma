import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingHomeComponent } from './account-setting-home.component';

describe('AccountSettingHomeComponent', () => {
  let component: AccountSettingHomeComponent;
  let fixture: ComponentFixture<AccountSettingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSettingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
