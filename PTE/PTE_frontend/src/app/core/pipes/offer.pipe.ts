import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'offer'
})
export class OfferPipe implements PipeTransform {

  transform(value: string, maxLength: number = 200): string {
    if (value !== null) {
      if (value.length <= maxLength) {
        return value;
      }else{
        return value.substring(0, maxLength) + '...';
      }
    }
    return ""
  }

}
