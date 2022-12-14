import { Photo } from '../../_models/photo';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from './../../_services/members.service';
import { User } from '../../_models/user';
import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Member } from 'src/app/_models/member';
import { AccountService } from 'src/app/_services/account.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';
import { BusyService } from 'src/app/_services/busy.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.scss'],
})
export class PhotoEditorComponent implements OnInit {
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean = false;
  hasAnotherDropZoneOver: boolean;
  baseUrl: string = environment.apiUrl;
  user: User;
  @Input() member: Member;
  constructor(
    private accountService: AccountService,
    private memberService: MembersService,
    private toastrService: ToastrService,
    private busyService: BusyService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  setMainPhoto(photo: Photo): void {
    this.memberService.setMainPhoto(photo.id).subscribe((res) => {
      this.toastrService.success('Set main photo successfully');
      this.user.photoUrl = photo.url;
      this.accountService.setCurrentUser(this.user);
      this.member.photoUrl = photo.url;
      this.member.photos.forEach((ph) => {
        if (ph.isMain) ph.isMain = false;
        if (ph.id === photo.id) ph.isMain = true;
      });
    });
  }

  deletePhoto(photoId: number): void {
    this.memberService.deletePhoto(photoId).subscribe((res) => {
      this.toastrService.success('Delete photo successfully');
      this.member.photos = this.member.photos.filter((ph) => ph.id !== photoId);
    });
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024,
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onProgressItem = () => {
      this.busyService.busy();
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo: Photo = JSON.parse(response);
        this.member.photos.push(photo);
        if (photo.isMain) {
          this.user.photoUrl = photo.url;
          this.member.photoUrl = photo.url;
          this.accountService.setCurrentUser(this.user);
        }
        this.busyService.idle();
      }
    };
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }
}
