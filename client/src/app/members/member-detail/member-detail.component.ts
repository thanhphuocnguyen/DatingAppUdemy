import { MembersService } from './../../_services/members.service';
import { Member } from '../../_models/member';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';
import { PresenceService } from 'src/app/_services/presence.service';
import { AccountService } from 'src/app/_services/account.service';
import { take } from 'rxjs/operators';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent;
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  messages: Message[] = [];
  activeTab: TabDirective;
  user: User;

  constructor(
    public presence: PresenceService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.member = data.member;
      this.galleryImages = this.getImages();
    });
    this.route.queryParams.subscribe((params) => {
      params?.tab ? this.selectTab(params.tab) : this.selectTab(0);
    });
    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
      },
    ];
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls: NgxGalleryImage[] = [];
    for (const image of this.member.photos) {
      console.log(image.url);
      imageUrls.push({
        small: image?.url,
        medium: image?.url,
        big: image?.url,
      });
    }
    return imageUrls;
  }

  // loadMemeber() {
  //   this.memberService
  //     .getMemberByUserName(this.route.snapshot.paramMap.get('username'))
  //     .subscribe((member: Member) => {
  //       this.member = member;
  //     });
  // }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  loadMessages() {
    this.messageService
      .getMessageThread(this.member.userName)
      .subscribe((mess) => {
        this.messages = mess;
      });
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0) {
      this.messageService.createHubConnection(this.user, this.member.userName);
    } else {
      this.messageService.stopHubConnection();
    }
  }
}
