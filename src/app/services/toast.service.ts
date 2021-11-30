import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toast: ToastController) { }

  async showToast(message: string, duration = 2000, color = 'success') {
    const t = await this.toast.create({
      message,
      duration,
      color
    });
    await t.present();
  }
}
