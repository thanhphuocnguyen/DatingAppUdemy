import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { AuthGuard } from './_guards/auth.guard';
import { MessagesComponent } from './messages/messages.component';
import { ListComponent } from './list/list.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'members',
        component: MemberListComponent,
        // canActivate: [AuthGuard],
      },
      {
        path: 'members/:id',
        component: MemberDetailComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'lists',
        component: ListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'messages',
        component: MessagesComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: 'buggy', component: TestErrorsComponent },
  { path: 'notfound', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  {
    path: '**',
    component: NotFoundComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
