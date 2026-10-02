import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from "@angular/material/snack-bar";

@Injectable({
    providedIn : 'root'
})
export class MessageService {

    constructor(private _snackBar: MatSnackBar){}


    private horizontalPosition: MatSnackBarHorizontalPosition = 'end';
    private verticalPosition: MatSnackBarVerticalPosition = 'top';   
    private duraction = 2000; 

    showSuccessMessage(message : string) {
        this._snackBar.open(message, 'X', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration : this.duraction,
          panelClass: ['style-success']
        });
    }
    showErrorMessage(message : string) {
        this._snackBar.open(message, 'X', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration : this.duraction,
          panelClass: ['style-error']
        });
    }
}