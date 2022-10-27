import { AccountService } from './../_services/account.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  model: any = {};
  currentUser$: Observable<User>;
  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.currentUser$ = this.accountService.currentUser$;
  }

  login() {
    this.accountService.login(this.model).subscribe(
      (response) => {},
      (err) => {
        console.log(err);
      }
    );
  }

  logout() {
    this.accountService.logout();
  }
}
