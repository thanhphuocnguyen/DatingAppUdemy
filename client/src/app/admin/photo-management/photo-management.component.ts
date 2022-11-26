import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Pagination } from 'src/app/_models/pagination';
import { Photo } from 'src/app/_models/photo';
import { AdminService } from 'src/app/_services/admin.service';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.scss'],
})
export class PhotoManagementComponent implements OnInit {
  photos: Partial<Photo[]>;
  pageNumber = 1;
  pageSize = 8;
  pagination: Pagination;

  constructor(
    private adminService: AdminService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPhotosToApprove();
  }

  loadPhotosToApprove(): void {
    this.adminService
      .getPhotosForApproval(this.pageNumber, this.pageSize)
      .subscribe((photos) => {
        this.photos = photos.result;
        this.pagination = photos.pagination;
      });
  }

  approvePhoto(photoId: number) {
    this.adminService.approvePhoto(photoId).subscribe((_) => {
      this.toastrService.success('Approve Photo Success');
      this.photos = this.photos.filter((p) => p.id !== photoId);
    });
  }

  rejectPhoto(photoId: number) {
    this.adminService.rejectPhoto(photoId).subscribe((_) => {
      this.toastrService.info('Reject Photo Success');
      this.photos = this.photos.filter((p) => p.id !== photoId);
    });
  }

  pageChanged(event: any) {
    this.pageNumber = event.page;
    this.loadPhotosToApprove();
  }
}
