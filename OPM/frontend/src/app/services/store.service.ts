import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(
    private _http: HttpClient
  ) { }

  public activeContractSubject = new BehaviorSubject<any | null>(null);
  activeContract$ = this.activeContractSubject.asObservable();

  private activeSiteSubject = new BehaviorSubject<any | null>(null);
  activeSite$ = this.activeSiteSubject.asObservable();

  setActiveContract(contract: any) {
    this.activeContractSubject.next(contract)
  }
  setActiveSite(site: any) {
    this.activeSiteSubject.next(site)
  }

  getContractById(id: string) {
    this._http.get<any>(`${environment.apiUrl}/contract/getContractById/${id}`).subscribe(
      res => {
        // console.log("contract in store", res)
        this.setActiveContract(res.rows);
      }
    )
  }
  getSiteById(id: string) {
    this._http.get<any>(`${environment.apiUrl}/site/getSiteById/${id}`).subscribe(
      res => {
        // console.log("site in store", res)
        this.setActiveSite(res.rows);
      }
    )
  }


  createContract(data: any, id: string) {
    return this._http.post(`${environment.apiUrl}/contract/createContract`, { data, folderID: id })
  }
  updateContract(data: any, id: string) {
    this._http.put(`${environment.apiUrl}/contract/updateContract`, { ...data, _id: id }).subscribe(
      (res: any) => {
        let activeContract = this.activeContractSubject.value;
        activeContract = res.rows;
        this.activeContractSubject.next(activeContract);
        Swal.fire({
          title: 'Success!',
          text: 'The Contract has been successfully updated.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }
  createSite(payload) {
    return this._http.post(`${environment.apiUrl}/contract/addSite`, payload);

  }
  addFileContract(data) {
    this._http.post<any>(`${environment.apiUrl}/contract/addlistFileContract`, data).subscribe(
      res => {
        const activeContract = this.activeContractSubject.value;
        if (Array.isArray(res.rows)) {
          res.rows.forEach(file => {
            activeContract.listOfFiles.push(file);
          });
        } else {
          activeContract.listOfFiles.push(res.rows);
        }
        this.activeContractSubject.next(activeContract);
      }
    );
    Swal.fire({
      title: 'Success!',
      text: 'The Files has been successfully added.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  addTeam(data: any) {
    let URL = "";
    let payload = {};
    const contractID = this.activeContractSubject.value._id;
    if (data.type == "technician") {
      URL = "/contract/addTechnician";
      payload = {
        contractId: contractID,
        technician: data.dynamicListInput,
        teamLeader: data.isTeamLeader
      };
    } else if (data.type == "commercial") {
      URL = "/contract/addCommercial";
      payload = {
        contractId: contractID,
        commercial: data.dynamicListInput
      };
    }
    this._http.post<any>(`${environment.apiUrl}${URL}`, payload).subscribe(
      res => {
        const activeContract = this.activeContractSubject.value;
        if (data.type == "technician") {
          activeContract.technicians = res.rows;
        } else {
          activeContract.commercial = res.rows;
        }
        this.activeContractSubject.next(activeContract);
        Swal.fire({
          title: 'Success!',
          text: 'The user has been successfully added.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }

  deleteTechInContract(id: string) {
    const contractID = this.activeContractSubject.value._id;
    this._http.post<any>(`${environment.apiUrl}/contract/deleteMemberEquipefromContract`, { contractID, id: id }).subscribe(
      res => {
        const activeContract = this.activeContractSubject.value;
        activeContract.technicians = activeContract.technicians.filter(e => e.technician._id != id)
        this.activeContractSubject.next(activeContract);
      }
    )
  }
  deleteRespInContract() {
    const contractID = this.activeContractSubject.value._id;
    this._http.post<any>(`${environment.apiUrl}/contract/deleteResponsableEquipeContract`, { contractID, }).subscribe(
      res => {
        const activeContract = this.activeContractSubject.value;
        activeContract.responsableEquipeTechnique = null;
        this.activeContractSubject.next(activeContract);
      }
    )
  }

  addCustomer(typeAccount: string, data: any, folderID: string) {
    let URL = "";
    let payload = {};
    const contractID = this.activeContractSubject.value._id;


    payload = { data, folderID, contractId: contractID };
    URL = "/contract/addClient";

    this._http.post<any>(`${environment.apiUrl}${URL}`, payload).subscribe(
      res => {
        const activeContract = this.activeContractSubject.value;
        activeContract.clients.push(res.rows);
        this.activeContractSubject.next(activeContract);
        Swal.fire({
          title: 'Success!',
          text: 'The Customer has been successfully added',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }
  addOldCustomer(data) {
    this._http.post(`${environment.apiUrl}/client/affectOledCustemer`, { data }).subscribe(
      (res: any) => {
        const activeContract = this.activeContractSubject.value;
        if (data.clients !== null) {
          activeContract.clients = res.rows.updatedContract.clients;
        }
        this.activeContractSubject.next(activeContract);
        Swal.fire({
          title: 'Success!',
          text: 'The Customer has been successfully added',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    )
  }
  updateCustomerUser(data: any, id: string) {
    this._http.put(`${environment.apiUrl}/contract/updateCustomers`, { _id: id, ...data }).subscribe(
      (res: any) => {
        if (res.err === false) {
          let activeContract = this.activeContractSubject.value;
          const index = activeContract.associatedCustomerList.findIndex((visite: any) => visite._id === id);
          if (index !== -1) {
            activeContract.associatedCustomerList[index] = res.rows;
            this.activeContractSubject.next(activeContract);
            Swal.fire({
              title: 'Success!',
              text: 'The Customer has been successfully updated.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }
        }
      },
    );
  }
  addHealthCheck(data: any, contractId: string) {
    this._http.post(`${environment.apiUrl}/healthCheck/createHealhCheck`, { data, contractId }).subscribe(
      (res: any) => {
        let activeContract = this.activeContractSubject.value;
        activeContract.healthChecklist = res.rows.healthChecklist;
        this.activeContractSubject.next(activeContract);
        Swal.fire({
          title: 'Success!',
          text: 'The Health Check has been successfully added.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }

  updateHealthCheck(data: any, id: string) {
    this._http.put(`${environment.apiUrl}/healthCheck/updateHealthCheck`, { _id: id, ...data }).subscribe(
      (res: any) => {
        if (res.err === false) {
          let activeContract = this.activeContractSubject.value;
          const index = activeContract.healthChecklist.findIndex((healthCheck: any) => healthCheck._id === id);
          if (index !== -1) {
            activeContract.healthChecklist[index] = res.rows;
            this.activeContractSubject.next(activeContract);
            Swal.fire({
              title: 'Success!',
              text: 'The Health Check has been successfully updated.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }
        }
      },
    );
  }

  addVisite(data: any, id: string) {
    this._http.post(`${environment.apiUrl}/contract/addOnePlanificationVistePreventive`, { data, contractID: id }).subscribe(
      (res: any) => {
        let activeContract = this.activeContractSubject.value;
        activeContract.Vistepreventive = res.rows;
        this.activeContractSubject.next(activeContract);
        Swal.fire({
          title: 'Success!',
          text: 'The preventive visit has been successfully added.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }

  updateVisite(id: string, data: any) {
    this._http.post(`${environment.apiUrl}/contract/updateVisitePrev`, { _id: id, ...data }).subscribe(
      (res: any) => {
        if (res.err === false) {
          let activeContract = this.activeContractSubject.value;
          const index = activeContract.Vistepreventive.findIndex((visite: any) => visite._id === id);
          if (index !== -1) {
            activeContract.Vistepreventive[index] = res.rows;
            this.activeContractSubject.next(activeContract);
            Swal.fire({
              title: 'Success!',
              text: 'The preventive visit has been successfully updated.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }
        }
      },
    );
  }

  addEquipmentHard(data: any, id: string, contractId: string) {
    this._http.post(`${environment.apiUrl}/equipment/createEquipment`, { data, siteId: id, contractId: contractId }).subscribe(
      (res: any) => {
        let activeSite = this.activeSiteSubject.value;
        activeSite.listEquipment = res.data.listEquipment;
        this.activeSiteSubject.next(activeSite);
        Swal.fire({
          title: 'Success!',
          text: 'The Hard Equipment has been successfully added.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }

  updateEquipmentHard(id: string, contractId: string, data: any) {
    this._http.post(`${environment.apiUrl}/equipment/updateEquipment`, { _id: id, contractId: contractId, ...data }).subscribe(
      (res: any) => {
        if (res.err === false) {
          let activeSite = this.activeSiteSubject.value;
          const index = activeSite.listEquipment.findIndex((visite: any) => visite._id === id);
          if (index !== -1) {
            activeSite.listEquipment[index] = res.rows;
            this.activeSiteSubject.next(activeSite);
            Swal.fire({
              title: 'Success!',
              text: 'The Hard Equipment has been successfully updated.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }
        }
      },
    );
  }

  addEquipmentSoft(data: any, id: string, contractId: string) {
    this._http.post(`${environment.apiUrl}/equipmentsoft/createEquipmentSoft`, { data, siteId: id, contractId: contractId }).subscribe(
      (res: any) => {
        let activeSite = this.activeSiteSubject.value;
        activeSite.listEquipmentSoft = res.rows.listEquipmentSoft;
        this.activeSiteSubject.next(activeSite);
        Swal.fire({
          title: 'Success!',
          text: 'The Soft Equipment has been successfully added.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }

  updateEquipmentSoft(data: any, id: string, contractId: string) {
    this._http.put(`${environment.apiUrl}/equipmentSoft/updateEquipmentSoft`, { _id: id, ...data, contractId: contractId }).subscribe(
      (res: any) => {
        if (res.err === false) {
          let activeSite = this.activeSiteSubject.value;
          const index = activeSite.listEquipmentSoft.findIndex((EquipmentSoft: any) => EquipmentSoft._id === id);
          if (index !== -1) {
            activeSite.listEquipmentSoft[index] = res.rows;
            this.activeSiteSubject.next(activeSite);
            Swal.fire({
              title: 'Success!',
              text: 'The Soft Equipment has been successfully updated.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }
        }
      },
    );
  }

  addImportEquipmentHard(payload: any) {
    this._http.post(`${environment.apiUrl}/equipment/createImportinEquipmentHared`, payload).subscribe(
      (res: any) => {
        let activeSite = this.activeSiteSubject.value;
        activeSite.listEquipment = res.rows.listEquipment;
        this.activeSiteSubject.next(activeSite);
        Swal.fire({
          title: 'Success!',
          text: 'The Hard Equipment has been successfully added.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }
  addImportEquipmentSoft(payload: any) {
    this._http.post(`${environment.apiUrl}/equipmentsoft/createImportinEquipmentSoft`, payload).subscribe(
      (res: any) => {
        let activeSite = this.activeSiteSubject.value;
        activeSite.listEquipmentSoft = res.rows.listEquipmentSoft;
        this.activeSiteSubject.next(activeSite);
        Swal.fire({
          title: 'Success!',
          text: 'The Soft Equipment has been successfully added.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
    );
  }
  shareFile(data: any) {
    this._http.put(`${environment.apiUrl}/contract/sharefile`, data).subscribe(
      (res: any) => {
        if (res && res.rows) {
          let activeContract = this.activeContractSubject.value;
          if (activeContract) {
            const index = activeContract.listOfFiles.findIndex((file: any) => file._id === data.fileId);
            if (index !== -1) {
              // Create a new array reference to trigger change detection
              const updatedFiles = [...activeContract.listOfFiles];
              updatedFiles[index] = res.rows;
              // Update the contract with a new object reference
              this.activeContractSubject.next({
                ...activeContract,
                listOfFiles: updatedFiles
              });
  
              Swal.fire({
                title: 'Success!',
                text: 'File shared successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
              });
            }
          }
        }
      },
    );
  }
  
  
}
