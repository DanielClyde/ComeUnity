import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  private defaultLength = 18;

  transform(value: string, length?: number): string {
    if (value.length > (length || this.defaultLength)) {
      return value.substr(0, (length ? length - 3 : this.defaultLength - 3)) + '...';
    } else {
      return value;
    }
  }

}
