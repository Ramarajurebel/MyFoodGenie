import { Component, OnInit,  Inject, LOCALE_ID, ViewChild} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { fill } from 'lodash';
import { RecipeItems } from './../../shared/classes/recipeItems';

import { MatDrawer } from '@angular/material/sidenav';

import { MatFormFieldModule } from '@angular/material/form-field';
// import { TableFields } from 'app/shared/classes/tablemanagement';
import { GenieMachines } from 'app/shared/classes/genie-machines';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-genie-machines',
  templateUrl: './genie-machines.component.html',
  styleUrls: ['./genie-machines.component.scss']
})
export class GenieMachinesComponent implements OnInit {

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';
  appearnce: MatFormFieldModule = fill;

  // GenieMachineData: TableFields[] = [];
  GenieMachinesData: GenieMachines[] = [];

  recipeItemFormgroup: FormGroup;
  productsList = [];
  modalReference: any;

  autoGenieId: number = 0;
  mobileRecipeItems: RecipeItems[];

  public status = ['Active', 'In Active', ];
 

  delObj = {};
  isMatDrawerOpened: boolean = false;
  // isRecipeItemDetails: boolean = false;
  isMachineDetails: boolean = false;

  GenieMachinesFormGroup: FormGroup;
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
      this.GenieMachinesFormGroup = new FormGroup({

        name:new FormControl(''),

        genieId: new FormControl(''),
        description: new FormControl(''),
        location: new FormControl(''),

        status: new FormControl('')
        });
      const getresp = await this.service.fetchRequest(
          'geniemanagement/getAllGenieManagement'
      );
      this.GenieMachinesData = getresp['genieManagementList'];
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
      this.isMachineDetails = false;

      this.isMatDrawerOpened = false;
      this.GenieMachinesFormGroup.reset();

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
      this.autoGenieId = row.autoGenieId;
      this.isMatDrawerOpened = true;
      this.isMachineDetails = true;
      this.editMode = true;
      this.GenieMachinesFormGroup.patchValue({
        name:row.name,

        genieId: row.genieId,
        description: row.description,
        location: row.location,

        status: row.status,
      //  vendorId: row?.vendorId,
      });
  }

  async OnSave() {
      let user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
      let data = this.GenieMachinesFormGroup.getRawValue();

      if (this.editMode) {
          data['autoGenieId'] = this.autoGenieId;
          // data['updatedBy'] = user.userName;
      }else{
        data['autoGenieId']=0;
      }
      const saveResp = await this.service.fetchRequestPost(
          'geniemanagement/createGenieManagement',
          data
      );
      this.OnClose(true);
  }
  OnAddGenieMachine() {
      this.isMatDrawerOpened = true;
      this.isMachineDetails = true;

  }

  OnDel(popup) {
      this.modalReference = this.dialog.open(popup);
      this.delObj = {};
      if (this.isMachineDetails) {
          this.delObj['autoGenieId'] = this.autoGenieId;
      }
  }

  async confirm() {
      if (this.isMachineDetails) {
          const delResp = await this.service.fetchRequestdel(
              'geniemanagement/deleteGenieManagement',
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
