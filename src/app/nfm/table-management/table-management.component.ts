import { Component, OnInit,  Inject, LOCALE_ID, ViewChild} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { fill } from 'lodash';
import { RecipeItems } from './../../shared/classes/recipeItems';

import { MatDrawer } from '@angular/material/sidenav';

import { MatFormFieldModule } from '@angular/material/form-field';
import { TableFields } from 'app/shared/classes/tablemanagement';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-table-management',
  templateUrl: './table-management.component.html',
  styleUrls: ['./table-management.component.scss']
})
export class TableManagementComponent implements OnInit {
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';
  appearnce: MatFormFieldModule = fill;

  TableFieldsData: TableFields[] = [];

  recipeItemFormgroup: FormGroup;
  productsList = [];
  modalReference: any;

  diningTableId: number = 0;
  mobileRecipeItems: RecipeItems[];

  public status = ['Active', 'In Active', ];
  // public priority = ['VeryHigh', 'High', 'Medium', 'Low'];

  delObj = {};
  isMatDrawerOpened: boolean = false;
  // isRecipeItemDetails: boolean = false;
  istableDetails: boolean = false;

  TableFieldsFormGroup: FormGroup;
  public filtereditems = [];
  employeesList = [];
  editMode: boolean;
  vendorData = [];
  vendorId: number = 0;
  constructor(
      private service: ProjectService,

      private dialog: MatDialog,

      @Inject(LOCALE_ID) public locale: string
  ) {}

  async ngOnInit() {
      let vendorIdStr = localStorage.getItem('vendorId');
      if (vendorIdStr) {
          this.vendorId = parseInt(vendorIdStr);
      }
      this.TableFieldsFormGroup = new FormGroup({

        roomName:new FormControl(''),

        tableId: new FormControl(''),
        tableName: new FormControl(''),
        seats: new FormControl(''),

        status: new FormControl('')
        });
      const getresp = await this.service.fetchRequest(
          'diningtables/getAllDiningTables'
      );
      this.TableFieldsData = getresp['diningTablesList'];
      // const resp = await this.service.fetchRequest(
      //     'stalloperator/getAllStallOperator'
      // );
      // this.employeesList = resp['stallOperatorList'];
      const vendorResp = await this.service.fetchRequest(
          'rest/vendor/GetAllVendors'
      );
      this.vendorData = vendorResp['vendorList'];
      this.employeesList = this.employeesList.filter((op) => {
          return op?.role === 'Employee';
      });
  }
  OnClose(value) {
      this.istableDetails = false;

      this.isMatDrawerOpened = false;
      this.TableFieldsFormGroup.reset();

      this.editMode = false;

      if (value) {
          this.ngOnInit();
      }
      if (this.modalReference) {
          this.modalReference.close();
      }
  }
  OntableClick(row, event) {

      console.log(row);
      event.stopPropagation();
      this.diningTableId = row.diningTableId;
      this.isMatDrawerOpened = true;
      this.istableDetails = true;
      this.editMode = true;
      this.TableFieldsFormGroup.patchValue({
        roomName:row.roomName,

        tableId: row.tableId,
        tableName: row.tableName,
        seats: row.seats,

        status: row.status,
      //  vendorId: row?.vendorId,
      });
  }

  async OnSave() {
      let user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
      let data = this.TableFieldsFormGroup.getRawValue();

      if (this.editMode) {
          data['diningTableId'] = this.diningTableId;
          // data['updatedBy'] = user.userName;
      }else{
        data['diningTableId']=0;
      }
      const saveResp = await this.service.fetchRequestPost(
          'diningtables/createDiningTables',
          data
      );
      this.OnClose(true);
  }
  OnBookTable() {
      this.isMatDrawerOpened = true;
      this.istableDetails = true;

  }

  OnDel(popup) {
      this.modalReference = this.dialog.open(popup);
      this.delObj = {};
      if (this.istableDetails) {
          this.delObj['diningTableId'] = this.diningTableId;
      }
  }

  async confirm() {
      if (this.istableDetails) {
          const delResp = await this.service.fetchRequestdel(
              'diningtables/deleteDiningTables',
              this.delObj
          );
      }
      this.modalReference.close();
      this.OnClose(true);
  }
  decline(){
    this.OnClose(false);
  }
  CloseDialog() {
      this.modalReference.close();
  }

}
