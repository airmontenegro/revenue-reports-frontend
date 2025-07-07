import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-exel-compare-monthly',
  imports: [CommonModule],
  templateUrl: './exel-compare-monthly.html',
  styleUrl: './exel-compare-monthly.scss'
})

export class ExelCompareMonthly {
  @ViewChild('hititInput') hititInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('bankInput') bankInputRef!: ElementRef<HTMLInputElement>;

  hititData: any[] = [];
  bankData: any[] = [];
  comparisonDone = false;
  comparisonResults: any[] = [];
  hititFileLoaded = false;


  triggerHititUpload() {
    this.hititInputRef.nativeElement.click();
  }

  triggerBankUpload() {
    this.bankInputRef.nativeElement.click();
  }

  // handleHititUpload(event: Event) {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //     this.hititFileLoaded = false;

  //   if (file) this.readExcel(file, data => (this.hititData = data));
  // }


  async handleHititUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      try {
        if (file) this.readExcel(file, data => (this.hititData = data));
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
  }

  handleBankUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.readExcel(file, data => (this.bankData = data));
    console.log('✅ bank data:', this.bankData);
  }

  readExcel(file: File, callback: (data: any[]) => void) {
    const reader = new FileReader();
    reader.onload = e => {
      const workbook = XLSX.read(e.target?.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      callback(data);
    };
    reader.readAsBinaryString(file);
  }

  // compareMonthlyFiles() {
  //   const extractTimeHHMM = (str: string): string => {
  //     const match = str?.toString().match(/\b(\d{2}):(\d{2})/);
  //     return match ? `${match[1]}:${match[2]}` : '';
  //   };

  //   const timeToMinutes = (time: string): number => {
  //     const [hh, mm] = time.split(':').map(Number);
  //     return hh * 60 + mm;
  //   };

  //   const normalizeAmountToNumber = (val: any): number => {
  //     const raw = val?.toString().trim() ?? '';
  //     const cleaned = raw.replace(/[^\d,.-]/g, '');
  //     if (cleaned.includes(',') && cleaned.includes('.')) {
  //       return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  //     }
  //     if (cleaned.includes(',') && !cleaned.includes('.')) {
  //       return parseFloat(cleaned.replace(',', '.'));
  //     }
  //     return parseFloat(cleaned);
  //   };

  //   const hititMap = this.hititData.map(row => ({
  //     ...row,
  //     time: extractTimeHHMM(row['Slip Date']),
  //     amount: normalizeAmountToNumber(row['Paid']),
  //   }));

  //   const bankMap = this.bankData.map(row => ({
  //     ...row,
  //     time: extractTimeHHMM(row['Vrijeme']),
  //     amount: normalizeAmountToNumber(row['Iznos']),
  //   }));

  //   const toleranceMinutes = 2;
  //   const matchedIndices = new Set<number>();
  //   const unmatched: any[] = [];

  //   for (const hitit of hititMap) {
  //     const hititMin = timeToMinutes(hitit.time);
  //     const matchIdx = bankMap.findIndex((bank, idx) => {
  //       if (matchedIndices.has(idx)) return false;
  //       const bankMin = timeToMinutes(bank.time);
  //       return Math.abs(bankMin - hititMin) <= toleranceMinutes && bank.amount === hitit.amount;
  //     });

  //     if (matchIdx >= 0) {
  //       matchedIndices.add(matchIdx);
  //     } else {
  //       unmatched.push({
  //         Time: hitit.time,
  //         Hitit_Paid: hitit.amount,
  //         Bank_Iznos: '',
  //         Hitit_PNR: hitit['PNR'] || '',
  //         Bank_PAN: '',
  //       });
  //     }
  //   }

  //   bankMap.forEach((bank, idx) => {
  //     if (!matchedIndices.has(idx)) {
  //       unmatched.push({
  //         Time: bank.time,
  //         Hitit_Paid: '',
  //         Bank_Iznos: bank.amount,
  //         Hitit_PNR: '',
  //         Bank_PAN: bank['PAN'] || '',
  //       });
  //     }
  //   });

  //   const sorted = unmatched.sort((a, b) => a.Time.localeCompare(b.Time));

  //   const ws = XLSX.utils.json_to_sheet(sorted);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'MonthlyDiffs');
  //   XLSX.writeFile(wb, 'monthly_differences.xlsx');

  //   this.comparisonDone = true;
  //   console.log('✅ Exported monthly_differences.xlsx');
  // }
  compareMonthlyFiles() {
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
      const cleaned = raw.replace(/[^\d.,-]/g, '');

      if (cleaned.match(/^\d{1,3}(,\d{3})+(\.\d+)?$/)) {
        return parseFloat(cleaned.replace(/,/g, ''));
      }
      if (cleaned.includes('.') && cleaned.includes(',')) {
        return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
      }
      if (cleaned.includes(',') && !cleaned.includes('.')) {
        return parseFloat(cleaned.replace(',', '.'));
      }
      return parseFloat(cleaned);
    };

    const sortedHitit = sortByTime(this.hititData, 'Slip Date');
    const sortedBank = sortByTime(this.bankData, 'Vrijeme');

    const merged: any[] = [];

    for (const hitit of sortedHitit) {
      const hititTime = toMinutes(hitit['Slip Date']);
      const hititPaid = normalizeAmountToNumber(hitit['Paid']);
      let matched = false;

      for (const bank of sortedBank) {
        const bankTime = toMinutes(bank['Vrijeme']);
        const bankIznos = normalizeAmountToNumber(bank['Iznos']);

        if (
          hititTime !== null &&
          bankTime !== null &&
          Math.abs(hititTime - bankTime) <= TIME_TOLERANCE_MINUTES &&
          hititPaid === bankIznos
        ) {
          matched = true;
          break;
        }
      }

      if (!matched) {
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

      const matched = sortedHitit.some(hitit => {
        const hititTime = toMinutes(hitit['Slip Date']);
        const hititPaid = normalizeAmountToNumber(hitit['Paid']);

        return (
          hititTime !== null &&
          bankTime !== null &&
          Math.abs(hititTime - bankTime) <= TIME_TOLERANCE_MINUTES &&
          hititPaid === bankIznos
        );
      });

      if (!matched) {
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

    this.comparisonResults = merged;
  }

  exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(this.comparisonResults);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rezultati');
    XLSX.writeFile(wb, 'rezultati_usklađivanja_mjesec.xlsx');
  }


}
