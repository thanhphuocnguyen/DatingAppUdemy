import { ToastrService } from 'ngx-toastr';
import { AccountService } from './../_services/account.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../interfaces/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  // @Input() usersFromHomeComponent: User[] = [];
  @Output() cancelRegister = new EventEmitter();
  model: any = {};
  constructor(
    private accountService: AccountService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  register() {
    this.accountService.register(this.model).subscribe(
      (res) => {
        this.toastr.success('register successfully');
        this.cancel();
      },
      (err: any) => {
        console.log(err.error);
        this.toastr.error(err.error);
      }
    );
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
