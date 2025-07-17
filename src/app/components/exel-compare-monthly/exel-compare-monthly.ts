import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-exel-compare-monthly',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exel-compare-monthly.html',
  styleUrl: './exel-compare-monthly.scss'
})
export class ExelCompareMonthly {
  @ViewChild('hititInput') hititInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('bankInput') bankInputRef!: ElementRef<HTMLInputElement>;

  hititData: any[] = [];
  bankData: any[] = [];
  comparisonResults: any[] = [];
  hititFileLoaded = false;


  triggerHititUpload() {
    this.hititInputRef.nativeElement.click();
  }

  triggerBankUpload() {
    this.bankInputRef.nativeElement.click();
  }

  async handleHititUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.readExcel(file, data => {
        this.hititData = data.filter(record =>
          record['Vpos']?.trim() === 'ALLSECURE' &&
          (!record['Parent PNR No'] || record['Parent PNR No'].trim() === '')
        );
        this.hititFileLoaded = true;
      });
    }
  }

  handleBankUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.readExcel(file, data => {
        this.bankData = data;
        this.compareDailyFiles();
      });
    }
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

  normalizeAmount = (val: any): number => {
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

  normalizeAmount1(val: any): number {
    if (!val) return NaN;
    const str = val.toString().replace(/[^\d,.-]/g, '');
    if (str.includes(',') && str.includes('.')) return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    if (str.includes(',') && !str.includes('.')) return parseFloat(str.replace(',', '.'));
    return parseFloat(str.replace(/,/g, ''));
  }

extractDate(str: string): string | null {
  if (!str) return null;

  // Match DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  let match = str.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (match) {
    const [_, d, m, y] = match;
    return `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Match YYYY-MM-DD
  match = str.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [_, y, m, d] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}

  extractTimeHM(str: string): string | null {
    const match = str?.match(/(\d{2}):(\d{2})/);
    // console.log('Vrijeme str', match)
    return match ? `${match[1]}:${match[2]}` : null;
  }

  compareDailyFiles() {
    const TIME_TOLERANCE = 5; // minutes
    const merged: any[] = [];
    console.log('this.bankData', this.bankData);
    console.log('this.hititData', this.hititData)
    // Group by date
    const hititGrouped: { [date: string]: any[] } = {};
    for (const row of this.hititData) {
      const date = this.extractDate(row['Slip Date']);
      if (date) (hititGrouped[date] ||= []).push(row);
    }

    const bankGrouped: { [date: string]: any[] } = {};
    for (const row of this.bankData) {
      console.log('bancino date date', row)

      const date = this.extractDate(row['Valuta']);
      if (date) (bankGrouped[date] ||= []).push(row);
    }

    const allDates = new Set([...Object.keys(hititGrouped), ...Object.keys(bankGrouped)]);
    for (const date of allDates) {
      const hitit = hititGrouped[date] || [];
      const bank = bankGrouped[date] || [];
      console.log('Hitit grouped by date', hitit);
      console.log('Bank grouped by date', bank);
      const usedBank = new Set<number>();

      for (const h of hitit) {
        const hTime = this.extractTimeHM(h['Slip Date']);
        const hMin = hTime ? parseInt(hTime.split(':')[0]) * 60 + parseInt(hTime.split(':')[1]) : NaN;
        const hAmt = this.normalizeAmount(h['Paid']);

        let matched = false;
        for (let i = 0; i < bank.length; i++) {
          if (usedBank.has(i)) continue;
          const bTime = this.extractTimeHM(bank[i]['Vrijeme']);
          const bMin = bTime ? parseInt(bTime.split(':')[0]) * 60 + parseInt(bTime.split(':')[1]) : NaN;
          const bAmt = this.normalizeAmount(bank[i]['Iznos']);

          if (!isNaN(hMin) && !isNaN(bMin) && Math.abs(hMin - bMin) <= TIME_TOLERANCE && hAmt === bAmt) {
            usedBank.add(i);
            matched = true;
            break;
          }
        }

        if (!matched) {
          merged.push({
            Time: `${date} ${hTime}`,
            ...Object.fromEntries(Object.entries(h).map(([k, v]) => [`Hitit_${k}`, v]))
          });
        }
      }

      for (let i = 0; i < bank.length; i++) {
        if (!usedBank.has(i)) {
          const bTime = this.extractTimeHM(bank[i]['Vrijeme']);
          merged.push({
            Time: `${date} ${bTime}`,
            ...Object.fromEntries(Object.entries(bank[i]).map(([k, v]) => [`Bank_${k}`, v]))
          });
        }
      }
    }

    merged.sort((a, b) => new Date(a.Time).getTime() - new Date(b.Time).getTime());
    this.comparisonResults = merged;
  }

  exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(this.comparisonResults);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rezultati');
    XLSX.writeFile(wb, 'rezultati_po_danu_10min.xlsx');
  }
}