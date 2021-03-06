import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { globalconstants } from 'src/app/shared/globalconstant';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss']
})
export class AlbumsComponent implements OnInit {
  @ViewChild('button') button: ElementRef;
  FileOrImage: number = 1;
  activeSkill() {
    (<any>this.button).color = 'accent';
  }
  dataSource: MatTableDataSource<IAlbum>;
  displayedColumns=["UpdatedFileFolderName","UploadDate","Copy","View"]
  ParentId = 0;
  folderHierarachy: string = 'Image/';
  folderDisplayHierachy:string='Image/';
  title: string = '';
  loading: boolean=false;
  error: string = '';
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  searchForm = new FormGroup(
    {
      UpdatedFileFolderName: new FormControl('', [Validators.required]),
      parentId: new FormControl(0),
      //FilesNPhoto: new FormControl(0, [Validators.required])
    }
  );
  images: any[];
  Albums: any[]=[];
  AllAlbums: any[];
  unique: any[];
  selectedAlbum: string;
  oldvalue: string;
  absoluteurl = '';
  constructor(
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private dialog: DialogService,
    private tokenStorage: TokenStorageService,
    //private globalconstants
  ) {
    //this.absoluteurl =window.location.origin;
  }

  ngOnInit() {
    this.checklogin();
    this.getAlbums();
    //this.getPhotos(0, "");

  }
  applyFilter(strFilter) {
    if (strFilter.length > 2)
      this.Albums = [...this.AllAlbums.filter(item => { return item.UpdatedFileFolderName.includes(strFilter) || item.UploadDate.toString().includes(strFilter) })];
    else if (strFilter.length == 0) {
      this.Albums == this.AllAlbums.filter((item, indx) => {
        return indx < 10;
      });
    }
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.alert.error("Access denied! login required.", options);
      this.route.navigate(['/home']);
    }
  }
  getAlbums() {

    let list: List = new List();
    list.fields = ["FileId", "FileName", "UpdatedFileFolderName", "FileOrFolder", "UploadDate", "ParentId", "Active"];
    list.PageName = "FilesNPhotoes";
    list.filter = ['Active eq 1 and FileOrFolder eq 1'];// and FileOrPhoto eq ' + this.searchForm.get("FilesNPhoto").value];
    list.orderBy = "UploadDate desc";
    //list.limitTo =10;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AllAlbums = [...data.value];
        // .filter((item, indx) => {
        //  // return indx < 10;
        // });
      })
  }
  getNestedFolders(parentId) {
    let ParentItem = this.AllAlbums.filter(item => item.FileId == parentId);
    debugger;
    while (ParentItem.length > 0) {
      this.folderHierarachy += ParentItem[0].FileName + "/";
      this.folderDisplayHierachy += ParentItem[0].UpdatedFileFolderName + "/";
      ParentItem = this.AllAlbums.filter(item => item.FileId == ParentItem[0].ParentId)
    }
  }
  message() {
    this.alert.success("url copied", this.options);
  }
  getFiles(album, mode) {
    debugger;
    let folderSearch = '';

    if (album != undefined) {
      if (album.FileOrFolder == 0 && mode=='open') {
        //let folderHierarachy='Image/';
        //this.getNestedFolders(album.ParentId);
        //let url = globalconstants.apiUrl + "/" + folderHierarachy + album.FileName;
        
        window.open(album.FilePath, "_blank");
        return;
      }

      if (album.FileId == undefined && this.searchForm.get("UpdatedFileFolderName").value == "") {
        this.alert.error("Please enter folder name to search", this.options);
        return;
      }

      if (album.FileId != undefined)
        folderSearch = " and ParentId eq " + album.FileId;
      else if (album.FileId == undefined && this.searchForm.get("UpdatedFileFolderName").value != "")
        folderSearch = " and substringof('" + this.searchForm.get("UpdatedFileFolderName").value + "',UpdatedFileFolderName)";
    }
    else if(this.searchForm.get("UpdatedFileFolderName").value!='') {
      folderSearch = " and substringof('" + this.searchForm.get("UpdatedFileFolderName").value + "',UpdatedFileFolderName)";
    }
    else
    {
      return;
    }
    let list: List = new List();
    list.fields = ["FileId", "FileName", "FileOrFolder", "Description", "ParentId", "UpdatedFileFolderName", "UploadDate"];
    list.PageName = "FilesNPhotoes";
    list.filter = ["Active eq 1" + folderSearch];
    list.orderBy = "UploadDate desc";
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          debugger;
          var browsePath = '';
          this.Albums = data.value.map(item => {
            this.folderHierarachy='Image/';
            this.folderDisplayHierachy ='Image/';
            this.getNestedFolders(item.ParentId);
            
            if (this.folderHierarachy.length > 0)
              browsePath = globalconstants.apiUrl + "/" + this.folderHierarachy + item.FileName;
            return {
              FileId: item.FileId,
              FilePath: browsePath,
              DisplayPath: globalconstants.apiUrl + "/" + this.folderDisplayHierachy + item.FileName,
              FileName: item.FileName,
              Description: item.Description,
              UploadDate: item.UploadDate,
              FileOrFolder: item.FileOrFolder,
              ParentId: item.ParentId,
              UpdatedFileFolderName: item.UpdatedFileFolderName,
              Copy:'',
              View:''
            }
          });
          this.error ='';
          this.selectedAlbum = data.value[0].UpdatedFileFolderName;// this.images[0].Album.AlbumName;
          this.title = this.selectedAlbum;
          //this.AllAlbums =[...this.Albums];
        }
        else {
          this.error = "No file/folder found.";
          this.Albums = [];
        }
        this.dataSource = new MatTableDataSource<IAlbum>(this.Albums);
        this.loading = false;
        //setTimeout(()=>{this.loading=false},3000); 
      })
  }
  updateActive(value,album) {
    this.dialog.openConfirmDialog("Are you sure you want to delete File/Folder " + value._elementRef.nativeElement.name + "?")
      .afterClosed().subscribe(res => {

        if (res) {
          let albumtoUpdate = {
            UpdatedFileFolderName: value._elementRef.nativeElement.name,
            Active: value.checked == true ? 1 : 0,
            UploadDate: new Date()
          }

          this.dataservice.postPatch('FilesNPhotoes', albumtoUpdate, value._elementRef.nativeElement.id, 'patch')
            .subscribe(res => {
              this.getFiles(album,"");
              this.alert.success("File/Folder deleted successfully.", this.options);
              //console.lothisg(res);
            });
        }
      });
  }

  selected(event) {
    //console.log('event',event)
    this.selectedAlbum = event.target.value;
    //    console.log('this.selectedAlbum', this.selectedAlbum)
    // let tempImages = this.Albums.filter((item)=>{
    //   return item.Album == this.selectedAlbum
    // })
    // this.images = tempImages.map(item=> {return item.PhotoPath});
  }
  getoldvalue(value: string) {
    this.oldvalue = value;
    //  console.log('old value', this.oldvalue);
  }
  updateAlbum(value) {
    //console.log(value);
    //value.stopPropagation();
    if (this.oldvalue == value)
      return;
    let confirmYesNo: Boolean = false;
    if (value.length == 0 || value.length > 50) {
      this.alert.error("Character should not be empty or less than 50!");
      return;
    }

    let albumtoUpdate = {
      UpdatedFileFolderName: value,
      Active: 1,
      UploadDate: new Date()
    }

    let selectedAlbumId = this.Albums.filter(item => {
      return item.UpdatedFileFolderName == this.oldvalue
    })[0].FileId;

    this.dataservice.postPatch('FilesNPhotoes', albumtoUpdate, selectedAlbumId, 'patch')
      .subscribe(res => {
        this.alert.success("File/Folder name updated!", this.options);
      });
  }
  display(albumId) {
    this.route.navigate(["/home/photos"], { queryParams: { "AlbumId": albumId } });
  }
  Delete(value) {
    //console.log(value);
    value.stopPropagation();
    let confirmYesNo: Boolean = false;
    if (value.length == 0 || value.length > 50) {
      this.alert.error("Character should not be empty or less than 50!");
      return;
    }
    this.dialog.openConfirmDialog("Are you sure you want to delete all photos in ${value} album?")
      .afterClosed().subscribe(res => {
        confirmYesNo = res;
        if (confirmYesNo) {
          //this.uploadImage();
          let albumtoUpdate = {
            UpdatedFileFolderName: value,
            Active: 1,
            UploadDate: new Date()
          }
          let selectedAlbumId = this.Albums.filter(item => {
            return item.UpdatedFileFolderName == this.oldvalue
          })[0].FileId;
          //    console.log('selectedAlbumId', selectedAlbumId);
          // this.dataservice.get('Albums', albumtoUpdate, selectedAlbumId, 'patch')
          //   .subscribe(res => {
          //     console.log(res);
          //   });

        }
      });
  }
}
export interface IAlbum{
  FileId:number;  
  FileOrFolder:number;
  UpdatedFileFolderName:string;
  UploadDate:Date;
  FilePath:string;

}
