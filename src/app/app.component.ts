import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from './../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    listFiles: File[] = [];
    currentFile: File = {
      id: 1,
      name: '/',
      content: '',
      type: 2,
      path: ''
    };
    //currentPath: string = '/'; Появилась нужда заменить эту переменную переменной ниже 
    currentFolder: File = {
      id: 1,
      name: '/',
      content: '',
      type: 2,
      path: ''
    }
    modeNew: boolean = false;
    loading: boolean = false;
    lastFolder: File[] = [];
    
    constructor(private httpClient: HttpClient) {
      this.loading = true;
      this.getFolder(1)
      .then( response => {
        this.loading = false;
        this.listFiles = response as File[];
        console.log(this.listFiles);
      })
    }

    ngOnInit() {

    }

    onSelectedFile(id_file: number) {
      this.modeNew = false;
      let temp = this.searchFile(id_file) as File;
      if(temp.type == 2) {
        if(temp.name == '../') {
          temp = this.lastFolder.find(el => el.id == id_file) as File;
          this.lastFolder.pop();
          console.log(temp);
          console.log(this.lastFolder);
        } else {
          this.lastFolder.push(this.currentFolder);
        }
        this.loading = true;
        this.getFolder(temp.id)
        .then( response => {
          this.loading = false;
          this.listFiles = response as File[];
          if(temp.id != 1 && temp.id != 3 && this.lastFolder.length > 0) {
            this.listFiles.unshift({
              id: this.lastFolder[this.lastFolder.length-1].id,
              name: '../',
              content: '',
              type: 2,
              path: this.lastFolder[this.lastFolder.length-1].path
            })
          }
          console.log(this.listFiles);
          this.currentFile = temp as File;
          this.currentFolder = temp as File;
        })
      } else this.currentFile = temp as File;
      console.log(this.currentFolder);
    }

    onSave(file: File) {
      this.httpClient.post(
        environment.APIEndpoint + '/file/' + file.id + '/update', 
        file
      )
      .toPromise()
      .then(r => {
        console.log(r);
        alert('Файл сохранен');
      })
      .catch(console.log);
    }

    onDelete(file: File) {
      this.httpClient.post(
        environment.APIEndpoint + '/file/' + file.id + '/delete', 
        {}
      )
      .toPromise()
      .then(r => {
        console.log(r);
        alert('Файл удален');
        this.loading = true;
        this.getFolder(this.currentFolder.id)
        .then(response => {
          this.loading = false;
          this.listFiles = response as File[];
        })
      })
      .catch(console.log);
    }

    onAdd(file: File) {
      this.httpClient.post(
        environment.APIEndpoint + '/file/create', 
        file
      )
      .toPromise()
      .then(r => {
        console.log(r);
        alert('Файл добавлен');
        this.loading = true;
        this.getFolder(this.currentFolder.id)
        .then(response => {
          this.loading = false;
          this.listFiles = response as File[];
        })
      })
      .catch(console.log);
    }

    onRestore(file: File) {
      this.httpClient.post(
        environment.APIEndpoint + '/file/' + file.id + '/restore', 
        {}
      )
      .toPromise()
      .then(r => {
        console.log(r);
        alert('Файл восстановлен');
        this.openTrash();
      })
      .catch(console.log);
    }

    onPermanently(file: File) {
      this.httpClient.post(
        environment.APIEndpoint + '/file/' + file.id + '/permanently', 
        {}
      )
      .toPromise()
      .then(r => {
        console.log(r);
        alert('Файл удален полностью');
        this.openTrash();
      })
      .catch(console.log);
    }

    newDir() {
      this.modeNew = true;
      this.currentFile = {
        id: 0,
        name: '',
        content: '',
        type: 2,
        path: this.currentFolder.path + this.currentFolder.name
      }
    }

    newFile() {
      this.modeNew = true;
      this.currentFile = {
        id: 0,
        name: '',
        content: '',
        type: 1,
        path: this.currentFolder.path + this.currentFolder.name
      }
    }

    openRoot() {
      this.loading = true;
      this.getFolder(1)
      .then( response => {
        this.loading = false;
        this.listFiles = response as File[];
        console.log(this.listFiles);
        this.currentFile = {
          id: 1,
          name: '/',
          content: '',
          type: 2,
          path: ''
        };
        this.currentFolder = {
          id: 1,
          name: '/',
          content: '',
          type: 2,
          path: ''
        };
      })
    }
    
    openTrash() {
      this.loading = true;
      this.getFolder(3)
      .then( response => {
        this.loading = false;
        this.listFiles = response as File[];
        console.log(this.listFiles);
        this.currentFile = {
          id: 3,
          name: 'trash/',
          content: '',
          type: 2,
          path: ''
        };
        this.currentFolder = {
          id: 3,
          name: 'trash/',
          content: '',
          type: 2,
          path: ''
        };
      })
    }

    /**
     * Поиск файла в списке файлов в переменной
     * @param id_file Айди нужного чата
     * @returns Объект файла
     */
    searchFile(id_file: number) {
      for (let index = 0; index < this.listFiles.length; index++) {
        if(this.listFiles[index].id == id_file) 
          return this.listFiles[index];
      }

      return null;
    }

    /**
     * Получение списка файлов в нужной директории
     * @param id_folder 
     * @returns 
     */
    getFolder(id_folder: number) {
      return this.httpClient.post(environment.APIEndpoint + '/file/' + id_folder, {
          observer: 'response'
      })
      .toPromise()
      .catch(console.log);
    }
}

export interface File {
  id: number,
  name: string,
  content: string,
  type: number,
  path: string
}