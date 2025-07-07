import { Component } from '@angular/core';
import { ExcelCompare } from '../excel-compare/excel-compare';
import { CommonModule } from '@angular/common';
import { ExelCompareMonthly } from "../exel-compare-monthly/exel-compare-monthly";

@Component({
  selector: 'app-compare-wrapper',
  imports: [ExcelCompare, CommonModule, ExelCompareMonthly],
  templateUrl: './compare-wrapper.html',
  styleUrl: './compare-wrapper.scss'
})
export class CompareWrapper {
  activeTab = 'daily';

}
