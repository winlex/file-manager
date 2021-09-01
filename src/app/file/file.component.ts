import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {
  @Input() id: number = 0;
  @Input() name: string = '';
  @Input() type: number = 0;

  iconFile: string = '../../assets/file.ico';
  iconFolder: string = '../../assets/folder.ico';

  constructor() { }

  ngOnInit(): void {
  }

}
