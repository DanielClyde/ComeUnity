import { Haptics } from '@capacitor/haptics';
import { ToastService } from './../../services/toast.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { RegisterComponent } from './register/register.component';
import { Capacitor } from '@capacitor/core';
import { HttpService } from './../../services/http.service';
import { environment } from './../../../environments/environment';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import { SessionService } from './../../services/session.service';
import { Router } from '@angular/router';
import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isAndroid = false
  credentials: FormGroup;
  get emailControl(): AbstractControl { return this.credentials.get('email'); }
  get passwordControl(): AbstractControl { return this.credentials.get('password'); }

  constructor(
    private fb: FormBuilder,
    private session: SessionService,
    private router: Router,
    private loadingCtl: LoadingController,
    private toast: ToastService,
    private modalCtl: ModalController,
    private elementRef: ElementRef,
  ) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    StatusBar.setStyle({ style: Style.Light });
    this.isAndroid = Capacitor.getPlatform() === 'android';
  }

  async appleAuthenticate() {
    if (Capacitor.getPlatform() !== 'ios') {
      this.toast.showToast('Sign in with Apple is only available on iOS devices', 2000, 'danger');
      return;
    }
    const l = await this.loadingCtl.create();
    await l.present();
    try {
      const res = await SignInWithApple.authorize({
        clientId: 'com.comeunity.comeunityapp',
        scopes: 'email name',
      } as any);
      const { success, user } = await this.session.loginWithAppleResponse(res.response);
      await l.dismiss();
      if (success) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    } catch (e) {
      console.log(e);
      await l.dismiss();
      this.toast.showToast('Failed to authenticate', 2000, 'danger');
    }
  }

  googleAuthenticate() {
    this.toast.showToast('Sign in with Google unavailable at this time', 2000, 'danger');
  }

  async login() {
    if (this.credentials.valid) {
      const loading = await this.loadingCtl.create();
      await loading.present();

      try {
        const { success, user } = await this.session.loginWithCredentials(this.credentials.value.email, this.credentials.value.password);
        await loading.dismiss();
        if (success) {
          if (Capacitor.isNativePlatform()) {
            await Haptics.impact();
          }
          this.router.navigateByUrl('/home', { replaceUrl: true });
        } else {
          this.toast.showToast('Failed to authenticate', 2000, 'danger');
        }
      } catch (e) {
        console.log(e);
        await loading.dismiss();
        this.toast.showToast('Failed to authenticate', 2000, 'danger');
      }
    }
  }

  async register() {
    const m = await this.modalCtl.create({
      mode: 'ios',
      presentingElement: this.elementRef.nativeElement,
      component: RegisterComponent,
      swipeToClose: true,
      showBackdrop: true,
    });
    await m.present();
  }
}
