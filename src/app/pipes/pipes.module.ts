import { DistancePipe } from './distance.pipe';
import { TruncatePipe } from './truncate.pipe';
import { NgModule } from "@angular/core";
import { DurationMinutesPipe } from './duration-minutes.pipe';

@NgModule({
  declarations: [TruncatePipe, DistancePipe, DurationMinutesPipe],
  exports: [TruncatePipe, DistancePipe, DurationMinutesPipe],
})
export class PipesModule { }
