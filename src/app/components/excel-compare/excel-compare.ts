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
    this.compareByHourAndMinute(this.hititData, this.filteredBankData);
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

compareByHourAndMinute(hititData: any[], bankData: any[]) {
  const TIME_TOLERANCE_MINUTES = 2;

  const extractTimeHHMM = (str: string): string => {
    if (!str) return '';
    const match = str.match(/\b(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : '';
  };

  const toMinutes = (str: string): number | null => {
    const match = str?.match(/\b(\d{2}):(\d{2})/);
    if (!match) return null;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  };

  const sortByTime = (arr: any[], field: string) =>
    arr.slice().sort((a, b) =>
      extractTimeHHMM(a[field]).localeCompare(extractTimeHHMM(b[field]))
    );

const normalizeAmountToNumber = (val: any): number => {
  if (val === null || val === undefined) return NaN;

  const raw = val.toString().trim();

  // Remove non-digit, non-dot, non-comma, non-minus characters
  const cleaned = raw.replace(/[^\d.,-]/g, '');

  // Case: 1,081.44 -> remove comma
  if (cleaned.match(/^\d{1,3}(,\d{3})+(\.\d+)?$/)) {
    return parseFloat(cleaned.replace(/,/g, ''));
  }

  // Case: 1.081,44 -> European style
  if (cleaned.includes('.') && cleaned.includes(',')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }

  // Case: 1081,44 -> comma as decimal
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    return parseFloat(cleaned.replace(',', '.'));
  }

  // Case: 1081.44 -> dot as decimal
  return parseFloat(cleaned);
};

  const sortedHitit = sortByTime(hititData, 'Slip Date');
  const sortedBank = sortByTime(bankData, 'Vrijeme');

  const merged: any[] = [];

  for (const hitit of sortedHitit) {
    const hititTime = toMinutes(hitit['Slip Date']);
    const hititPaid = normalizeAmountToNumber(hitit['Paid']);
    let matchedBank: any = null;

    for (const bank of sortedBank) {
      const bankTime = toMinutes(bank['Vrijeme']);
      const bankIznos = normalizeAmountToNumber(bank['Iznos']);

      if (
        hititTime !== null &&
        bankTime !== null &&
        Math.abs(hititTime - bankTime) <= TIME_TOLERANCE_MINUTES &&
        hititPaid == bankIznos
      ) {
        matchedBank = bank;
        break;
      }
    }

    if (!matchedBank) {
      const time = extractTimeHHMM(hitit['Slip Date']);
      const row: any = { Time: time };
      Object.entries(hitit).forEach(([key, val]) => {
        row[`Hitit_${key}`] = val;
      });
      merged.push(row);
    }
  }

  for (const bank of sortedBank) {
    const bankTime = toMinutes(bank['Vrijeme']);
    const bankIznos = normalizeAmountToNumber(bank['Iznos']);

    const matchedInHitit = sortedHitit.some(hitit => {
      const hititTime = toMinutes(hitit['Slip Date']);
      const hititPaid = normalizeAmountToNumber(hitit['Paid']);

      return (
        hititTime !== null &&
        bankTime !== null &&
        Math.abs(hititTime - bankTime) <= TIME_TOLERANCE_MINUTES &&
        hititPaid === bankIznos
      );
    });

    if (!matchedInHitit) {
      const time = extractTimeHHMM(bank['Vrijeme']);
      const row: any = { Time: time };
      Object.entries(bank).forEach(([key, val]) => {
        row[`Bank_${key}`] = val;
      });
      merged.push(row);
    }
  }

  // Final sort by time
  merged.sort((a, b) => {
    const ta = toMinutes(a.Time) ?? 0;
    const tb = toMinutes(b.Time) ?? 0;
    return ta - tb;
  });

  const ws = XLSX.utils.json_to_sheet(merged);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MergedByTime');
  XLSX.writeFile(wb, 'unmatched_side_by_side_by_time.xlsx');

  console.log('✅ Exported: unmatched_side_by_side_by_time.xlsx');
}



}
