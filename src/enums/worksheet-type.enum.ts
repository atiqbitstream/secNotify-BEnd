export enum EWorksheetType {
  CSV = 'csv',
  XLSX = 'xlsx'
}

export const WORKSHEET_CONTENT_TYPE = {
  [EWorksheetType.CSV]: 'text/csv',
  [EWorksheetType.XLSX]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
