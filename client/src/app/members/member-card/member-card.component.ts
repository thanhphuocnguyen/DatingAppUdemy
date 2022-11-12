import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_model/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss'],
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;
  constructor(
    private memberService: MembersService,
    private toastrService: ToastrService
  ) {}

  likeUser(username: string) {
    this.memberService.addLike(username).subscribe((_) => {
      this.toastrService.success(`You have liked ${username}.`);
    });
  }
  ngOnInit(): void {}
}
