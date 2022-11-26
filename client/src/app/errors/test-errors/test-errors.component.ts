import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-test-errors',
  templateUrl: './test-errors.component.html',
  styleUrls: ['./test-errors.component.scss'],
})
export class TestErrorsComponent implements OnInit {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
  validationErr: string[] = [];
  ngOnInit(): void {}

  get404Error() {
    this.http.get(this.baseUrl + 'buggy/not-found').subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getServerError() {
    this.http.get(this.baseUrl + 'buggy/server-error').subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getBadRequestError() {
    this.http.get(this.baseUrl + 'buggy/bad-request').subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getAuthError() {
    this.http.get(this.baseUrl + 'buggy/auth').subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getValidationError() {
    this.http.post(this.baseUrl + 'account/register', {}).subscribe(
      (res) => {
        console.log(res);
      },
      (err: string[]) => {
        console.log(err);
        this.validationErr = err;
      }
    );
  }
}
