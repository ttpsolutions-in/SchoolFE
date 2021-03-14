import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../databaseService';
//import { globalconstants } from '../../globalconstant';
import { SharedataService } from '../../sharedata.service'
import { List } from '../../interface';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() deviceXs:boolean; 
  _screensize: boolean;
  toggle: boolean = false;
  userName: string = '';
  loggedIn: boolean;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();
  constructor(private route: Router,
    private tokenStorage: TokenStorageService,
    private naomitsuService: NaomitsuService
    ) {
    //console.log("token", tokenStorage.getToken())

  }

  ngOnInit(): void {
        debugger;
    this.userName = this.tokenStorage.getUser();
    //console.log('screensize1',this.deviceXs)
    if (this.userName === undefined || this.userName === null || this.userName == '')
      this.loggedIn = false;
    else
      this.loggedIn = true;
    //    console.log("loggedin", this.loggedIn)
  }
  toggleSideBar() {
    this.toggleSideBarForme.emit();
    this.toggle = !this.toggle;
  }
  changepassword() {
    this.route.navigate(["/auth/changepassword"]);
  }
  gotoLogin() {
    this.route.navigate(["/auth/login"]);
  }
  createlogin() {
    this.route.navigate(["/auth/createlogin"]);
  }
  logout() {
    debugger;
    this.tokenStorage.signOut();
    this.route.navigate(['/']);
  }
  contactus() {
    this.route.navigate(["/addmessage"]);
  }
  home() {
    this.route.navigate(["/"]);
  }
  newsNEvents() {
    let list: List = new List();
    list.fields = ["PageId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and label eq 'News N Events'"];

    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.route.navigate(['/about/' + data.value[0].PageId]);
      });

  }
}
