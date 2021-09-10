import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { File } from '../app.component';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
  @Input() file: File = {
    id: 0,
    name: '',
    content: '',
    type: 0,
    path: '',
    date_create: { date: '' }
  };

  @Input() modeNew: boolean = false;

  @Output() save = new EventEmitter<File>();
  @Output() delete = new EventEmitter<File>();
  @Output() add = new EventEmitter<File>();
  @Output() restore = new EventEmitter<File>();
  @Output() permanently = new EventEmitter<File>();

  constructor () { }

  ngOnInit (): void {
  }

  changeTitle () {

  }

  onSave () {
    this.save.emit(this.file);
  }

  onDelete () {
    this.delete.emit(this.file);
  }

  onAdd () {
    this.add.emit(this.file);
  }

  onRestore () {
    this.restore.emit(this.file);
  }

  onPermanently () {
    this.restore.emit(this.file);
  }
}
