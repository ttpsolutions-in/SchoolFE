import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { AreaComponent } from './widgets/area/area.component';
import { MaterialModule } from './material/material.module';
import { MultiLevelMenuModule} from '../modules/dynamicMultiLevelMenu/MultiLevelMenu.module';
import { AlertComponent } from './components/alert/alert.component';
import { MatConfirmDialogComponent } from './components/mat-confirm-dialog/mat-confirm-dialog.component';
import { EditInputComponent } from './components/edit-input/edit-input.component';
import { AutofocusDirective } from './autofocus.directive';
import { FormsModule } from '@angular/forms';
//import {NgMaterialMultilevelMenuModule} from 'ng-material-multilevel-menu'
//import { CarouselLocalComponent } from '../modules/carousel/carousel.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    AreaComponent,
    AlertComponent,
    MatConfirmDialogComponent,
    EditInputComponent,
    AutofocusDirective,
    
    //CarouselLocalComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    MaterialModule,
    MultiLevelMenuModule,    
    //NgMaterialMultilevelMenuModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    AreaComponent,
    MaterialModule,
    AlertComponent,
    EditInputComponent
    //CarouselLocalComponent
  ]

})
export class SharedModule { }
