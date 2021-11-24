import { EventsService } from './../../../services/events.service';
import { AlertController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { getRandomChipColor } from 'src/utils/Constants';

export interface TagChip {
  label: string;
  color: string;
  isCustom?: boolean
}

@Component({
  selector: 'app-tag-select',
  templateUrl: './tag-select.component.html',
  styleUrls: ['./tag-select.component.scss'],
})
export class TagSelectComponent implements OnInit {
  @Input() title = 'Select';
  @Input() context: 'popover' | 'inline' = 'inline';

  constructor(
    private alertCtrl: AlertController,
    public events: EventsService,
  ) { }

  ngOnInit() {}

  async addCustom() {
    const a = await this.alertCtrl.create({
      header: 'Other',
      inputs: [
        {
          type: 'text',
          name: 'label',
          placeholder: 'Enter interest',
        }
      ],
      buttons: ['Ok']
    });
    await a.present();
    const res = await a.onDidDismiss();
    if (res?.data?.values?.label) {
      this.events.selectTag({
        label: res?.data?.values?.label,
        isCustom: true,
        color: getRandomChipColor(),
      });
    }
  }

}
