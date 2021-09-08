import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from './../environments/environment';
import { NgxIndexedDBService } from 'ngx-indexed-db';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, child, onValue, off, update } from "firebase/database";

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase();

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
      path: '',
      date_create: { date: ''}
    };
    //currentPath: string = '/'; Появилась нужда заменить эту переменную переменной ниже 
    currentFolder: File = {
      id: 1,
      name: '/',
      content: '',
      type: 2,
      path: '',
      date_create: { date: ''}
    }
    modeNew: boolean = false;
    loading: boolean = false;
    lastFolder: File[] = [];
    
    constructor(private httpClient: HttpClient, private dbService: NgxIndexedDBService) {
      this.dbService.getAll('state')
      .subscribe(state => {
        if(state.length < 3) {
          this.dbService.bulkAdd('state', [
            {
              'name': 'currentFolder',
              'obj': this.currentFolder
            },
            {
              'name': 'currentFile',
              'obj': this.currentFile
            },
            {
              'name': 'lastFolder',
              'obj': this.lastFolder
            },
          ]);
          this.onSelectedFile(1);
        } else {
          //Загрузка с IndexDB (я ее называю браузерная ДБ)
          this.dbService.getAll('state')
          .subscribe(store => { //Функции асинхронные, но не на промисах, поэтому не получилось сделать красивую "цепочку промисов"
            console.log(store);
            this.currentFolder = (store[0] as any).obj;
            this.currentFile = (store[1] as any).obj;
            this.lastFolder = (store[2] as any).obj;

            this.onSelectedFile(this.currentFolder.id, true);
          });
        } 
      });
    }

    ngOnInit() {

    }

    onSelectedFile(id_file: number, firstLoad = false) {
      this.modeNew = false;
      let temp: File = {
        id: id_file == 1 || id_file == 3 ? id_file : 0,
        name: id_file == 1 || id_file == 3 ? (id_file == 1 ? '/' : 'trash/') : '',
        content: '',
        type: 2,
        path: '',
        date_create: { date: ''}
      };

      //Исключаем случае, когда спика файлов еще нет
      if(id_file != 1 && id_file != 3 && !firstLoad) 
        temp = this.searchFile(id_file) as File;

      /**
       * @firstLoad Первая загрузка страницы, когда еще нет даже списка, тут точно папка
       * @temp Найденный файл в текущем списк, при нормальной работе сервиса, когда список файлов уже есть
       * @id_file Когда нужно открыть папку минуя все списки 
       */
      if(firstLoad || temp.type == 2 || id_file == 1 || id_file == 3) { 

        if(this.currentFile.id != 0) 
          off(ref(db, `folder/${this.currentFolder.id}`));

        //Тут логика искусствено созданной папки на клиенте "../"
        if(temp.name == '../') {
          temp = this.lastFolder.find(el => el.id == id_file) as File;
          this.lastFolder.pop();
          this.dbService.update('state', {
            idS: 3,
            name: 'lastFolder',
            obj: this.lastFolder
          }).subscribe(() => { });
        } else {
          if(id_file == 1 || id_file == 3) {
            this.lastFolder = [];
            this.dbService.update('state', {
              idS: 3,
              name: 'lastFolder',
              obj: this.lastFolder
            }).subscribe(() => { });
          } else if(!firstLoad) {
            this.lastFolder.push(this.currentFolder);
            this.dbService.update('state', {
              idS: 3,
              name: 'lastFolder',
              obj: this.lastFolder
            }).subscribe(() => { });
          }
        }

        //Начинаем загрузку файлов из папки
        this.loading = true;
        this.getFolder(temp.id != 0 ? temp.id : id_file)
        .then( response => {
          this.loading = false;
          this.listFiles = response as File[];
          if(temp.id != 1 && temp.id != 3 && this.lastFolder.length > 0) { //Условие добавления искусственной папки "../"
            this.listFiles.unshift({
              id: this.lastFolder[this.lastFolder.length-1].id,
              name: '../',
              content: '',
              type: 2,
              path: this.lastFolder[this.lastFolder.length-1].path,
              date_create: { date: ''}
            })
          }
          console.log(this.listFiles);
          if(!firstLoad) this.currentFile = temp as File;
          this.currentFolder = temp as File;
          this.listeningFirebaseFolder(`${this.currentFolder.id}`); //Начинаем прослушку с Firebase
          this.dbService.update('state', {
            idS: 1,
            name: 'currentFolder',
            obj: this.currentFolder
          }).subscribe(() => { });
          this.dbService.update('state', {
            idS: 2,
            name: 'currentFile',
            obj: this.currentFile
          }).subscribe(() => { });
        })
      } else {
        off(ref(db, `current/${this.currentFile.id}`));
        this.currentFile = temp as File;
        this.dbService.update('state', {
          idS: 2,
          name: 'currentFile',
          obj: this.currentFile
        }).subscribe(() => { });
        this.listeningFirebaseCurrent(temp);
      }
    }

    onSave(file: File) {
      this.httpClient.post(
        environment.APIEndpoint + '/file/' + file.id + '/update', 
        file
      )
      .toPromise()
      .then(r => {
        alert('Файл сохранен');
        this.listFiles[this.listFiles.findIndex(el => el.id == file.id)] = file;
        update(ref(db, `current/${file.id}`),file);
        set(ref(db, `files/${file.id}`),file);
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
        alert('Файл удален');
        this.loading = true;
        set(ref(db, `files/${file.id}`),file);
        this.onSelectedFile(this.lastFolder[this.lastFolder.length-1].id);
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
        alert('Файл добавлен');
        this.loading = true;
        this.getFolder(this.currentFolder.id)
        .then(response => {
          this.loading = false;
          this.listFiles = response as File[];
          set(ref(db, `${this.currentFolder.id}`), this.listFiles);
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
        alert('Файл восстановлен');
        this.openTrash();
        set(ref(db, `folder/3`), this.listFiles);
        set(ref(db, `files/${file.id}`), file);
        set(ref(db, `current/${file.id}`), file);
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
        alert('Файл удален полностью');
        this.openTrash();
        set(ref(db, `folder/3`), this.listFiles);
        set(ref(db, `files/${file.id}`), file);
        set(ref(db, `current/${file.id}`), file);
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
        path: this.currentFolder.path + this.currentFolder.name,
        date_create: { date: ''}
      }
    }

    newFile() {
      this.modeNew = true;
      this.currentFile = {
        id: 0,
        name: '',
        content: '',
        type: 1,
        path: this.currentFolder.path + this.currentFolder.name,
        date_create: { date: ''}
      }
    }

    openRoot() {
      this.loading = true;
      this.onSelectedFile(1);
    }
    
    openTrash() {
      this.loading = true;
      this.onSelectedFile(3);
    }

    /**
     * Поиск файла в списке файлов в переменной
     * 
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
     * 
     * @param id_folder 
     * @returns Промис со списком файлов
     */
    getFolder(id_folder: number) {
      return this.httpClient.post(environment.APIEndpoint + '/file/' + id_folder, {
          observer: 'response'
      })
      .toPromise()
      .catch(console.log);
    }

    /**
     * Прослушка базы Firebase для текущей открытой папки
     * 
     * @param path Путь к файлу в БД Firebase (по факту это айди каждого файла)
     */
    listeningFirebaseFolder(path: string) {
      path = 'folder/' + path;
      set(ref(db, path), this.listFiles);
      onValue(ref(db, path), (snapshot) => {
        this.unListeningFirebaseFolder();
        this.listFiles = snapshot.val();
        
        //Подписываемся к каждому файлу/папки отдельно
        for (const key in this.listFiles) { 
          if (Object.prototype.hasOwnProperty.call(this.listFiles, key)) {
            onValue(ref(db, `files/${this.listFiles[key].id}`), (snapshotF) => {
              if(snapshotF.exists()) {
                if(new Date(snapshotF.val().date_create.date) < new Date(this.listFiles[key].date_create.date))
                  set(ref(db, `files/${this.listFiles[key].id}`), this.listFiles[key]);
              } else {
                set(ref(db, `files/${this.listFiles[key].id}`), this.listFiles[key]);
              }
              /**
               * TEST: Возможна коллизия между элементами массива с других устройств (но это не точно, нужно продумать кейс)
               */
              this.listFiles[key] = snapshotF.val();
            });            
          }
        }
      });
    }

    unListeningFirebaseFolder() {
      this.listFiles.forEach(element => {
        off(ref(db, `files/${element.id}`));
      });
    }
    
    /**
     * Прослушка базы Firebase для текущего открытого файла
     * 
     * @param file Нужен именно объект файла, так как задействована дата создания
     */
    listeningFirebaseCurrent(file: File) {
      var path = `current/${file.id}`;
      get(ref(db, path))
      .then((snapshot) => {
        if(snapshot.exists()) {
          if(new Date(snapshot.val().date_create.date) < new Date(file.date_create.date)){
            set(ref(db, path), this.currentFile)
            .then(() => {
              return ;
            })
          } else return ;
        } else {
          set(ref(db, path), this.currentFile)
          .then(() => {
            return ;
          })
        }
      })
      .then(() => {
        onValue(ref(db, `current/${file.id}`), (snapshot) => {
          this.currentFile = snapshot.val();
        });
      })
    }
}

export interface File {
  id: number,
  name: string,
  content: string,
  type: number,
  path: string,
  date_create: {
    date: string
  }
}