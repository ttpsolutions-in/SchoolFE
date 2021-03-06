import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';

@Component({
  selector: 'app-feereceipt',
  templateUrl: './feereceipt.component.html',
  styleUrls: ['./feereceipt.component.scss']
})
export class FeereceiptComponent implements OnInit {
  editReceipt = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  studentInfoTodisplay = {
    Currentbatch: '',
    currentbatchId: 0,
    BillNo: 0,
    StudentName: '',
    StudentClassName: '',
    ReceiptDate: 0,
    StudentId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionName: '',
    RollNo:0,
    PayAmount: 0,
    BalanceAmt: 0,
    PaidAmt: 0,
    OfflineReceiptNo: 0,
    TotalAmount: 0,
    ClassFeeId: 0,
    ReceiptNo: 0,
    PaymentDate: Date
  }
  NewReceipt = true;
  Saved = false;
  PaymentIds = [];
  Sections = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  StudentClassFees: any[] = [];
  FeeTypes = [];
  ELEMENT_DATA: IStudentFeePaymentReceipt[];
  StudentFeePaymentList: IStudentFeePaymentReceipt[];
  Students: string[];
  dataSource: MatTableDataSource<IStudentFeePaymentReceipt>;
  dataReceiptSource: MatTableDataSource<IReceipt>;
  allMasterData = [];
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  StudentFeePaymentData = {
    StudentId: 0,
    StudentFeeId: 0,
    StudentClassId: 0,
    ClassFeeId: 0,
    FeeAmount: 0,
    PaidAmt: "0.00",
    BalanceAmt: "0.00",
    PaymentDate: new Date(),
    Batch: 0,
    Remarks: '',
    Active: 1
  };
  constructor(private dataservice: NaomitsuService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private datepipe: DatePipe,
    private shareddata:SharedataService) { }

  ngOnInit(): void {


  }
  back() {

  }
  displayedColumns = [
    'SlNo',
    'FeeName',
    'PaymentAmount',

  ];
  ReceiptDisplayedColumns = [
    'StudentReceiptId',
    'OfflineReceiptNo',
    'TotalAmount',
    'ReceiptDate',
    'Action'
  ]
  PageLoad() {
    this.shareddata.CurrentClasses.subscribe(cls=>(this.Classes=cls));
    this.shareddata.CurrentBatch.subscribe(lo=>(this.Batches=lo));
    this.shareddata.CurrentSection.subscribe(pr=>(this.Sections=pr));
    this.shareddata.CurrentStudentId.subscribe(id=>(this.studentInfoTodisplay.StudentId=id));
    this.shareddata.CurrentStudentClassId.subscribe(scid=>(this.studentInfoTodisplay.StudentClassId=scid));
    this.shareddata.CurrentBatchId.subscribe(b=>(this.studentInfoTodisplay.currentbatchId=b));
    this.shareddata.CurrentFeeNames.subscribe(b=>(this.FeeNames=b));
    
    this.GetStudentClass();
    // this.route.paramMap.subscribe(param => {
    //   this.studentInfoTodisplay.StudentId = +param.get("id");
    // })
    // this.route.queryParamMap.subscribe(param => {
    //   this.studentInfoTodisplay.StudentClassId = +param.get("scid");
    // })
    // if (this.studentInfoTodisplay.StudentId == 0) {
    //   this.alert.error("Id is missing", this.optionAutoClose);
    //   return;
    // }
    // this.GetMasterData();
  }
  UpdateActive(element) {
    let toupdatePaymentDetail = {
      ParentId: +element.ParentId,
      ClassFeeId: +element.ClassFeeId,
      ReceiptNo: +element.ReceiptNo,
      PaymentAmt: parseFloat(element.PaymentAmount).toFixed(2),
      PaymentDate: new Date(),
      ReceivedBy: '',
      Active: 0
    }
    //console.log('data to update', toupdatePaymentDetail)
    //console.log('paymentid', element.PaymentId);
    this.dataservice.postPatch('PaymentDetails', toupdatePaymentDetail, element.PaymentId, 'patch')
      .subscribe(
        (data: any) => {
          let TotalAmount = this.studentInfoTodisplay.TotalAmount - element.PaymentAmount;
          //if(TotalAmount==0)
          let receipt = {
            TotalAmount: TotalAmount.toFixed(2),
            //Less: "0.00",
            //OfflineReceiptNo: this.studentInfoTodisplay.OfflineReceiptNo,
            UpdateDate: new Date(),
            Active: TotalAmount == 0 ? 0 : 1
          }
          this.dataservice.postPatch('StudentFeeReceipts', receipt, element.ReceiptNo, 'patch')
            .subscribe(
              (data: any) => {
                let toUpdateFeePayment = {
                  BalanceAmt: (this.studentInfoTodisplay.BalanceAmt + element.PaymentAmount).toString(),
                  PaidAmt: (this.studentInfoTodisplay.PaidAmt - element.PaymentAmount).toString()
                }
                this.dataservice.postPatch('StudentFeePayments', toUpdateFeePayment, element.ParentId, 'patch')
                  .subscribe(
                    (data: any) => {
                      this.alert.success('Receipt updated successfully.', this.optionAutoClose);
                    });
              });
          //this.Saved = true;
        })
  }
  whenPrint() {
    let receipt = {
      TotalAmount: this.studentInfoTodisplay.TotalAmount.toString(),
      Less: "0.00",
      OfflineReceiptNo: this.studentInfoTodisplay.OfflineReceiptNo,
      ReceiptDate: new Date(),
      StudentClassId: this.studentInfoTodisplay.StudentClassId,
      StudentId: this.studentInfoTodisplay.StudentId
    }
    this.dataservice.postPatch('StudentFeeReceipts', receipt, 0, 'post')
      .subscribe(
        (data: any) => {
          this.studentInfoTodisplay.BillNo = data.StudentReceiptId
          let toupdatePaymentDetail = {
            ReceiptNo: this.studentInfoTodisplay.BillNo
          }
          this.PaymentIds.forEach(item => {
            this.dataservice.postPatch('PaymentDetails', toupdatePaymentDetail, item, 'patch')
              .subscribe(
                (data: any) => {
                  this.Saved = true;
                })
          });
        })
  }
  edit() {
    this.editReceipt = true;
    this.displayedColumns = [
      'SlNo',
      'FeeName',
      'PaymentAmount',
      'Action'
    ];

  }
  done() {
    this.editReceipt = false;
    this.displayedColumns = [
      'SlNo',
      'FeeName',
      'PaymentAmount',
    ];
  }
  GetStudentFeePaymentDetails(ReceiptNo) {
    debugger;
    if (this.studentInfoTodisplay.StudentId == 0)
      return;
    let filterstring = '';
    if (ReceiptNo == 0)
      filterstring = 'ReceiptNo eq null';
    else
      filterstring = 'ReceiptNo eq ' + ReceiptNo;
    filterstring += ' and Active eq 1';

    let list: List = new List();
    list.fields = [
      'StudentFeePayment/StudentFeeId',
      'StudentFeePayment/StudentClassId',
      'StudentFeePayment/StudentId',
      'StudentFeePayment/PaidAmt',
      'StudentFeePayment/BalanceAmt',
      'ClassFee/FeeNameId',
      'StudentFeeReceipt/OfflineReceiptNo',
      'StudentFeeReceipt/TotalAmount',
      'PaymentId',
      'ParentId',
      'ClassFeeId',
      'PaymentAmt',
      'ReceiptNo',
      'PaymentDate'];
    list.PageName = "PaymentDetails";
    list.lookupFields = ["StudentFeePayment", "ClassFee", "StudentFeeReceipt"];
    list.filter = [filterstring];
    list.orderBy = "PaymentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        let res: any[];
        if (data.value.length > 0) {
          this.studentInfoTodisplay.BillNo = ReceiptNo;
          if (data.value[0].StudentFeeReceipt !== undefined)
            this.studentInfoTodisplay.OfflineReceiptNo = data.value[0].StudentFeeReceipt.OfflineReceiptNo;
          this.studentInfoTodisplay.ReceiptDate = data.value[0].PaymentDate
          this.studentInfoTodisplay.PaidAmt = data.value[0].StudentFeePayment.PaidAmt;
          this.studentInfoTodisplay.BalanceAmt = data.value[0].StudentFeePayment.BalanceAmt;
          this.studentInfoTodisplay.ClassFeeId = data.value[0].ClassFeeId;
          this.studentInfoTodisplay.ReceiptNo = data.value[0].ReceiptNo;
          this.studentInfoTodisplay.PaymentDate = data.value[0].PaymentDate;
          this.studentInfoTodisplay.TotalAmount =0;
          res = data.value.filter(st => st.StudentFeePayment.StudentClassId == this.studentInfoTodisplay.StudentClassId)
            .map((item, indx) => {
              this.studentInfoTodisplay.TotalAmount += +item.PaymentAmt;
              return {
                SlNo: indx + 1,
                TotalAmount: 0,
                OfflineReceiptNo: '',
                StudentClassId: item.StudentFeePayment.StudentClassId,
                FeeName: item.ClassFee == undefined ? '' : this.FeeNames.filter(fee => fee.MasterDataId == item.ClassFee.FeeNameId)[0].MasterDataName,
                PaymentAmount: item.PaymentAmt,
                PaymentId: item.PaymentId,
                ParentId: item.ParentId,
                ReceiptNo: item.ReceiptNo,
                PaymentDate: item.PaymentDate,
                ClassFeeId: item.ClassFeeId,
                Action: ''
              }
            })
          if (res.length > 0) {
            this.NewReceipt = true;
            this.ELEMENT_DATA = [...res];
            //console.log('this.ELEMENT_DATA',this.ELEMENT_DATA)
            this.PaymentIds = res.map(id => id.PaymentId);
            this.dataSource = new MatTableDataSource<IStudentFeePaymentReceipt>(this.ELEMENT_DATA);
          }
           else {
             this.NewReceipt = false;
          //   this.GetBills();
           }
        }
        else {
           this.NewReceipt = false;
        //   this.GetBills();
         }
      })
  }
  GetBills() {
    let list: List = new List();
    list.fields = [
      'StudentReceiptId',
      'TotalAmount',
      'OfflineReceiptNo',
      'ReceiptDate'];

    list.PageName = "StudentFeeReceipts";
    //list.lookupFields = ["PaymentDetails", "StudentClass"];
    list.filter = ["StudentId eq " + this.studentInfoTodisplay.StudentId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(element => {
          element.Action = '';
        });
        this.dataReceiptSource = new MatTableDataSource<IReceipt>(data.value);
      })
  }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.FEENAMES);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.CLASSES);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.BATCH);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.SECTION);
        
        let currentBatch = globalconstants.getCurrentBatch();
        let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        if (currentBatchObj.length > 0) {
          this.studentInfoTodisplay.currentbatchId = currentBatchObj[0].MasterDataId
        }
        else
          this.alert.error("Current batch not defined!", this.optionsNoAutoClose);
        this.GetStudentClass();
      });

  }
  getDropDownData(dropdowntype) {
    let Id = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.allMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }
  GetStudentClass() {

    if (this.studentInfoTodisplay.StudentClassId == undefined || this.studentInfoTodisplay.StudentClassId == 0)
      return;

    let filterstr = "Active eq 1 and StudentClassId eq " + this.studentInfoTodisplay.StudentClassId;

    let list: List = new List();
    list.fields = ["StudentClassId", "Section", "StudentId", "Batch","RollNo", "Student/Name", "ClassId", "FeeTypeId"];
    list.lookupFields = ["Student"];
    list.PageName = "StudentClasses";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.studentInfoTodisplay.StudentClassId = data.value[0].StudentClassId;
          this.studentInfoTodisplay.ClassId = data.value[0].ClassId;
          this.studentInfoTodisplay.RollNo =data.value[0].RollNo;
          //this.studentInfoTodisplay.BillNo = data.value[0].FeeTypeId;
          this.studentInfoTodisplay.StudentName = data.value[0].Student.Name;
          this.studentInfoTodisplay.Currentbatch = this.Batches.filter(b => {
            return b.MasterDataId == this.studentInfoTodisplay.currentbatchId
          })[0].MasterDataName

          this.studentInfoTodisplay.SectionName = this.Sections.filter(cls => {
            return cls.MasterDataId == data.value[0].Section
          })[0].MasterDataName;
          this.studentInfoTodisplay.StudentClassName = this.Classes.filter(cls => {
            return cls.MasterDataId == this.studentInfoTodisplay.ClassId
          })[0].MasterDataName;

          this.GetStudentFeePaymentDetails(0);
        }
        else {
          this.alert.error("No class defined for this student!", this.optionsNoAutoClose);

        }
      })
  }
}
export interface IStudentFeePaymentReceipt {
  StudentReceiptId: number;
  TotalAmount: number;
  OfflineReceiptNo: string;
  ReceiptDate: Date;
  StudentClassId: number;
  SlNo: number;
  FeeName: string;
  PaymentAmount: any;
  Action: string;
}
export interface IReceipt {
  StudentReceiptId: number;
  TotalAmount: number;
  OfflineReceiptNo, number;
  ReceiptDate: Date;
  Action: string;
}