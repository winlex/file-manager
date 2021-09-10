import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { File } from '../app.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  @Input() list: File[] = [];

  @Output() selectedMain = new EventEmitter<number>();

  constructor () { }

  ngOnInit (): void {
  }

  onSelected (idFile: number) {
    this.selectedMain.emit(idFile);
  }
}
