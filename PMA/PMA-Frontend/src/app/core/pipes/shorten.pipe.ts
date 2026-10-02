import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shorten', standalone: true, pure: true })
export class ShortenPipe implements PipeTransform {
  transform(item: string | null, size : number): string {
    if (!item) {
      return '';
    }
    return item.length > size ? `${item.substring(0, size)}...` : item;
  }
}
