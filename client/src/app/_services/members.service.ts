import { User } from './../_model/user';
import { AccountService } from './account.service';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_model/member';
import { map, take } from 'rxjs/operators';
import { PaginatedResult } from '../_model/pagination';
import { UserParams } from '../_model/userParams';

// const httpOptions = {
//   headers: new HttpHeaders({
//     Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`,
//   }),
// };
@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.user = user;
      this.userParams = new UserParams(user);
    });
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params) {
    this.userParams = params;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    // if (this.members.length > 0) return of(this.members);
    var response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = this.getPaginationHeaders(
      userParams.pageNumber,
      userParams.pageSize
    );
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender.toString());
    params = params.append('orderBy', userParams.orderBy.toString());
    return this.getPaginatedResult<Member[]>(
      this.baseUrl + 'users',
      params
    ).pipe(
      map((res) => {
        this.memberCache.set(Object.values(userParams).join('-'), res);
        return res;
      })
    );
  }

  getMemberByUserName(userName: string): Observable<Member> {
    // const member = this.members.find((member) => member.userName === userName);
    // if (member !== undefined) {
    //   return of(member);
    // }
    const memeber = [...this.memberCache.values()]
      .reduce((acc, curr) => {
        return [...acc, ...curr.result];
      }, [])
      .find((mem: Member) => mem.userName === userName);
    console.log(memeber);
    if (memeber) {
      return of(memeber);
    }
    return this.http.get<Member>(this.baseUrl + 'users/' + userName);
  }

  updateMember(member: Member): Observable<void> {
    return this.http.put<void>(this.baseUrl + 'users', member).pipe(
      map((_) => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number): Observable<void> {
    return this.http.put<void>(
      this.baseUrl + 'users/set-main-photo/' + photoId,
      {}
    );
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(
      this.baseUrl + 'users/delete-photo/' + photoId,
      {}
    );
  }

  addLike(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}likes/${username}`, {});
  }

  getLikes(
    predicate: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResult<Partial<Member[]>>> {
    let params = this.getPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    return this.getPaginatedResult<Partial<Member[]>>(
      this.baseUrl + 'likes',
      params
    );
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();

    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map((res) => {
        paginatedResult.result = res.body;
        if (res.headers.get('X-Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(
            res.headers.get('X-Pagination')
          );
        }
        return paginatedResult;
      })
    );
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize.toString());
    return params;
  }
}
