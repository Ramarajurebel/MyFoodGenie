import { Component, OnInit, ViewChild, LOCALE_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { MatDrawer } from '@angular/material/sidenav';
import { formatDate } from '@angular/common';
@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    public getTasks = [];
    public userTasks = [];
    public taskListGroup = [];
    public user: any;
    public todayCompletedTasks = [];
    public isCompletedTasksVisible: boolean = false;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _naviService: ProjectService,
        @Inject(LOCALE_ID) public locale: string
    ) {}

    async ngOnInit() {
        const getresp = await this._naviService.fetchRequest(
            'tasklist/getAlltasklist'
        );
        this.getTasks = getresp['tasklistList'];
        // for showing task group name new service is to be called, and below is the logic
        const gettaskgroup = await this._naviService.fetchRequest(
            'tasklistname/getAlltasklistname'
        );
        this.taskListGroup = gettaskgroup['tasklistnameList'];
        this.taskListGroup.forEach((group) => {
            group['assgdtasks'] = [];
        });
        console.log(this.taskListGroup);

        //   for(let i in this.taskListGroup){
        //       for(let j in this.getTasks){
        //           if(this.taskListGroup[i].tasklistNameId == this.getTasks[j].tasklistNameId){
        //               this.taskListGroup[i]['subtasks'] = [{}]
        //           }
        //       }
        //   }
        console.log(this.taskListGroup);

        this.user = JSON.parse(localStorage.getItem('user'));
        console.log(this.user.role);
        if (this.user.role != 'admin') {
            let notCompletedTasks = this.getTasks.filter((item) => {
                if (item?.status != 'Completed') return item;
            });
            let currentdate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);

            this.todayCompletedTasks = this.getTasks.filter((item) => {
                if (item?.status == 'Completed' && item?.duedate == currentdate)
                    return item;
            });

            let userTasks = notCompletedTasks.filter((item) => {
                if (item.mobileno == this.user.mobileNumber) return item;
            });
            this.taskListGroup.forEach((group) => {
                userTasks.forEach((task) => {
                    if (group.tasklistNameId == task.tasklistNameId) {
                        group['assgdtasks'].push(task);
                        group['childActive'] = true;
                    }
                });
            });
            this.taskListGroup = this.taskListGroup.filter((item) => {
                if (item.assgdtasks.length != 0) return item;
            });
            console.log(this.taskListGroup);
            this.taskListGroup[0].childActive = true;
            // sorting data based on start time

            this.taskListGroup.forEach((group) => {
                group.assgdtasks.sort(({ starttime: a }, { starttime: b }) =>
                    a > b ? 1 : a < b ? -1 : 0
                );
            });

            console.log(this.taskListGroup);
        } else {
            let notCompletedTasks = this.getTasks.filter((item) => {
                if (item?.status != 'Completed') return item;
            });
            let currentdate = formatDate(new Date(), 'YYYY-MM-dd', this.locale);

            this.todayCompletedTasks = this.getTasks.filter((item) => {
                if (item?.status == 'Completed' && item?.duedate == currentdate)
                    return item;
            });

            let userTasks = notCompletedTasks;
            this.taskListGroup = [];

            userTasks.forEach((obj) => {
                if (
                    !this.taskListGroup.some((o) => o.mobileno === obj.mobileno)
                ) {
                    this.taskListGroup.push(obj);
                }
            });
            this.taskListGroup.forEach((group) => {
                group['assgdtasks'] = [];
            });
            this.taskListGroup.forEach((group) => {
                userTasks.forEach((task) => {
                    if (group.mobileno == task.mobileno) {
                        group['assgdtasks'].push(task);
                        group['childActive'] = true;
                    }
                });
            });
            this.taskListGroup = this.taskListGroup.filter((item) => {
                if (item.assgdtasks.length != 0) return item;
            });
            this.taskListGroup[0].childActive = true;
            console.log(this.taskListGroup);
            // sorting data based on start time

            this.taskListGroup.forEach((group) => {
                // sorting data based on start time

                this.taskListGroup.forEach((group) => {
                    group.assgdtasks.sort(
                        ({ starttime: a }, { starttime: b }) =>
                            a > b ? 1 : a < b ? -1 : 0
                    );
                });
            });
        }
    }
    OnTaskClick(task) {
        this._router.routeReuseStrategy.shouldReuseRoute = () => true;
        let taskid = task.taskid;
        this._router
            .navigate([`nfm/kitchen-tasks/TASKMGM/task-details/${taskid}`], {
                skipLocationChange: true,
            })
            .then(() => {
                this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            });
    }
    OnAddTask() {
        this._router.navigate(['nfm/kitchen-tasks/TASKMGM/task-details'], {
            skipLocationChange: true,
        });
    }
    toggleCompletedTasks() {
        this.isCompletedTasksVisible = !this.isCompletedTasksVisible;
    }
    ToggleMainTasks(task) {
        task.childActive = !task.childActive;
    }
}
