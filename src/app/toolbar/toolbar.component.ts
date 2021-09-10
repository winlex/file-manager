import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { File } from '../app.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() folder: File = {
    id: 0,
    name: '',
    content: '',
    type: 0,
    path: '',
    date_create: { date: '' }
  };

  @Input() loading: boolean = false;

  @Output() newDir = new EventEmitter();
  @Output() newFile = new EventEmitter();
  @Output() openRoot = new EventEmitter();
  @Output() openTrash = new EventEmitter();

  constructor () { }

  ngOnInit (): void {
  }

  newD () {
    this.newDir.emit();
  }

  newF () {
    this.newFile.emit();
  }

  openR () {
    this.openRoot.emit();
  }

  openT () {
    this.openTrash.emit();
  }
}
