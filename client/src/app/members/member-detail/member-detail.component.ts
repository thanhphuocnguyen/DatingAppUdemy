import { MembersService } from './../../_services/members.service';
import { Member } from './../../_model/member';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent implements OnInit {
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(
    private memberService: MembersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadMemeber();
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

  loadMemeber() {
    this.memberService
      .getMemberByUserName(this.route.snapshot.paramMap.get('username'))
      .subscribe((member: Member) => {
        this.member = member;
        this.galleryImages = this.getImages();
      });
  }
}
