import { StorageService, StorageKeys } from './../../services/storage.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {
  @ViewChild(IonSlides) slides: IonSlides;

  constructor(private router: Router, private storage: StorageService) { }

  ngOnInit() {
  }

  next() {
    this.slides?.slideNext();
  }

  async start() {
    await this.storage.setBoolInStorage(StorageKeys.INTRO_SEEN, true);
    this.router.navigateByUrl('/tabs', { replaceUrl: true });
  }

}
