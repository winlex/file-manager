import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-viewer',
    templateUrl: './viewer.component.html',
    styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
    @Input() id:number = 0;
    @Input() name:string = '';
    @Input() text:string = '';
    @Input() type:number = 0;

    @Input() modeNew:boolean = false;

    constructor() { }
  
    ngOnInit(): void {
    }

    changeTitle() {
        
    }
  
}