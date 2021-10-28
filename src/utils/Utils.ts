import { merge, Observable, timer } from 'rxjs';
import { filter, mapTo, take } from 'rxjs/operators';

export class RxJsUtils {

  public static getPromiseVal<T>(thing: Observable<T>): Promise<T | null> {
    return RxJsUtils.getVal(thing).toPromise();
  }

  public static getVal<T>(thing: Observable<T>): Observable<T | null> {
    return merge(
      thing.pipe(filter((val) => !!val)),
      timer(500).pipe(mapTo(null)),
    ).pipe(take(1));
  }
}
