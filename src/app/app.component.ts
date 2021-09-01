import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from './../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    currentFolder:string = '/';
    
    constructor(private httpClient: HttpClient) {
      this.httpClient.post(environment.APIEndpoint + '/file/1', {
          observer: 'response'
      })
      .toPromise()
      .then( response => {
          console.log(response);
      })
      .catch(console.log);
    }

    ngOnInit() {

    }
}
