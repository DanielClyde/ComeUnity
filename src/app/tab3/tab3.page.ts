import { ToastService } from './../services/toast.service';
import { RxJsUtils } from './../../utils/Utils';
import { UserService } from './../services/user.service';
import { Range, UserPreferences } from 'comeunitymodels';
import { Router } from '@angular/router';
import { SessionService } from './../services/session.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  RangeMap = {
    0: Range.FIVE,
    1: Range.TEN,
    2: Range.TWENTY_FIVE,
    3: Range.FIFTY,
    4: Range.HUNDRED,
  };

  RangeMapBack = {
    [Range.FIVE]: 0,
    [Range.TEN]: 1,
    [Range.TWENTY_FIVE]: 2,
    [Range.FIFTY]: 3,
    [Range.HUNDRED]: 4,
  };

  constructor(
    public session: SessionService,
    private router: Router,
    private userService: UserService,
    private toast: ToastService,
  ) { }

  logout() {
    this.session.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async rangeUnitChange(event: any) {
    const u = await RxJsUtils.getPromiseVal(this.session.user$);
    if (u) {
      const preferences: UserPreferences = {
        ...u.preferences,
        distanceUnits: event.detail.value,
      };
      const { success, user } = await this.userService.updateUserDoc(u._id, { preferences });
      if (success && user) {
        this.session.userFetched(user);
        this.toast.showToast('Updated preferences!');
      } else {
        this.toast.showToast('Failed to update preferences', 2000, 'danger');
      }
    }
  }

  async rangeChange(range: Range) {
    const u = await RxJsUtils.getPromiseVal(this.session.user$);
    if (u) {
      const preferences: UserPreferences = {
        ...u.preferences,
        distanceRange: range
      };
      const { success, user } = await this.userService.updateUserDoc(u._id, { preferences });
      if (success && user) {
        this.session.userFetched(user);
        this.toast.showToast('Updated preferences!');
      } else {
        this.toast.showToast('Failed to update preferences', 2000, 'danger');
      }
    }
  }
}
