import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { AccountSettingsSecurityComponent } from '../account-settings-security/account-settings-security.component';
import { AccountSettingsProfileComponent } from '../account-settings-profile/account-settings-profile.component';

@Component({
  selector: 'app-account-setting-home',
  standalone: true,
  imports: [
    SharedModule,
    AccountSettingsSecurityComponent,
    AccountSettingsProfileComponent,
  ],
  templateUrl: './account-setting-home.component.html',
  styleUrl: './account-setting-home.component.scss'
})
export class AccountSettingHomeComponent {

}
