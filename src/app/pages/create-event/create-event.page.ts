import { Capacitor } from '@capacitor/core';
import { CameraService } from './../../services/camera.service';
import { Address, Coords } from 'comeunitymodels';
import { map, startWith, switchMap, distinctUntilChanged, pairwise, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Subject, BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { PlacesService } from './../../services/places.service';
import { EventsService } from './../../services/events.service';
import { getRandomChipColor } from 'src/utils/Constants';
import { SessionService } from './../../services/session.service';
import { RxJsUtils } from './../../../utils/Utils';
import { TagSelectComponent } from './tag-select/tag-select.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, PopoverController, ModalController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { Haptics } from '@capacitor/haptics';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.page.html',
  styleUrls: ['./create-event.page.scss'],
})
export class CreateEventPage implements OnInit, OnDestroy {

  @ViewChild('addressSearch') addressSearch: IonSearchbar;

  now = new Date().toISOString();
  nextYear = moment().add(1, 'year').startOf('day').toISOString();


  detailsForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    addressDescription: new FormControl('', [Validators.required]),
    addressCoordinates: new FormControl(null, [Validators.required]),
    tags: new FormControl(null, [Validators.required]),
    dateStart: new FormControl(null, [Validators.required]),
    timeStart: new FormControl(null, [Validators.required]),
    timeEnd: new FormControl(null, [Validators.required]),
    imgDataUrl: new FormControl('', [Validators.required]),
  });

  selectedPrediction = new BehaviorSubject<{ description: string, place_id: string }>(null);
  addressPredictions: Observable<{ description: string, place_id: string }[]>;
  showPredictions = new BehaviorSubject<boolean>(false);

  destroyed = new Subject();

  constructor(
    private popover: PopoverController,
    private session: SessionService,
    public events: EventsService,
    private places: PlacesService,
    private modalCtl: ModalController,
    private toast: ToastController,
    private camera: CameraService,
  ) { }

  async ngOnInit() {
    const u = await RxJsUtils.getPromiseVal(this.session.user$);
    this.events.availableTags.next(u.interests.map((label) => {
      return { label, color: getRandomChipColor() }
    }));
    this.events.selectedTags.next([]);

    this.addressPredictions = this.addressSearch.ionChange.pipe(
      map((event) => event?.detail?.value),
      distinctUntilChanged(),
      withLatestFrom(this.showPredictions),
      switchMap(([query, showPredictions]) => {
        if (!query) {
          this.selectedPrediction.next(null);
        }

        if (!showPredictions || !query) {
          return of([]);
        } else {
          return this.places.search(query);
        }
      }),
      startWith([]),
    );

    this.setupSubscriptions();
  }

  setupSubscriptions() {
    this.addressSearch.ionInput.pipe(
      takeUntil(this.destroyed),
    ).subscribe(() => {
      this.showPredictions.next(true);
    });

    this.selectedPrediction.pipe(
      switchMap((prediction) => {
        if (prediction) {
          this.detailsForm.get('addressDescription').setValue(prediction.description);
          return this.places.geocode(prediction.place_id);
        } else {
          return of(null);
        }
      }),
      takeUntil(this.destroyed),
    ).subscribe((coords) => {
      this.detailsForm.get('addressCoordinates').setValue(coords);
    });

    this.events.selectedTags.pipe(
      takeUntil(this.destroyed),
      map((selected) => selected?.length ? selected.map((chip) => chip.label.toLowerCase().trim()) : null)
    ).subscribe((selected) => {
      this.detailsForm.get('tags').setValue(selected);
    })
  }

  ngOnDestroy() {
    this.destroyed.next();
  }

  selectAddressPrediction(prediction: { description: string, place_id: string }) {
    this.addressSearch.value = prediction.description;
    this.selectedPrediction.next(prediction);
    this.showPredictions.next(false);
  }

  async changePhoto() {
    if (Capacitor.isNativePlatform()) {
      await Haptics.selectionEnd();
    }
    const photo = await this.camera.getPhoto({promptLabelHeader: (this.detailsForm.get('title').value || 'Event') + ' Photo'});
    this.detailsForm.get('imgDataUrl').setValue(photo?.dataUrl);
  }

  async submit() {
    if (this.detailsForm.valid) {
      const u = await RxJsUtils.getPromiseVal(this.session.user$);
      const formValue = this.detailsForm.value;
      const timeStart = moment(formValue.timeStart);
      const startsAt = moment(formValue.dateStart)
        .set('h', timeStart.hour())
        .set('minutes', timeStart.minutes()).toDate();

      const durationMinutes = moment(formValue.timeEnd).diff(timeStart, 'minutes');
      const { success, event } = await this.events.postEvent({
        title: formValue.title,
        imgUrl: formValue.imgDataUrl,
        description: formValue.description,
        address: new Address({
          description: formValue.addressDescription,
          coords: new Coords(formValue.addressCoordinates),
        }),
        announcements: [],
        comments: [],
        interestTags: formValue.tags,
        startsAt,
        durationMinutes,
        createdBy: u?._id,
      });

      if (success) {
        this.modalCtl.dismiss({ success, event });
        this.showToast('Event successfully posted!', 'success');
      } else {
        this.showToast('Unable to post event at this time.');
      }
    }
  }

  async editTags() {
    const p = await this.popover.create({
      component: TagSelectComponent,
      componentProps: {
        title: 'Select Tags',
        context: 'popover',
      },
      backdropDismiss: true,
    });
    await p.present();
    await p.onDidDismiss();
  }

  private async showToast(message: string, color = 'danger') {
    const t = await this.toast.create({
      message,
      color,
      duration: 2000,
    });
    await t.present();
  }

}
