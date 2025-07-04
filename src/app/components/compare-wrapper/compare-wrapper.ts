import { Component } from '@angular/core';
import { ExcelCompare } from '../excel-compare/excel-compare';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compare-wrapper',
  imports: [ExcelCompare, CommonModule],
  templateUrl: './compare-wrapper.html',
  styleUrl: './compare-wrapper.scss'
})
export class CompareWrapper {
  activeTab = 'daily';

}
