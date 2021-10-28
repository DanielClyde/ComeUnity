import { UserService } from './../../../services/user.service';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [
    trigger('growInOut', [
      transition(':enter', [
        style({opacity: '0', transform: 'translateY(-10px)'}),
        animate('300ms ease-out', style({opacity: '1', transform: 'translateY(0px)'})),
      ]),
      transition(':leave', [
        style({opacity: '*', transform: 'translateY(0px)'}),
        animate('300ms ease-out', style({opacity: '0', transform: 'translateY(-10px)'})),
      ]),
    ]),
  ],
})
export class RegisterComponent implements OnInit {
  registration: FormGroup;
  showError = new BehaviorSubject<boolean>(false);

  constructor(private fb: FormBuilder, private users: UserService) { }

  ngOnInit() {
    this.registration = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    const control = new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      passwordConfirmValidator(this.registration.get('password')),
    ]);
    this.registration.addControl('passwordConfirm', control);
    control.statusChanges.pipe(distinctUntilChanged()).subscribe((s) => {
      if (control.errors?.passwordConfirm) {
        this.showError.next(true);
      } else {
        this.showError.next(false);
      }
    });
  }

  async registerClicked() {
    if (this.registration.valid) {
      const res = await this.users.createUser({
        ...this.registration.value,
      });
      console.log(res);
      if (res.success && res.user) {

      } else {

      }
    }
  }
}

function passwordConfirmValidator(passwordControl: AbstractControl): (c: AbstractControl) => ValidationErrors {
  return (ac: AbstractControl) => {
    if (passwordControl.valid && passwordControl.value !== ac.value) {
      return {
        passwordConfirm: 'The two given passwords do not match',
      };
    } else {
      return null;
    }
  }
}
