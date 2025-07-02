import { Component, ElementRef, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-excel-compare',
  templateUrl: './excel-compare.html',
  styleUrls: ['./excel-compare.scss'],
  standalone: true,
})
export class ExcelCompare {
  @ViewChild('hititInput') hititInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('bankInput') bankInputRef!: ElementRef<HTMLInputElement>;
  hititFileLoaded = false;

  hititData: any[] = [];
  bankData: any[][] = [];
  hititDate: string = '';
  filteredBankData: any[] = [];


  // Trigger hidden file input
  triggerHititInput() {
    this.hititInputRef.nativeElement.click();
  }

  triggerBankInput() {
    this.bankInputRef.nativeElement.click();
  }

  // Handle selection of two files
  async handleHititFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      try {
        this.hititData = await this.readExcelFile(file);
        this.hititFileLoaded = true;
        this.hititData = this.hititData.filter(record =>
          record['Vpos']?.trim() === 'ALLSECURE' &&
          (!record['Parent PNR No'] || record['Parent PNR No'].trim() === '')
        );
        console.log('✅ Hitit file parsed:', this.hititData);

      } catch (err) {
        alert('Failed to parse Hitit file.');
      }
    }

    let rawDate = this.hititData[0]?.['Slip Date'] || '';
    let hititDate = '';

    if (rawDate) {
      console.log('parsed date ', rawDate)
      const hititDate = this.parseDateFromSlashFormat(rawDate);

      this.hititDate = hititDate as any;
      console.log('📅 Hitit date extracted:', this.hititDate);
    }
  }

  parseDateFromSlashFormat(dateStr: string): string | null {
    const [datePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');

    const utcTimestamp = Date.UTC(+year, +month - 1, +day); // Month is 0-based
    const date = new Date(utcTimestamp);

    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }

  async handleBankFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length) {
      this.bankData = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const data = await this.readExcelFile(files[i]);
          this.bankData.push(data);
          console.log(`✅ Bank file ${files[i].name} parsed`);
        } catch (err) {
          alert(`Failed to parse bank file: ${files[i].name}`);
        }
      }

      if (this.hititDate) {
        const merged = this.bankData.flat();
        console.log('Merged bank files data', merged)
        this.filteredBankData = merged.filter(record => {
          const valuta = record.Valuta;
          if (!valuta) return false;

          const parsed = new Date(valuta);
          const formatted = parsed.toISOString().split('T')[0];

          return formatted === this.hititDate;
        });

        console.log('✅ Filtered bank data by Hitit date:', this.filteredBankData);
      }
    }
  }

  readExcelFile(file: File): any {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        resolve(json);
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

  }

}
