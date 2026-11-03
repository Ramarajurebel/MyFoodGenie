import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-entity-framework',
  templateUrl: './entity-framework.component.html',
  styleUrls: ['./entity-framework.component.scss']
})
export class EntityFrameworkComponent implements OnInit {
  tableName = ['Entity', 'Entity-Parameters', 'Entity-Transactions', 'Entity-Reports', 'Entity-Hierarchy','formula'];
  
  selectedOption: string = ''; // Tracks the selected dropdown option
  searchQuery: string = '';

  users: any[] = [];
  admins: any[] = []; 
  transactions: any[] = [];
  reports: any[] = [];
  hierarchies: any[] = [];
  availableEntities: string[] = [];
  availableEntityParameters: string[] = [];
  formulas: any[] = [];

  filteredUsers: any[] = [];
  filteredAdmins: any[] = [];
  filteredTransactions: any[] = [];
  filteredReports: any[] = [];
  filteredHierarchies: any[] = [];
  filteredFormulas: any[] = [];

  userSelected: any = null;
  adminSelected: any = null;
  transactionSelected: any = null;
  reportSelected: any = null;
  hierarchySelected: any = null;
  formulaSelected: any = null;

  form: FormGroup;
  adminForm: FormGroup;
  transactionForm: FormGroup;
  reportForm: FormGroup;
  hierarchyForm: FormGroup;
  formulaForm: FormGroup;
  

  nextId: number = 1;
  nextAdminId: number = 1;
  nextTransactionId: number = 1;
  nextReportId: number = 1;
  nextHierarchyId: number = 1;
  nextFormulaId: number = 1;

  isAddingUser: boolean = false;
  isAddingAdmin: boolean = false;
  isAddingTransaction: boolean = false;
  isAddingReport: boolean = false;
  isAddingHierarchy: boolean = false;
  isAddingFormula: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      Name: ['', Validators.required],
      Description: ['', Validators.required],
      Merchant: ['', Validators.required]
    });

    this.adminForm = this.fb.group({
      EntityName: ['', Validators.required],
      Name: ['', Validators.required],
      DataType: ['', Validators.required],
      DataSize: ['', Validators.required],
      Description: ['', Validators.required],
      FormFlag: [false],
      ValueFlag: [false],
      UIFieldType: ['', Validators.required]
    });

    this.transactionForm = this.fb.group({
      EntityName: ['', Validators.required],
      EntityParameter: ['', Validators.required],
      RefParameterId: ['', Validators.required],
      Value: ['', Validators.required],
      CreateDateTime: ['', Validators.required],
      UpdateDateTime: ['', Validators.required],
      CreateBy: ['', Validators.required],
      UpdateBy: ['', Validators.required],
      EntityHierarchy: ['', Validators.required]
    });

    this.reportForm = this.fb.group({
      ReportName: ['', Validators.required],
      ReportFilter: ['', Validators.required],
      ReportType: ['', Validators.required],
    });

    this.hierarchyForm = this.fb.group({
      HierarchyName: ['', Validators.required],
      HierarchyType: ['', Validators.required],
      Parent: ['', Validators.required],
      Level: ['', Validators.required],
      Status: ['', Validators.required]
    });
    this.formulaForm = this.fb.group({
      Name: ['', Validators.required],
      Formula: ['', Validators.required],
      Filter: ['', Validators.required],
      InputField: ['', Validators.required],
      Action:['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.availableEntities = this.users.map(user => user.name);
    this.filteredUsers = [...this.users];
    this.filteredAdmins = [...this.admins];
    this.filteredTransactions = [...this.transactions];
    this.filteredReports = [...this.reports];
    this.filteredHierarchies = [...this.hierarchies];
    this.filteredFormulas = [...this.formulas];
    this.updateFilteredData();
  }

  applySearch() {
    const query = this.searchQuery.toLowerCase();

    if (!query) {
      this.filteredUsers = [...this.users]; // Reset to original data
      this.filteredAdmins = [...this.admins];
      this.filteredTransactions = [...this.transactions];
      this.filteredReports = [...this.reports];
      this.filteredHierarchies = [...this.hierarchies];
      this.filteredFormulas = [...this.formulas];
      return;
    }

    if (this.selectedOption === 'Entity') {
      this.filteredUsers = this.users.filter(
        (user) => 
          user.name.toLowerCase().includes(query) ||
          user.number.toLowerCase().includes(query) ||
          user.merchant.toLowerCase().includes(query)
      );
    } else if (this.selectedOption === 'Entity-Parameters') {
      console.log('Filtering admins...');
      this.filteredAdmins = this.admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(query) ||
          admin.entityName.toLowerCase().includes(query) ||
          admin.dataType.toLowerCase().includes(query) ||
          admin.description.toLowerCase().includes(query) ||
          admin.uiFieldType.toLowerCase().includes(query) ||
          admin.dataSize.toLowerCase().includes(query)
      );
    } else if (this.selectedOption === 'Entity-Transactions') {
      this.filteredTransactions = this.transactions.filter(
        (transaction) =>
          transaction.entityName.toLowerCase().includes(query) ||
          transaction.entityParameter.toLowerCase().includes(query) ||
          transaction.value.toLowerCase().includes(query)
      );
    } else if (this.selectedOption === 'Entity-Reports') {
      this.filteredReports = this.reports.filter(
        (report) =>
          report.reportName.toLowerCase().includes(query) ||
          report.reportType.toLowerCase().includes(query) ||
          report.reportFilter.toLowerCase().includes(query)
      );
    } else if (this.selectedOption === 'Entity-Hierarchy') {
      this.filteredHierarchies = this.hierarchies.filter(
        (hierarchy) =>
          hierarchy.hierarchyName.toLowerCase().includes(query) ||
          hierarchy.hierarchyType.toLowerCase().includes(query) ||
          hierarchy.status.toLowerCase().includes(query) ||
          hierarchy.parent.toLowerCase().includes(query) ||
          hierarchy.level.toLowerCase().includes(query)
      );
    } else if (this.selectedOption === 'formula') {
      this.filteredFormulas = this.formulas.filter(
        (formula) =>
          formula.name.toLowerCase().includes(query) ||
          formula.formula.toLowerCase().includes(query) ||
          formula.action.toLowerCase().includes(query) ||
          formula.inputField.toLowerCase().includes(query) ||
          formula.filter.toLowerCase().includes(query)
      );
    }
  }

  onSelectChange(value: any) {
    this.selectedOption = value;
    this.applySearch(); 
    this.userSelected = null;
    this.adminSelected = null;
    this.transactionSelected = null;
    this.reportSelected = null;
    this.hierarchySelected = null;
    this.formulaSelected = null;
  }

  // ** Entity Table Functions (Users) **
  addUser() {
    if (this.isAddingUser) return;
    this.isAddingUser = true;
    const newUser = { id: this.nextId++, name: '', number: '', merchant: '', isSaved: false };
    this.users.unshift(newUser);
    this.selectUser(newUser);
    this.filteredUsers.unshift(newUser);
  }

  selectUser(user: any) {
    this.userSelected = user;
    this.form.patchValue({
      Name: user.name,
      Description: user.number,
      Merchant: user.merchant
    });
  }

  updateUser(index: number) {
    if (this.form.invalid) return;

    this.users[index] = {
      ...this.users[index],
      name: this.form.value.Name,
      number: this.form.value.Description,
      merchant: this.form.value.Merchant,
      isSaved: true
    };
    this.isAddingUser = false;
    this.cancelEdit();
    this.updateAvailableEntities();
  }
  updateAvailableEntities() {
    this.availableEntities = this.users.map(user => user.name).filter(name => !!name);
  }

  deleteUser(index: number) {
    if (confirm('Are you sure you want to delete this Entity?')) {
      this.users.splice(index, 1);
      this.cancelEdit();
      this.updateAvailableEntities();
    }
  }

  cancelEdit() {
    this.userSelected = null;
    this.form.reset();
    this.isAddingUser = false;
    const unsavedIndex = this.users.findIndex(user => !user.isSaved);
    if (unsavedIndex !== -1) {
      this.users.splice(unsavedIndex, 1);
    }
    this.filteredUsers = [...this.users];
  }

  // ** Entity-Parameters Table Functions (Admins) **
  addAdmin() {
    if (this.isAddingAdmin) return;
    this.isAddingAdmin = true;
    const newAdmin = {
      id: this.nextAdminId++,
      entityName: '',
      name: '',
      dataType: '',
      dataSize: '',
      description: '',
      formFlag: false,
      valueFlag: false,
      isSaved: false,
      uiFieldType: ''
    };
    this.admins.unshift(newAdmin);
    this.selectAdmin(newAdmin);
    this.filteredAdmins.unshift(newAdmin);
  }

  selectAdmin(admin: any) {
    this.adminSelected = admin;
    this.adminForm.patchValue({
      EntityName: admin.entityName,
      Name: admin.name,
      DataType: admin.dataType,
      DataSize: admin.dataSize,
      Description: admin.description,
      FormFlag: admin.formFlag,
      ValueFlag: admin.valueFlag,
      UIFieldType: admin.uiFieldType
    });
  }

  updateAdmin(index: number) {
    if (this.adminForm.invalid) return;

    this.admins[index] = {
      ...this.admins[index],
      entityName: this.adminForm.value.EntityName,
      name: this.adminForm.value.Name,
      dataType: this.adminForm.value.DataType,
      dataSize: this.adminForm.value.DataSize,
      description: this.adminForm.value.Description,
      formFlag: this.adminForm.value.FormFlag,
      valueFlag: this.adminForm.value.ValueFlag,
      uiFieldType: this.adminForm.value.UIFieldType,
      isSaved: true
    };
    this.updateAvailableEntityParameters();
    this.isAddingAdmin = false;
    this.cancelAdminEdit();
  }

  deleteAdmin(index: number) {
    if (confirm('Are you sure you want to delete this Entity-Parameter?')) {
      this.admins.splice(index, 1);
      this.cancelAdminEdit();
      this.updateAvailableEntityParameters();
    }
  }

  cancelAdminEdit() {
    this.adminSelected = null;
    this.adminForm.reset();
    this.isAddingAdmin = false;
    const unsavedIndex = this.admins.findIndex(admin => !admin.isSaved);
    if (unsavedIndex !== -1) {
      this.admins.splice(unsavedIndex, 1);
    }
    this.filteredAdmins = [...this.admins];
  }

  // ** Entity-Transactions Table Functions **
  addTransaction() {
    if (this.isAddingTransaction) return;
    this.isAddingTransaction = true;
    const newTransaction = {
      id: this.nextTransactionId++,
      entityName: '',
      entityParameter: '',
      refParameterId: '',
      value: '',
      createDateTime: '',
      updateDateTime: '',
      createBy: '',
      updateBy: '',
      entityHierarchy: '',
      isSaved: false
    };
    this.transactions.unshift(newTransaction);
    this.selectTransaction(newTransaction);
    this.filteredTransactions.unshift(newTransaction);
  }

  selectTransaction(transaction: any) {
    this.transactionSelected = transaction;
    this.transactionForm.patchValue({
      EntityName: transaction.entityName,
      EntityParameter: transaction.entityParameter,
      RefParameterId: transaction.refParameterId,
      Value: transaction.value,
      CreateDateTime: transaction.createDateTime,
      UpdateDateTime: transaction.updateDateTime,
      CreateBy: transaction.createBy,
      UpdateBy: transaction.updateBy,
      EntityHierarchy: transaction.entityHierarchy
    });
  }

  updateTransaction(index: number) {
    if (this.transactionForm.invalid) return;

    this.transactions[index] = {
      ...this.transactions[index],
      entityName: this.transactionForm.value.EntityName,
      entityParameter: this.transactionForm.value.EntityParameter,
      refParameterId: this.transactionForm.value.RefParameterId,
      value: this.transactionForm.value.Value,
      createDateTime: this.transactionForm.value.CreateDateTime,
      updateDateTime: this.transactionForm.value.UpdateDateTime,
      createBy: this.transactionForm.value.CreateBy,
      updateBy: this.transactionForm.value.UpdateBy,
      entityHierarchy: this.transactionForm.value.EntityHierarchy,
      isSaved: true
    };
    this.isAddingTransaction = false;
    this.cancelTransactionEdit();
  }

  deleteTransaction(index: number) {
    if (confirm('Are you sure you want to delete this Entity-Transaction?')) {
      this.transactions.splice(index, 1);
      this.cancelTransactionEdit();
    }
  }

  cancelTransactionEdit() {
    this.transactionSelected = null;
    this.transactionForm.reset();
    this.isAddingTransaction = false;
    const unsavedIndex = this.transactions.findIndex(transaction => !transaction.isSaved);
    if (unsavedIndex !== -1) {
      this.transactions.splice(unsavedIndex, 1);
    }
    this.filteredTransactions = [...this.transactions];
  }

  // ** Entity-Reports Table Functions **
  addReport() {
    if (this.isAddingReport) return;
    this.isAddingReport = true;
    const newReport = {
      id: this.nextReportId++,
      reportName: '',
      reportFilter: '',
      reportType: '',
      isSaved: false
    };
    this.reports.unshift(newReport);
    this.selectReport(newReport);
    this.filteredReports.unshift(newReport);
  }

  selectReport(report: any) {
    this.reportSelected = report;
    this.reportForm.patchValue({
      ReportName: report.reportName,
      ReportFilter: report.reportFilter,
      ReportType:report.reportType
    });
  }

  updateReport(index: number) {
    if (this.reportForm.invalid) return;

    this.reports[index] = {
      ...this.reports[index],
      reportName: this.reportForm.value.ReportName,
      reportFilter: this.reportForm.value.ReportFilter,
      reportType:this.reportForm.value.ReportType,
      isSaved: true
    };
    this.isAddingReport = false;
    this.cancelReportEdit();
  }

  deleteReport(index: number) {
    if (confirm('Are you sure you want to delete this Entity-Report?')) {
      this.reports.splice(index, 1);
      this.cancelReportEdit();
    }
  }

  cancelReportEdit() {
    this.reportSelected = null;
    this.reportForm.reset();
    this.isAddingReport = false;
    const unsavedIndex = this.reports.findIndex(report => !report.isSaved);
    if (unsavedIndex !== -1) {
      this.reports.splice(unsavedIndex, 1);
    }
    this.filteredReports = [...this.reports];
  }

  // ** Entity-Hierarchy Table Functions **
  addHierarchy() {
    if (this.isAddingHierarchy) return;
    this.isAddingHierarchy = true;
    const newHierarchy = {
      id: this.nextHierarchyId++,
      hierarchyName: '',
      hierarchyType: '',
      parent: '',
      level: '',
      status: '',
      isSaved: false
    };
    this.hierarchies.unshift(newHierarchy);
    this.selectHierarchy(newHierarchy);
    this.filteredHierarchies.unshift(newHierarchy);
  }

  selectHierarchy(hierarchy: any) {
    this.hierarchySelected = hierarchy;
    this.hierarchyForm.patchValue({
      HierarchyName: hierarchy.hierarchyName,
      HierarchyType: hierarchy.hierarchyType,
      Parent: hierarchy.parent,
      Level: hierarchy.level,
      Status: hierarchy.status
    });
  }

  updateHierarchy(index: number) {
    if (this.hierarchyForm.invalid) return;

    this.hierarchies[index] = {
      ...this.hierarchies[index],
      hierarchyName: this.hierarchyForm.value.HierarchyName,
      hierarchyType: this.hierarchyForm.value.HierarchyType,
      parent: this.hierarchyForm.value.Parent,
      level: this.hierarchyForm.value.Level,
      status: this.hierarchyForm.value.Status,
      isSaved: true
    };
    this.isAddingHierarchy = false;
    this.cancelHierarchyEdit();
  }

  deleteHierarchy(index: number) {
    if (confirm('Are you sure you want to delete this Entity-Hierarchy?')) {
      this.hierarchies.splice(index, 1);
      this.cancelHierarchyEdit();
    }
  }

  cancelHierarchyEdit() {
    this.hierarchySelected = null;
    this.hierarchyForm.reset();
    this.isAddingHierarchy = false;
    const unsavedIndex = this.hierarchies.findIndex(hierarchy => !hierarchy.isSaved);
    if (unsavedIndex !== -1) {
      this.hierarchies.splice(unsavedIndex, 1);
    }
    this.filteredHierarchies = [...this.hierarchies];
  }

  addFormula() {
    if (this.isAddingFormula) return;
    this.isAddingFormula = true;
    const newFormula = {
      id: this.nextFormulaId++,
      name: '',
      formula: '',
      filter: '',
      inputField: '',
      action: '',
      isSaved: false
    };
    this.formulas.unshift(newFormula);
    this.selectFormula(newFormula);
    this.filteredFormulas.unshift(newFormula);
  }

  selectFormula(formula: any) {
    this.formulaSelected = formula;
    this.formulaForm.patchValue({
      Name: formula.name,
      Formula: formula.formula,
      Filter: formula.filter,
      InputField: formula.inputField,
      Action: formula.action
    });
  }

  updateFormula(index: number) {
    if (this.formulaForm.invalid) return;

    this.formulas[index] = {
      ...this.formulas[index],
      name: this.formulaForm.value.Name,
      formula: this.formulaForm.value.Formula,
      filter: this.formulaForm.value.Filter,
      inputField: this.formulaForm.value.InputField,
      action: this.formulaForm.value.Action,
      isSaved: true
    };
    this.isAddingFormula = false;
    this.cancelFormulaEdit();
  }

  deleteFormula(index: number) {
    if (confirm('Are you sure you want to delete this Entity-Formula?')) {
      this.formulas.splice(index, 1);
      this.cancelFormulaEdit();
    }
  }

  cancelFormulaEdit() {
    this.formulaSelected = null;
    this.formulaForm.reset();
    this.isAddingFormula = false;
    const unsavedIndex = this.formulas.findIndex(formula => !formula.isSaved);
    if (unsavedIndex !== -1) {
      this.formulas.splice(unsavedIndex, 1);
    }
    this.filteredFormulas = [...this.formulas];
  }


  onEntityChange(entity: string)   {
    this.adminForm.patchValue({ EntityName: entity });
  }

  updateAvailableEntityParameters() {
    this.availableEntityParameters = this.admins.map(admin => admin.name).filter(name => !!name);
  }

  updateFilteredData() {
    this.users = [...this.users];
    this.admins = [...this.admins];
    this.transactions = [...this.transactions];
    this.reports = [...this.reports];
    this.hierarchies = [...this.hierarchies];
    this.formulas = [...this.formulas];
  }
}
