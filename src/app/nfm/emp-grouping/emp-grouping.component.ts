import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmpAttendanceComponent } from './../emp-attendance/emp-attendance.component';

@Component({
    selector: 'app-emp-grouping',
    templateUrl: './emp-grouping.component.html',
    styleUrls: ['./emp-grouping.component.scss'],
})
export class EmpGroupingComponent implements OnInit {
    constructor(private router: Router) {}
    empsTiles = [
        {
            tileName: 'EMPDET',
        },
        {
            tileName: 'EMPLVS',
        },
        {
            tileName: 'EMPATTD',
        },
        {
            tileName: 'EMPSLRY',
        },
        {
            tileName: 'EMPPMTS',
        },
        {
            tileName: 'EMPASSIGN',
        },
    ];
    ngOnInit(): void {}
    onTabSelectionChange(event) {}
}
