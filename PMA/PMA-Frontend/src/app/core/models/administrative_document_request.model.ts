import { AdministrativeDocumentType } from "./administrative_document_type.model";
import { Company } from "./company.models";
import { User } from "./user.model";

export class AdministrativeDocumentRequest {
    _id : string;
    documentType : AdministrativeDocumentType;
    user : User;
    company : Company;
    requestedDate? : Date;
    issuedDate? : Date;
    validUntil? : Date;
    issuer : Date;
    status : string;
    attachments? : string[];
    comment? : string;
}