import { UserService } from './../../services/user.service';
import { SessionService } from './../../services/session.service';
import { StorageService, StorageKeys } from './../../services/storage.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {
  GeneralInterests: { label: string, color: string }[] = [
    { label: 'Movies', color: 'dark' },
    { label: 'Sports', color: 'warning' },
    { label: 'Crafts', color: 'tertiary' },
    { label: 'Music', color: 'success' },
    { label: 'Outdoors', color: 'danger' },
    { label: 'Video Games', color: 'primary' },
    { label: 'Books', color: 'dark' },
    { label: 'Computers', color: 'warning' },
    { label: 'Theater', color: 'tertiary' },
  ];

  selected: { label: string, color: string, isCustom?: boolean }[] = [];

  private customColorIndex = 0;

  constructor(
    private router: Router,
    private storage: StorageService,
    private alertCtrl: AlertController,
    private toast: ToastController,
    private load: LoadingController,
    public session: SessionService,
    private users: UserService,
  ) { }

  ngOnInit() {
  }

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
      this.selected = [
        ...this.selected,
        {
          label: res?.data?.values?.label,
          color: this.getRandomColor(),
          isCustom: true
        },
      ];
    }
  }

  select(interest: { label: string, color: string, isCustom?: boolean }) {
    this.selected = [...this.selected, interest];
    this.GeneralInterests = this.GeneralInterests.filter((i) => i.label !== interest.label);
  }

  deselect(interest: { label: string, color: string, isCustom?: boolean }) {
    this.selected = this.selected.filter((i) => i.label !== interest.label);
    if (!interest.isCustom) {
      this.GeneralInterests = [...this.GeneralInterests, interest];
    }
  }

  async save() {
    const l = await this.load.create({
      message: 'Updating interests...',
    });
    await l.present();
    const { success, user } = await this.users.updateUserInterests(this.session.user$.value?._id, this.selected.map((s) => s.label.toLowerCase()));
    await l.dismiss();
    if (success && user) {
      this.session.userFetched(user);
      await this.showToast('Your interests have been saved!');
      setTimeout(() => {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }, 2000);
    } else {
      await this.showToast('Failed to save changes!', 'danger');
    }
  }

  private getRandomColor(): string {
    this.customColorIndex = (this.customColorIndex + 1) % 6;
    return ['dark', 'warning', 'tertiary', 'success', 'danger', 'primary'][this.customColorIndex];
  }

  private async showToast(message: string, color = 'success') {
    const t = await this.toast.create({
      message,
      color,
      duration: 2000,
    });
    await t.present();
  }

}
