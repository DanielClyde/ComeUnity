import { BehaviorSubject, Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: InputComponent, multi: true }],
})
export class InputComponent implements ControlValueAccessor {

  @Input() icon?: string;
  @Input() placeholder?: string;
  @Input() autocapitalize = 'off';
  @Input() type?: string;
  @Input() inputmode?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get value() { return this._value$.value; }
  readonly value$: Observable<string>;

  get disabled() { return this._disabled$.value; }
  readonly disabled$: Observable<boolean>;

  get showingPassword() { return this._showingPassword$.value; }
  readonly showingPassword$: Observable<boolean>;

  get isDirty() { return this._isDirty$.value; }
  readonly isDirty$: Observable<boolean>;

  get isFocused() { return this._isFocused$.value; }
  readonly isFocused$: Observable<boolean>;

  private _value$ = new BehaviorSubject<string>('');
  private _disabled$ = new BehaviorSubject<boolean>(false);
  private _showingPassword$ = new BehaviorSubject<boolean>(false);
  private _isDirty$ = new BehaviorSubject<boolean>(false);
  private _isFocused$ = new BehaviorSubject<boolean>(false);

  private _onChange: (value: string) => void;
  private _onTouched: () => void;


  constructor() {
    this.value$ = this._value$.asObservable();
    this.disabled$ = this._disabled$.asObservable();
    this.showingPassword$ = this._showingPassword$.asObservable();
    this.isDirty$ = this._isDirty$.asObservable();
    this.isFocused$ = this._isFocused$.asObservable();
  }

  writeValue(value: string): void {
    if (value !== this.value) {
      this._value$.next(value);
    }
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this._disabled$.next(isDisabled);
  }

  onChange(value: string) {
    if (value !== this.value) {
      this._value$.next(value);
      if (this._onChange) {
        this._onChange(value);
      }
    }
  }

  toggleShowingPassword() {
    this._showingPassword$.next(!this.showingPassword);
  }

  onFocus() {
    this._isFocused$.next(true);
  }

  onBlur() {
    this._isFocused$.next(false);
    if (this._onTouched) {
      this._onTouched();
    }
  }

}
