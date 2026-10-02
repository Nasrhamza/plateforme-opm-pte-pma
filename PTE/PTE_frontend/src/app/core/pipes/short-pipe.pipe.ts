import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortPipe'
})
export class ShortPipePipe implements PipeTransform {

  transform(value: string, maxLength: number = 197): string {
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
