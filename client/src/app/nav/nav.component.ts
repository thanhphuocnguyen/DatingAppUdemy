import { MembersService } from 'src/app/_services/members.service';
import { AccountService } from '../_services/account.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  model: any = {};
  currentUser$: Observable<User>;
  constructor(
    private accountService: AccountService,
    private memberService: MembersService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.accountService.currentUser$;
  }

  login() {
    this.accountService.login(this.model).subscribe(
      (_response) => {
        this.router.navigateByUrl('/members');
        this.toastr.success('Logged in successfully');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  logout() {
    this.router.navigateByUrl('/');
    this.memberService.resetUserParams();
    this.accountService.logout();
  }
}
