import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { TaskListComponent } from './../task-list/task-list.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from './../../modules/admin/dashboards/project/project.service';
import { formatDate } from '@angular/common';
import { AudioService } from './../audio.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
    selector: 'app-task-details',
    templateUrl: './task-details.component.html',
    styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent implements OnInit {
    protected _onDestroy = new Subject<void>();
    public taskForm: FormGroup;
    public comment: FormControl = new FormControl('');
    public getTasks = [];
    public selectedTask: any;
    public TaskStatus = [];
    public commentsArray = [];
    public tempCommentsArray = [];
    public commentsEditMode: boolean = false;
    public descriptionPoints: any;
    taskListGroup = [];
    getnewTasksList = [];
    filteredTaskList = [];
    tasknameControl: FormControl = new FormControl('');
    public stalloperator = [];
    assignedTo: string;
    public Status = ['Open', 'In Progress', 'On Hold', 'Completed'];
    vendorData = [];
    vendorId = 0;
    constructor(
        private tasksListComponent: TaskListComponent,
        private activatedRoute: ActivatedRoute,
        private _naviService: ProjectService,
        private router: Router,
        private audioService: AudioService,
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        let vendorIdString = localStorage.getItem('vendorId');
        if (vendorIdString) {
            this.vendorId = parseInt(vendorIdString);
        }
        this.taskForm = new FormGroup({
            taskname: new FormControl(''),
            tasklistId: new FormControl(''),
            tasklistNameId: new FormControl(''),
            assignedto: new FormControl(''),
            status: new FormControl(''),
            description: new FormControl(''),
            duedate: new FormControl(''),
            comments: new FormControl(''),
            // createdby: new FormControl(''),
            category: new FormControl(''),
            type: new FormControl(''),
            duration: new FormControl(''),
            starttime: new FormControl(''),
            endtime: new FormControl(''),
            mobileno: new FormControl(''),
            vendorId: new FormControl(),
        });
        this.tasknameControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filtertasks();
            });
        // disabled fields
        this.taskForm.controls['vendorId'].setValue(this.vendorId);
        let taskid = this.activatedRoute.snapshot.params['id'];
        // services are below

        const getresp = await this._naviService.fetchRequest(
            'tasklist/getAlltasklist'
        );
        this.getTasks = getresp['tasklistList'];
        const vendorResp = await this._naviService.fetchRequest(
            'rest/vendor/GetAllVendors'
        );
        this.vendorData = vendorResp['vendorList'];
        // task group
        const gettaskgroup = await this._naviService.fetchRequest(
            'tasklistname/getAlltasklistname'
        );
        this.taskListGroup = gettaskgroup['tasklistnameList'];
        // tasks new
        const getnewresp = await this._naviService.fetchRequest(
            'newtasklist/getAllnewtasklist'
        );
        this.getnewTasksList = getnewresp['new_tasklistList'];
        this.filteredTaskList = this.getnewTasksList;
        const getTaskstatus = await this._naviService.fetchRequest(
            'taskstatus/getAlltaskstatus'
        );
        const gecmtstresp = await this._naviService.fetchRequest(
            'comments/getAllcomments'
        );
        this.commentsArray = gecmtstresp['commentsList'];
        const resp = await this._naviService.fetchRequest(
            'stalloperator/getAllStallOperator'
        );
        this.stalloperator = resp['stallOperatorList'];
        this.stalloperator = this.stalloperator.filter((item) => {
            if (item?.role == 'Employee') return item;
        });
        this.tempCommentsArray = JSON.parse(JSON.stringify(this.commentsArray));
        if (taskid) {
            this.taskForm.controls['vendorId'].disable();
            this.commentsArray = this.commentsArray.filter((item) => {
                if (item.taskid == taskid) return item;
            });
            if (this.commentsArray.length > 0) {
                this.comment.setValue(this.commentsArray[0].comment);
                this.commentsEditMode = true;
            }
            this.TaskStatus = getTaskstatus['taskstatusList'];
            this.getTasks.forEach((item) => {
                if (item.taskid == parseInt(taskid)) {
                    this.selectedTask = item;
                }
            });
            console.log(this.selectedTask);

            const result = this.selectedTask.description.split(/\r?\n/);
            console.log(result);
            this.descriptionPoints = result;
            this.descriptionPoints = this.descriptionPoints.map(
                (str, index) => ({
                    value: str,
                    id: index + 1,
                    checked: false,
                })
            );
            this.descriptionPoints.forEach((desc) => {
                if (desc.value[0] === 'C' && desc.value[1] === ':')
                    desc.checked = true;
            });
            // assigned to
            let selectedoperator = this.stalloperator.filter((item) => {
                return item.mobile == this.selectedTask.mobileno;
            });
            if (selectedoperator.length > 0) {
                let name = selectedoperator[0].name;
                let mobnumber = selectedoperator[0].mobile;
                console.log(name);
                console.log(mobnumber);
                this.assignedTo = name;
            }
            this.taskForm.patchValue({
                taskname: this.selectedTask.taskname,
                description: this.selectedTask.description,
                duedate: this.selectedTask.duedate,
                duration: this.selectedTask.duration,
                assignedto: this.selectedTask.mobileno,
                status: this.selectedTask.status,
                mobileno: this.selectedTask.mobileno,
                starttime: this.selectedTask?.starttime,
                endtime: this.selectedTask?.endtime,
                tasklistNameId: this.selectedTask?.tasklistNameId,
                tasklistId: this.selectedTask?.tasklistId,
                vendorId: this.selectedTask?.vendorId,
            });
            this.taskForm.controls['taskname'].disable();
            this.taskForm.controls['description'].disable();
            this.taskForm.controls['duedate'].disable();
            this.taskForm.controls['assignedto'].disable();
            this.taskForm.controls['starttime'].disable();
            this.taskForm.controls['endtime'].disable();
        }

        this.tasksListComponent.matDrawer.open();
        // console.log(this.tasksListComponent.matDrawer.open());
    }
    OnTaskGroup(value) {
        let filteredtasks = this.getnewTasksList.filter((item) => {
            if (item.tasklistNameId === parseInt(value)) return item;
        });
        this.filteredTaskList = filteredtasks;
    }

    onSelect(value) {
        let tasklist = this.filteredTaskList.filter((item) => {
            if (item.tasklistId == value) return item;
        });
        const task = document.getElementById('tasknameid');
        if (value != null) {
            task.setAttribute('disabled', 'true');
            if (tasklist) {
                this.taskForm
                    .get('description')
                    .setValue(tasklist[0].description);
                this.taskForm.get('taskname').setValue(tasklist[0].name);
                this.taskForm.get('duration').setValue(tasklist[0]?.duration);
            }
        } else {
            this.taskForm.reset();
            task.removeAttribute('disabled');
        }
    }
    protected filtertasks() {
        this.filteredTaskList = this.filteredTaskList;
        if (!this.getnewTasksList) {
            return;
        }
        // get the search keyword
        let search = this.tasknameControl.value;
        if (!search) {
            this.filteredTaskList = this.getnewTasksList.slice();
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredTaskList = this.getnewTasksList.filter(
            (bank) => bank.name.toLowerCase().indexOf(search.toLowerCase()) > -1
        );
    }
    async descriptionCheckbox(checked, value) {
        console.log(checked);
        console.log(value);

        if (checked) {
            this.descriptionPoints.forEach((desc) => {
                if (desc.id == value.id) desc.value = 'C: ' + value.value;
            });
            let allDescription = [];
            this.descriptionPoints.forEach((desc) => {
                allDescription.push(desc.value);
            });
            this.selectedTask.description = allDescription.join('\n');
            this.taskForm.patchValue({
                description: this.selectedTask.description,
            });
            const data = this.taskForm.getRawValue();
            data.taskid = this.selectedTask.taskid;
            console.log(data);
            const saveresp = await this._naviService.fetchRequestPost(
                'tasklist/createtasklist',
                data
            );
        } else {
            this.descriptionPoints.forEach((desc) => {
                if (desc.id === value.id)
                    desc.value = value.value.replace('C: ', '');
            });
            let allDescription = [];
            this.descriptionPoints.forEach((desc) => {
                allDescription.push(desc.value);
            });
            this.selectedTask.description = allDescription.join('\n');
            this.taskForm.patchValue({
                description: this.selectedTask.description,
            });
            const data = this.taskForm.getRawValue();
            data.taskid = this.selectedTask.taskid;
            console.log(data);
            const saveresp = await this._naviService.fetchRequestPost(
                'tasklist/createtasklist',
                data
            );
        }
    }
    OnClose() {
        this.taskForm.reset();
        this.commentsEditMode = false;
        this.tasksListComponent.matDrawer.close();
        this.router.navigate(['/nfm/kitchen-tasks/TASKMGM'], {
            skipLocationChange: true,
        });
    }
    async OnStatusClick(statusname) {
        console.log(statusname);
        let taskid = this.selectedTask.taskid;
        this.selectedTask.status = statusname;

        let editTaskData = this.taskForm.getRawValue();
        editTaskData['taskid'] = taskid;
        editTaskData.assignedto = this.assignedTo;
        let previousStatus = editTaskData.status;
        editTaskData.status = statusname;
        editTaskData.duedate = formatDate(
            editTaskData.duedate,
            'YYYY-MM-dd',
            this.locale
        );

        const editresp = await this._naviService.fetchRequestPost(
            'tasklist/createtasklist',
            editTaskData
        );
        // for getting the same task id objects
        this.TaskStatus = this.TaskStatus.filter((item) => {
            if (item.taskid == taskid) return item;
        });
        console.log('prevStatus', previousStatus);
        console.log('curr status', editTaskData.status);

        if (previousStatus != editTaskData.status) {
            // logic for
            let localtaskid = localStorage.getItem(taskid + '');
            if (localtaskid == taskid) {
                this.audioService.stop();
                setTimeout(() => {
                    localStorage.removeItem(taskid + '');
                }, 60000);
            }

            if (editTaskData.status != 'Completed') {
                let task_statusid = 0;

                let payload = {
                    taskid: editTaskData.taskid,
                    task_statusid: 0,
                    statusname: editTaskData.status,
                    createdby: editTaskData?.createdby || null,
                    //  updatedby:
                };
                const statusresp = await this._naviService.fetchRequestPost(
                    'taskstatus/createtaskstatus',
                    payload
                );
            } else {
                // for stopping audio

                let taskstatus = [];
                taskstatus = this.TaskStatus.filter((item) => {
                    if (item.statusname == 'In Progress') return item;
                });
                let lastObject = taskstatus.slice(-1);
                console.log(lastObject);
                let payload = {
                    taskid: editTaskData.taskid,
                    task_statusid: lastObject[0].task_statusid,
                    statusname: 'Completed',
                    updatedby: editTaskData.assignedto,
                };
                const statusresp = await this._naviService.fetchRequestPost(
                    'taskstatus/createtaskstatus',
                    payload
                );
            }
        }
        if (this.comment.value) {
            if (this.commentsEditMode != true) {
                let assignedto = this.taskForm.controls['assignedto'].value;
                const payload = {
                    commentid: 0,
                    taskid: taskid,
                    createdby: assignedto,
                    comment: this.comment.value,
                    createddate: null,
                };

                const resp = await this._naviService.fetchRequestPost(
                    'comments/createcomments',
                    payload
                );
            } else {
                let assignedto = this.taskForm.controls['assignedto'].value;
                const payload = {
                    commentid: this.commentsArray[0].commentid,
                    taskid: taskid,
                    createdby: assignedto,
                    comment: this.comment.value,
                    createddate: null,
                };
                const resp = await this._naviService.fetchRequestPost(
                    'comments/createcomments',
                    payload
                );
            }
        }
        this.tasksListComponent.matDrawer.close();
        this.router.navigate(['/nfm/kitchen-tasks/TASKMGM'], {
            skipLocationChange: true,
        });
        // .then(() => {
        //     window.location.reload();
        // });
        // this.router.navigateByUrl('/nfm/kitchen-tasks/tl');
    }
    async OnSaveTask() {
     
        let data = this.taskForm.getRawValue();
        data['taskid'] = 0;
        data.tasklistNameId = parseInt(data.tasklistNameId);
        data.duedate = formatDate(data.duedate, 'YYYY-MM-dd', this.locale);
        data.duration = data.duration;
        // data.starttime = null;
        // data.endtime = null;
        data.assignedto = this.assignedTo;
        data['updatedby'] = '';
        //  data["completedby"]= "";
        data['updateddate'] = '';
        //  data["completiondate"]= "";

        const saveresp = await this._naviService.fetchRequestPost(
            'tasklist/createtasklist',
            data
        );
        this.tasksListComponent.matDrawer.close();
        this.router.navigate(['/nfm/kitchen-tasks/TASKMGM'], {
            skipLocationChange: true,
        });
    }
    OnAssignedTo(value) {
        let selectedoperator = this.stalloperator.filter((item) => {
            return item.mobile == value;
        });
        let name = selectedoperator[0].name;
        let mobnumber = selectedoperator[0].mobile;
        console.log(name);
        console.log(mobnumber);
        this.assignedTo = name;
        this.taskForm.controls['mobileno'].setValue(mobnumber);
    }
}
