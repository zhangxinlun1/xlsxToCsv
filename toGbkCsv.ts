import { mapValues } from 'lodash';
import iconv from 'iconv-lite';

export default function toGbkCsv(data: any[]) {
  if (data.length === 0) return '';
  const safeData = data.map(row => mapValues(row, v => {
    if (typeof v === 'string') return v.replace(/,/g, '').replace(/\r\n/g, '').replace(/\n/g, '');
    return v;
  }))
  const csv = [
    Object.keys(safeData[0]).join(','),
    ...safeData.map(row => Object.values(row).join(',')),
  ].join('\n');

  return iconv.encode(csv, 'gbk');
}

