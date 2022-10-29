import { ToastrService } from 'ngx-toastr';
import { NavigationExtras, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          switch (error.status) {
            case HttpStatusCode.BadRequest:
              if (error.error?.errors) {
                const errorObject = error.error.errors;
                const modalStateErrors = [];
                for (const key in errorObject) {
                  if (errorObject[key]) {
                    modalStateErrors.push(errorObject[key]);
                  }
                }
                throw modalStateErrors.flat();
              } else {
                this.toastr.error(
                  error.statusText === 'OK' ? 'Bad request' : error.statusText,
                  error.status.toString()
                );
              }
              break;
            case HttpStatusCode.Unauthorized:
              this.toastr.error(
                error.statusText === 'OK' ? 'Unauthorized' : error.statusText,
                error.status.toString()
              );
              break;
            case HttpStatusCode.NotFound:
              this.router.navigateByUrl('/notfound');
              break;
            case HttpStatusCode.InternalServerError:
              const navigatorExtras: NavigationExtras = {
                state: { error: error.error },
              };
              this.router.navigateByUrl('/server-error', navigatorExtras);
              break;
            default:
              this.toastr.error('Something unexpected happened');
              console.log(error);
              break;
          }
        }
        return throwError(error);
      })
    );
  }
}
