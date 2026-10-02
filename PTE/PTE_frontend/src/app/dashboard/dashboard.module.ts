import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './main/main.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxGaugeModule } from 'ngx-gauge';
import { Dashboard2Component } from './dashboard2/dashboard2.component';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { UserListComponent } from './user-list/user-list.component';
import { UserRequestComponent } from './user-request/user-request.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { UserDetailsComponent } from './user-list/user-details/user-details.component';
import { RoomComponent } from './room/room.component';
import { ToolComponent } from './tool/tool.component';
import { TechnicianComponent } from './technician/technician.component';
import { VirtualisationEnvironmentComponent } from './virtualisation-environment/virtualisation-environment.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddEventModalComponent } from './vehicle/add-event-modal/add-event-modal.component';
import { EditVehicleModalComponent } from './vehicle/edit-vehicle-modal/edit-vehicle-modal.component';
import { AddVehicleModalComponent } from './vehicle/add-vehicle-modal/add-vehicle-modal.component';
import { EventInfoModalComponent } from './vehicle/event-info-modal/event-info-modal.component';
import { AddRoomModalComponent } from './room/add-room-modal/add-room-modal.component';
import { EditRoomModalComponent } from './room/edit-room-modal/edit-room-modal.component';
import { AddRoomEventModalComponent } from './room/add-room-event-modal/add-room-event-modal.component';
import { EventInfoRoomModalComponent } from './room/event-info-room-modal/event-info-room-modal.component';
import { EventInfoTechModalComponent } from './technician/event-info-tech-modal/event-info-tech-modal.component';
import { TechPersonalDetailsModalComponent } from './technician/tech-personal-details-modal/tech-personal-details-modal.component';
import { AddTechnicianEventModalComponent } from './technician/add-technician-event-modal/add-technician-event-modal.component';
import { MyRequestsComponent } from './virtualisation-environment/my-requests/my-requests.component';
import {MatStepperModule} from '@angular/material/stepper';
import { LeaveComponent } from './leave/leave.component';
import { MyLeaveRequestsComponent } from './leave/my-leave-requests/my-leave-requests.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ProfileComponent } from './profile/profile.component';
import { EducationFormComponent } from './profile/education-form/education-form.component';
import { ExperienceFormComponent } from './profile/experience-form/experience-form.component';
import { CertificationFormComponent } from './profile/certification-form/certification-form.component';
import { ProjectFormComponent } from './profile/project-form/project-form.component';
import { SkillsFormComponent } from './profile/skills-form/skills-form.component';
import { EditProjectFormComponent } from './profile/edit-project-form/edit-project-form.component';
import { EditSkillsFormComponent } from './profile/edit-skills-form/edit-skills-form.component';
import { EditCertificationFormComponent } from './profile/edit-certification-form/edit-certification-form.component';
import { EditExperienceFormComponent } from './profile/edit-experience-form/edit-experience-form.component';
import { EditEducationFormComponent } from './profile/edit-education-form/edit-education-form.component';
import { EditSummaryFormComponent } from './profile/edit-summary-form/edit-summary-form.component';
import { DownloadCVComponent } from './profile/download-cv/download-cv.component';
import {NgxPrintModule} from 'ngx-print';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EditEventComponent } from './vehicle/edit-event/edit-event.component';
import { EditRoomEventComponent } from './room/edit-room-event/edit-room-event.component';
import { EditTechEventComponent } from './technician/edit-tech-event/edit-tech-event.component';
import { LeaveDocComponent } from './leave/leave-doc/leave-doc.component';
import { RequestApprovalModalComponent } from './virtualisation-environment/request-approval-modal/request-approval-modal.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { EditLanguageModalComponent } from './profile/edit-language-modal/edit-language-modal.component';
import { LanguageModalComponent } from './profile/language-modal/language-modal.component';
import { LogModalComponent } from './technician/log-modal/log-modal.component';
import { ExternalUserComponent } from './external-user/external-user.component';
import { AddExternalModalComponent } from './external-user/add-external-modal/add-external-modal.component';
import { ShowSigComponent } from './profile/show-sig/show-sig.component';
import { PreviewDocsModalComponent } from './external-user/preview-docs-modal/preview-docs-modal.component';
import { InternsRequestComponent } from './interns-request/interns-request.component';
import { OffersComponent } from './offers/offers.component';
import { CreateOfferComponent } from './offers/create-offer/create-offer.component';
import { OfferPipe } from '../core/pipes/offer.pipe';
import { OfferDetailsComponent } from './offers/offer-details/offer-details.component';
import { EditOfferComponent } from './offers/edit-offer/edit-offer.component';
import { AssignQuizToOfferComponent } from './offers/assign-quiz-to-offer/assign-quiz-to-offer.component';
import { FillQuizComponent } from './offers/fill-quiz/fill-quiz.component';
import { AllOfferDetailsComponent } from './offers/all-offer-details/all-offer-details.component';
import { SelectedUserResultComponent } from './offers/selected-user-result/selected-user-result.component';
import { SelectedInternComponent } from './offers/selected-intern/selected-intern.component';
import { TasksComponent } from './tasks/tasks.component';
import { AddTaskComponent } from './tasks/add-task/add-task.component';
import { LabDetailsComponent } from './virtualisation-environment/lab-details/lab-details.component';
import { NetworkRequestsComponent } from './network-requests/network-requests.component';
import { DocsComponent } from './offers/selected-intern/docs/docs.component';
import { InventoryComponent } from './inventory/inventory.component';
import { EquipmentTypeComponent } from './inventory/equipment-type/equipment-type.component';
import { AccessoryTypeComponent } from './inventory/accessory-type/accessory-type.component';
import { ForwardItemComponent } from './inventory/forward-item/forward-item.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { GasCardComponent } from './vehicle/gas-card/gas-card.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { VehicleStatComponent } from './vehicle/vehicle-stat/vehicle-stat.component';
@NgModule({
  declarations: [
    MainComponent, 
    Dashboard2Component, 
    UserListComponent, 
    UserRequestComponent, 
    UserDetailsComponent, 
    RoomComponent, 
    ToolComponent, 
    TechnicianComponent, 
    VirtualisationEnvironmentComponent, 
    VehicleComponent, 
    AddEventModalComponent, 
    EditVehicleModalComponent, 
    AddVehicleModalComponent, 
    EventInfoModalComponent, 
    AddRoomModalComponent, 
    EditRoomModalComponent, 
    AddRoomEventModalComponent,
    EventInfoRoomModalComponent, 
    EventInfoTechModalComponent, 
    TechPersonalDetailsModalComponent, 
    AddTechnicianEventModalComponent,
    MyRequestsComponent,
    LeaveComponent,
    MyLeaveRequestsComponent,
    ProfileComponent,
    EducationFormComponent,
    ExperienceFormComponent,
    CertificationFormComponent,
    ProjectFormComponent,
    SkillsFormComponent,
    EditProjectFormComponent,
    EditSkillsFormComponent,
    EditCertificationFormComponent,
    EditExperienceFormComponent,
    EditEducationFormComponent,
    EditSummaryFormComponent,
    DownloadCVComponent,
    UserProfileComponent,
    EditEventComponent,
    EditRoomEventComponent,
    EditTechEventComponent,
    LeaveDocComponent,
    RequestApprovalModalComponent,
    EditLanguageModalComponent,
    LanguageModalComponent,
    LogModalComponent,
    ExternalUserComponent,
    AddExternalModalComponent,
    ShowSigComponent,
    PreviewDocsModalComponent,
    InternsRequestComponent,
    OffersComponent,
    CreateOfferComponent,
    OfferPipe,
    OfferDetailsComponent,
    EditOfferComponent,
    AssignQuizToOfferComponent,
    FillQuizComponent,
    AllOfferDetailsComponent,
    SelectedUserResultComponent,
    SelectedInternComponent,
    TasksComponent,
    AddTaskComponent,
    LabDetailsComponent,
    NetworkRequestsComponent,
    DocsComponent,
    InventoryComponent,
    EquipmentTypeComponent,
    AccessoryTypeComponent,
    ForwardItemComponent,
    GasCardComponent,
    VehicleStatComponent,
  ],

  imports: [
    CommonModule,
    NgbModule,
    NgxPrintModule,
    DashboardRoutingModule,
    NgxDatatableModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left'
    }),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NgScrollbarModule,
    NgApexchartsModule,
    NgbProgressbarModule,
    NgxGaugeModule,
    FullCalendarModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDropzoneModule,
    MatStepperModule,
    NgxMaskDirective,
    LeafletModule,
    NgSelectModule
  ],
  providers: [provideNgxMask()],
})
export class DashboardModule {}
