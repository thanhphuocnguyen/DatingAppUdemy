import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_model/member';

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
  constructor(private http: HttpClient) {}

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUrl + 'users');
  }

  getMemberByUserName(userName: string): Observable<Member> {
    return this.http.get<Member>(this.baseUrl + 'users/' + userName);
  }
}
