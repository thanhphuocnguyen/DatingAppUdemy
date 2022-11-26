import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { Photo } from '../_models/photo';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHepler';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getUsersWithRoles() {
    return this.http.get<Partial<User[]>>(
      this.baseUrl + 'admin/users-with-roles'
    );
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post(
      this.baseUrl + 'admin/edit-roles/' + username + '?roles=' + roles,
      {}
    );
  }

  getPhotosForApproval(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResult<Partial<Photo[]>>> {
    let params = getPaginationHeaders(pageNumber, pageSize);
    return getPaginatedResult<Partial<Photo[]>>(
      this.baseUrl + 'admin/photos-to-moderate',
      params,
      this.http
    );
  }

  approvePhoto(photoId: number) {
    return this.http.post(this.baseUrl + 'admin/approve-photo/' + photoId, {});
  }

  rejectPhoto(photoId: number) {
    return this.http.post(this.baseUrl + 'admin/reject-photo/' + photoId, {});
  }
}
