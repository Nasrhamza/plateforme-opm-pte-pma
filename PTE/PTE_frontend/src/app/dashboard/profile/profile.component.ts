import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, of } from 'rxjs';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { CertificationFormComponent } from './certification-form/certification-form.component';
import { ProjectFormComponent } from './project-form/project-form.component';
import { EducationFormComponent } from './education-form/education-form.component';
import { ExperienceFormComponent } from './experience-form/experience-form.component';
import { SkillsFormComponent } from './skills-form/skills-form.component';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { EditSkillsFormComponent } from './edit-skills-form/edit-skills-form.component';
import { EditEducationFormComponent } from './edit-education-form/edit-education-form.component';
import { EditExperienceFormComponent } from './edit-experience-form/edit-experience-form.component';
import { EditProjectFormComponent } from './edit-project-form/edit-project-form.component';
import { EditCertificationFormComponent } from './edit-certification-form/edit-certification-form.component';
import { EditSummaryFormComponent } from './edit-summary-form/edit-summary-form.component';
import Swal from 'sweetalert2';
import { DownloadCVComponent } from './download-cv/download-cv.component';
import { AuthService } from 'src/app/core/service/auth.service';
import { environment } from 'src/environments/environment';
import { EditLanguageModalComponent } from './edit-language-modal/edit-language-modal.component';
import { LanguageModalComponent } from './language-modal/language-modal.component';
import { ShowSigComponent } from './show-sig/show-sig.component';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers:[ToastrService]

})
export class ProfileComponent {
  readonly picsUrl = environment.PICSURL;
  readonly certFileUrl = environment.CERT_URL;

  active!: number;
  user!:any
  CV!:any
  lisence!:string
  personalData!:FormGroup
  securityForm!:FormGroup
  files: File[] = [];
  image!:any
  isEduVisible!:boolean
  isExpVisible!:boolean
  isCertVisible!:boolean
  isProjVisible!:boolean
  isSkillVisible!:boolean
  isLanguageVisible!:boolean

  experiences:any
  educations:any
  certifications:any
  skills:any
  languages:any
  projets:any
  summary!:any

  loading!:boolean

  fs=["Single","Maried","Divorced",]


  constructor(
    private authService : AuthService,
    private userService:UserServiceService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router:Router,
    private cvService:CvServiceService,
    private route: ActivatedRoute,

    ){}
  ngOnInit(){
    this.loading=false
    const id = this.route.snapshot.paramMap.get('id')
    this.cvService.getUserCV(localStorage.getItem('userId')!).subscribe(resultat => {
      this.CV=resultat as any
    })
    this.userService.getUserById(localStorage.getItem('userId')!).subscribe(resultat => {
      this.user=resultat as any
      if(this.user.drivingLisence==true){
        this.lisence="YES"
      }else{
        this.lisence='NO'
      }
      this.getEducation()
      this.getExperience()
      this.getCertification()
      this.getSkill()
      this.getProject()
      this.getSummary()
      this.getLanguage()

      this.personalData = new FormGroup({
        firstName :new FormControl(this.user.firstName),
        lastName :new FormControl(this.user.lastName),
        phone :new FormControl(this.user.phone),
        address :new FormControl(this.user.address),
        FS : new FormControl(this.user.FS),
        bio : new FormControl(this.user.bio),
        image : new FormControl(),
        github : new FormControl(this.user.github),
        linkedin : new FormControl(this.user.linkedin),
      })
    })
    this.securityForm = new FormGroup({
      password: new FormControl('',[Validators.required, Validators.minLength(8)]),
      cpassword: new FormControl('',[Validators.required, Validators.minLength(8)],this.matchValues('password')),
    })
  }
  getUser(){
    this.userService.getUserById(localStorage.getItem('userId')!).subscribe(resultat => {
      this.user=resultat as any
    })
  }
  matchValues(matchTo: string): AsyncValidatorFn  {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      const input = control.value;
      const isValid = control.root.value[matchTo] === input;
      return of(isValid ? null : { 'matchValues': true }).pipe(
        map((result) => {
          // Simulate some asynchronous processing
          // You can replace the setTimeout with your actual asynchronous operation
          return result;
        })
      );
    };
  }
  getEducation(){
    this.cvService.getEducation(this.user.cv._id).subscribe(resultat =>{
      this.educations=resultat
      this.educations.sort((a: { start: string | number | Date; }, b: { start: string | number | Date; }) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
      this.educations.reverse()
    })
  }
  getExperience(){
  this.cvService.getExperience(this.user.cv._id).subscribe(resultat =>{
        this.experiences=resultat
        this.experiences.sort((a: { start: string | number | Date; }, b: { start: string | number | Date; }) => {
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
        this.experiences.reverse()
      })
  }
  getCertification(){
      this.cvService.getCertification(this.user.cv._id).subscribe(resultat =>{
      this.certifications=resultat
      this.certifications.sort((a: { start: string | number | Date; }, b: { start: string | number | Date; }) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
      this.certifications.reverse()
      })
    }
  getLanguage(){
  this.cvService.getLanguage(this.user.cv._id).subscribe(resultat =>{
        this.languages=resultat
        this.languages.reverse()
      })
    }
  getSkill(){
  this.cvService.getSkill(this.user.cv._id).subscribe(resultat =>{
        this.skills=resultat
        this.skills.reverse()
      })
    }
  getProject(){
  this.cvService.getProject(this.user.cv._id).subscribe(resultat =>{
        this.projets=resultat
        this.projets.sort((a: { start: string | number | Date; }, b: { start: string | number | Date; }) => {
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
        this.projets.reverse()
      })
    }
  getSummary(){
    this.cvService.getSummary(localStorage.getItem('userId')!).subscribe(resultat =>{
      this.summary=resultat

    })
  }
  openCertifModal(){
    const modalRef: NgbModalRef = this.modalService.open(CertificationFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });     
    modalRef.componentInstance.payload=this.user
    modalRef.result.then((res)=>{
      this.getCertification()
    })
  }
  openProjectModal(){
    const modalRef: NgbModalRef = this.modalService.open(ProjectFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=this.user
    modalRef.result.then((res)=>{
      this.getProject()
    })
  }
  openExpModal(){
    const modalRef: NgbModalRef = this.modalService.open(ExperienceFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });     
    modalRef.componentInstance.payload=this.user
    modalRef.result.then((res)=>{
      this.getExperience()
    })
  }
  openEducationModal(){
    const modalRef: NgbModalRef = this.modalService.open(EducationFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=this.user
    modalRef.result.then((res)=>{
      this.getEducation()
    })
  }
  openSkillsModal(){
    const modalRef: NgbModalRef = this.modalService.open(SkillsFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    }); 
    modalRef.componentInstance.payload=this.user
    modalRef.result.then((res)=>{
      this.getSkill()
    })
  }
  openLanguageModal(){
    const modalRef: NgbModalRef = this.modalService.open(LanguageModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    }); 
    modalRef.componentInstance.payload=this.user
    modalRef.result.then((res)=>{
      this.getLanguage()
    })
  }
  openEditCertifModal(obj:any){
    const modalRef: NgbModalRef = this.modalService.open(EditCertificationFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });     
    modalRef.componentInstance.payload=obj
    modalRef.result.then((res)=>{
      this.getCertification()
    })
  }
  openCertiFile(cert:any){
      window.open(this.certFileUrl+cert.cert_file)
  }
  openCertiFileNotFound(){
    this.toastr.error('File not found or missing', 'Error');
  }
  openEditProjectModal(obj:any){
    const modalRef: NgbModalRef = this.modalService.open(EditProjectFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=obj
    modalRef.result.then((res)=>{
      this.getProject()
    })
  }
  openEditExpModal(obj:any){
    const modalRef: NgbModalRef = this.modalService.open(EditExperienceFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });     
    modalRef.componentInstance.payload=obj
    modalRef.result.then((res)=>{
      this.getExperience()
    })
  }
  openEditEducationModal(obj:any){
    const modalRef: NgbModalRef = this.modalService.open(EditEducationFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=obj
    modalRef.result.then((res)=>{
      this.getEducation()
    })
  }
  openEditSkillsModal(obj:any){
    const modalRef: NgbModalRef = this.modalService.open(EditSkillsFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    }); 
    modalRef.componentInstance.payload=obj
    modalRef.result.then((res)=>{
      this.getSkill()
    })
  }
  openEditLanguageModal(obj:any){
    const modalRef: NgbModalRef = this.modalService.open(EditLanguageModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    }); 
    modalRef.componentInstance.payload=obj
    modalRef.result.then((res)=>{
      this.getLanguage()
    })
  }
  openEditSummaryModal(obj:any){
    const modalRef: NgbModalRef = this.modalService.open(EditSummaryFormComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    }); 
    modalRef.componentInstance.payload=this.CV
    modalRef.result.then((res)=>{
      this.getSummary()
    })
  }
  openDownloadModal(projets:any,certifications:any,experiences:any,educations:any,skills:any,cv:any) {
    const modalRef: NgbModalRef = this.modalService.open(DownloadCVComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false,
    }); 
    modalRef.componentInstance.payload={cv,projets,languages:this.languages,certifications,experiences,educations,skills,user:this.user}
  }
  deleteEdu(id:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Education item has been deleted.',
          'success'
        )
        this.cvService.DeleteEducation(id).subscribe(resultat => {
          this.getEducation()  
        })
         
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Education item is safe :)',
          'error'
        )
      }
    })
  }
  deleteExp(id:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Experience item has been deleted.',
          'success'
        )
        this.cvService.DeleteExperience(id).subscribe(resultat => {
          this.getExperience()     
        })
        
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Experience item is safe :)',
          'error'
        )
      }
    })
  }
  deleteCert(id:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Certification item has been deleted.',
          'success'
        )
        this.cvService.DeleteCertification(id).subscribe(resultat => {
          this.getCertification()  
        })
        
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Certification item is safe :)',
          'error'
        )
      }
    })
  }
  deleteProj(id:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Project item has been deleted.',
          'success'
        )
        this.cvService.DeleteProject(id).subscribe(resultat => {
          this.getProject() 
        })
            
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Project item is safe :)',
          'error'
        )
      }
    })
  }
  deleteSkill(id:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Skill item has been deleted.',
          'success'
        )
        this.cvService.DeleteSkill(id).subscribe(resultat => {
          this.getSkill()
        })
             
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Skill item is safe :)',
          'error'
        )
      }
    })
  }
  deleteLanguage(id:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Language item has been deleted.',
          'success'
        )
        this.cvService.DeleteLanguage(id).subscribe(resultat => {
          this.getLanguage()
        })
             
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Skill item is safe :)',
          'error'
        )
      }
    })
  }
  getUserData(){
    this.userService.getUserById(localStorage.getItem('userId')!).subscribe(res=>{
      this.user=res
    })
  }
  onSubmit(personalData:FormGroup){
    this.loading=true
    const profileData = new FormData()
    if(this.files.length>0){
    profileData.append("firstName",personalData.value.firstName)
    profileData.append("lastName",personalData.value.lastName)
    profileData.append("phone",personalData.value.phone)
    profileData.append("address",personalData.value.address)
    profileData.append("FS",personalData.value.FS)
    profileData.append("bio",personalData.value.bio)
    profileData.append("image",this.files[0])
    profileData.append("github",personalData.value.github)
    profileData.append("linkedin",personalData.value.linkedin)
  }else{
    profileData.append("firstName",personalData.value.firstName)
    profileData.append("lastName",personalData.value.lastName)
    profileData.append("phone",personalData.value.phone)
    profileData.append("address",personalData.value.address)
    profileData.append("FS",personalData.value.FS)
    profileData.append("bio",personalData.value.bio)
    // profileData.append("image",this.files[0])
    profileData.append("github",personalData.value.github)
    profileData.append("linkedin",personalData.value.linkedin)
  }
    this.userService.updateUser(localStorage.getItem('userId')!,profileData).subscribe(resultat => {
      if(resultat){
      this.toastr.success('Profile updated successfully' , "Success")
      this.getUserData()
      this.files.pop()
      this.loading=false
    }else{
      this.toastr.error('oops! something went wrong', 'Error');
    }
    })
  }
  onValidate(securityForm:FormGroup){
    this.userService.updatePass(localStorage.getItem('userId')!,{password:securityForm.value.password}).subscribe(resultat => {
      if(resultat){
      this.toastr.success('Password changed successfully' , "Success")
      setTimeout(() => {
        window.location.reload()
        // this.router.navigate(["/dashboard/profile"])
      }, 600);    
      }else{
        this.toastr.error('oops! something went wrong', 'Error');
      }
    })
  }
  onSelect(event:any) {
    this.files.push(...event.addedFiles);
    this.image=this.files[0].name
  }
  onRemove(event:any) {
    
    this.files.splice(this.files.indexOf(event), 1);
  }
  uploadSig(){
    const sig = new FormData()
    sig.append("signature",this.files[0])
    this.userService.uploadSignature(localStorage.getItem('userId')!,sig).subscribe(res=>{
      if (res){
        this.files = []
        let mess = JSON.stringify(res)
        this.toastr.success(mess , "Success")
        this.getUser()
      }else{
        this.toastr.error('oops! something went wrong', 'Error');
      }
    })
  }
  showSig(sig : any){
    const modalRef: NgbModalRef = this.modalService.open(ShowSigComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'sm',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    }); 
    modalRef.componentInstance.payload=sig
  }
}
