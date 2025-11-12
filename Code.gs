/**
 * Function to Start HTML Google Web App
 */
function doGet(e){

  if (!e.parameter.page) {

    return HtmlService.createTemplateFromFile('Home').evaluate();

  } else {

    return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate();

  }
};

/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {

  var url = ScriptApp.getService().getUrl();
  return url

};


/**
 * Mengambil daftar Lokasi Transmisi unik (untuk dropdown pertama).
 */
function getUniqueLocations() {
  // Pastikan ID Spreadsheet ini sudah benar (sesuai dengan yang Anda berikan)
  const SPREADSHEET_ID = '1_vKbqR8abmBvj53oPLxOmkZbAO2Ah5KtFwu1-_zDvDs'; 
  const SHEET_NAME = 'Sheet1'; 

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0]; 
    
    // Ambil semua data dari Kolom C (Lokasi Transmisi), mulai dari baris 2
    const range = sheet.getRange("C2:C" + sheet.getLastRow());
    const values = range.getValues();
    
    // Proses data: ratakan, filter nilai kosong, dan ambil nilai unik
    const locations = values.flat().filter(String).map(s => s.trim());
    const uniqueLocations = [...new Set(locations)];
    
    uniqueLocations.sort();
    return uniqueLocations;
    
  } catch (e) {
    Logger.log("Error getUniqueLocations: " + e.toString());
    return ["Error loading locations: " + e.message];
  }
}

/**
 * Mengambil daftar Nama Pegawai unik berdasarkan Lokasi yang dipilih.
 * @param {string} selectedLocation Lokasi Transmisi yang dipilih.
 */
function getFilteredEmployees(selectedLocation) {
  const SPREADSHEET_ID = '1_vKbqR8abmBvj53oPLxOmkZbAO2Ah5KtFwu1-_zDvDs';
  const SHEET_NAME = 'Sheet1';

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    
    // Ambil data dari Kolom B (Nama Pegawai) dan Kolom C (Lokasi Transmisi)
    // Range: B2:C[lastRow]
    const lastRow = sheet.getLastRow();
    // getRange(baris mulai, kolom mulai (B=2), jumlah baris, jumlah kolom (2: B dan C))
    const range = sheet.getRange(2, 2, lastRow - 1, 2); 
    const data = range.getValues();
    
    const employees = [];
    
    // Filter data berdasarkan lokasi yang dipilih
    data.forEach(row => {
      const employeeName = row[0] ? row[0].toString().trim() : ''; // Kolom B
      const location = row[1] ? row[1].toString().trim() : '';      // Kolom C
      
      // Jika lokasi cocok DAN nama pegawai tidak kosong
      if (location === selectedLocation && employeeName) {
        employees.push(employeeName);
      }
    });

    // Ambil nilai unik dari Nama Pegawai
    const uniqueEmployees = [...new Set(employees)];
    uniqueEmployees.sort();

    return uniqueEmployees;
    
  } catch (e) {
    Logger.log("Error getFilteredEmployees: " + e.toString());
    return ["Error loading employees: " + e.message];
  }
}