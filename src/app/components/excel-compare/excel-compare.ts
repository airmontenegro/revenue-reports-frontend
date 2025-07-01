import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-excel-compare',
  imports: [],
  templateUrl: './excel-compare.html',
  styleUrl: './excel-compare.scss'
})
export class ExcelCompare {
 @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  triggerFileInput() {
    this.fileInputRef.nativeElement.click();
  }

  handleFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length !== 2) {
      alert('Please select exactly 2 Excel files.');
      return;
    }

    // You now have both files:
    const fileA = files[0];
    const fileB = files[1];
    console.log('Fajlovi', fileA, fileB);
    
    // Next step: parse and compare them
  }
}
