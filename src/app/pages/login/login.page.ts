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
  credentials: FormGroup;
  get emailControl(): AbstractControl { return this.credentials.get('email'); }
  get passwordControl(): AbstractControl { return this.credentials.get('password'); }

  constructor(
    private fb: FormBuilder,
    private session: SessionService,
    private router: Router,
    private loadingCtl: LoadingController,
    private toast: ToastController,
    private modalCtl: ModalController,
    private elementRef: ElementRef,
  ) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    StatusBar.setStyle({ style: Style.Light });
  }

  async appleAuthenticate() {
    if (Capacitor.getPlatform() !== 'ios') {
      this.showToast('Sign in with Apple is only available on iOS devices');
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
      this.showToast('Failed to authenticate');
    }
  }

  googleAuthenticate() {
    this.showToast('Sign in with Google unavailable at this time');
  }

  async login() {
    if (this.credentials.valid) {
      const loading = await this.loadingCtl.create();
      await loading.present();

      try {
        const { success, user } = await this.session.loginWithCredentials(this.credentials.value.email, this.credentials.value.password);
        await loading.dismiss();
        if (success) {
          this.router.navigateByUrl('/home', { replaceUrl: true });
        } else {
          this.showToast('Failed to authenticate');
        }
      } catch (e) {
        console.log(e);
        await loading.dismiss();
        this.showToast('Failed to authenticate');
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

  private async showToast(message: string, duration = 2000, color = 'danger'): Promise<void> {
    const t = await this.toast.create({
      message,
      duration,
      color,
    });
    await t.present();
  }



}
