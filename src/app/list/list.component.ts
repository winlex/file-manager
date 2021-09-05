import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { File } from '../app.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  @Input() list:File[] = [];

  @Output() onSelectedMain = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  onSelected(id_file: number) {
    this.onSelectedMain.emit(id_file);
  }

}
