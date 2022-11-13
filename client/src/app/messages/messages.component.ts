import { MessageService } from './../_services/message.service';
import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  container = 'outbox';
  pageNumber = 1;
  pageSize = 5;
  loading = false;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.messageService
      .getMessages(this.pageNumber, this.pageSize, this.container)
      .subscribe((res) => {
        this.messages = res.result;
        this.pagination = res.pagination;
        this.loading = false;
      });
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id).subscribe((_) => {
      this.messages.splice(
        this.messages.findIndex((m) => m.id === id),
        1
      );
    });
  }

  pageChanged(event: PageChangedEvent) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadMessages();
    }
  }
}
