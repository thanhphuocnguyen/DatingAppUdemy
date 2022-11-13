import { MembersService } from './../../_services/members.service';
import { AccountService } from './../../_services/account.service';
import { Member } from 'src/app/_models/member';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss'],
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm;
  member: Member;
  user: User;
  @HostListener('window:beforeunload', ['$event']) unloadNotification(
    $event: any
  ) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }
  constructor(
    private accountService: AccountService,
    private memberService: MembersService,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    this.loadMemeber();
  }

  loadMemeber() {
    this.memberService
      .getMemberByUserName(this.user.userName)
      .subscribe((member) => (this.member = member));
  }

  updateMember() {
    this.memberService.updateMember(this.member).subscribe((result) => {
      this.toastr.success('Profile updated successfully');
      this.editForm.reset(this.member);
    });
  }
}
