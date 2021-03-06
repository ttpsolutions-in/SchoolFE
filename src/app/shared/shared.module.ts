import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AreaComponent } from './widgets/area/area.component';
import { MaterialModule } from './material/material.module';
import { MultiLevelMenuModule} from '../modules/dynamicMultiLevelMenu/MultiLevelMenu.module';
//import { MatConfirmDialogComponent } from './components/mat-confirm-dialog/mat-confirm-dialog.component';
import { AutofocusDirective } from './autofocus.directive';
import { FormsModule } from '@angular/forms';
//import { NotfoundComponent } from './components/notfound/notfound.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
//import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
//import { HttpClientModule } from '@angular/common/http';
@NgModule({
  declarations: [
    AreaComponent,
    
    AutofocusDirective,
    //HttpClientModule
    //CdkCopyToClipboard
    //NotfoundComponent,
    //LandingpageComponent,    
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    MultiLevelMenuModule,    
    FormsModule,    
    MatProgressBarModule
  ],
  exports: [
    AreaComponent,
    //HttpClientModule
   // CdkCopyToClipboard
    //NotfoundComponent,
    
  ],
  

})
export class SharedModule { }
