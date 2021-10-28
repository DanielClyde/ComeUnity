import { Router } from '@angular/router';
import { SessionService } from './../services/session.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(private session: SessionService, private router: Router) { }

  logout() {
    this.session.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
