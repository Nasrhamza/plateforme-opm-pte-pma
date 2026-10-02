import { Injectable } from '@angular/core';
import { Equipmenthared } from './equipmenthared.model';
import { Equipmentsoft } from './/equipmentsoft.model';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {
  constructor() { }

  parseCsvHared(file: File): Promise<Equipmenthared[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          resolve(result.data as Equipmenthared[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  parseCsvSoft(file: File): Promise<Equipmentsoft[]> { 
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          resolve(result.data as Equipmentsoft[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
}
