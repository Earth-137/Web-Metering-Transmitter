/**
 * Fungsi utama yang dipanggil saat Web App diakses (GET request).
 * Menggunakan parameter 'page' di URL untuk menentukan file HTML mana yang akan dimuat.
 * @param {Object} e Event object dari request.
 * @return {HtmlOutput} Output HTML untuk ditampilkan.
 */
function doGet(e) {
  // Tentukan file HTML yang akan dimuat. Default: Beranda.html
  let template = HtmlService.createTemplateFromFile('Beranda');
  
  // Jika ada parameter 'page', ganti template
  if (e && e.parameter && e.parameter.page) {
    try {
      // e.parameter.page harus cocok dengan nama file HTML (misal: 'Dashboard' atau 'TabelData')
      template = HtmlService.createTemplateFromFile(e.parameter.page);
    } catch (error) {
      Logger.log('Halaman tidak ditemukan: ' + e.parameter.page);
      // Jika file tidak ada, kembali ke Beranda
      template = HtmlService.createTemplateFromFile('Beranda'); 
    }
  }

  // Menambahkan fungsi untuk mendapatkan URL Web App (digunakan di HTML untuk navigasi)
  // Ini penting agar tombol navigasi di HTML dapat berfungsi
  template.url = ScriptApp.getService().getUrl();

  // Evaluasi template
  var output = template.evaluate()
      .setTitle('Monitoring Transmitter TVRI Sulawesi Tengah');

  // PENTING: TAMBAHKAN KODE INI UNTUK MEMPERBAIKI TAMPILAN RESPONSIVE DI HANDPHONE
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
      
  return output;
}

// Fungsi bantu (getScriptURL) yang mungkin Anda butuhkan di HTML
function getScriptURL(path) {
  return ScriptApp.getService().getUrl() + path;
}

/**
 * Fungsi utilitas untuk mendapatkan URL dasar dari Web App yang di-deploy.
 * Berguna untuk membuat tautan navigasi.
 * @param {string} queryString Opsi query string tambahan (misalnya, '?page=Dashboard').
 * @return {string} URL Web App.
 */
function getScriptURL(queryString = '') {
  const url = ScriptApp.getService().getUrl();
  return url + queryString;
}

// =========================================================================
// KONFIGURASI GLOBAL SPREADSHEET DAN INDEKS KOLOM
// =========================================================================
// Ganti dengan ID Spreadsheet Anda
const SPREADSHEET_ID = '1_vKbqR8abmBvj53oPLxOmkZbAO2Ah5KtFwu1-_zDvDs'; 
// Nama Sheet Anda
const SHEET_NAME = 'Data Mentah'; 

// Indeks kolom disesuaikan berdasarkan screenshot tabel Anda:
const DATE_COL_INDEX = 0;      // Kolom A: Tanggal
const EMPLOYEE_COL_INDEX = 1;  // Kolom B: Nama Pegawai
const LOCATION_COL_INDEX = 2;  // Kolom C: Lokasi Transmisi
const FORWARD_POWER_COL_INDEX = 3;  // Kolom D: Forward Power
const REFLECTED_POWER_COL_INDEX = 4; // Kolom E: Reflected Power

/**
 * Fungsi utama yang dijalankan saat Web App diakses.
 * Menerima parameter e.parameter.page untuk menentukan halaman yang dimuat.
 * Jika tidak ada parameter, default ke "Beranda".
 */
function doGet(e) {
  // Tentukan file HTML yang akan dimuat. Default: Beranda.html
  let template = HtmlService.createTemplateFromFile('Beranda');
  
  // Jika ada parameter 'page', ganti template
  if (e && e.parameter && e.parameter.page) {
    try {
      // e.parameter.page harus cocok dengan nama file HTML (misal: 'Dashboard' atau 'TabelData')
      template = HtmlService.createTemplateFromFile(e.parameter.page);
    } catch (error) {
      Logger.log('Halaman tidak ditemukan: ' + e.parameter.page);
      // Jika file tidak ada, kembali ke Beranda
      template = HtmlService.createTemplateFromFile('Beranda'); 
    }
  }

  // Menambahkan fungsi untuk mendapatkan URL Web App (digunakan di HTML untuk navigasi)
  // Ini penting agar tombol navigasi di HTML dapat berfungsi
  template.url = ScriptApp.getService().getUrl();

  return template
      .evaluate()
      .setTitle('Monitoring Transmitter TVRI Sulawesi Tengah'); 
}

// =========================================================================
// FUNGSI API DATA UNTUK HALAMAN FILTER
// =========================================================================

/**
 * Mengambil daftar unik Lokasi Transmisi untuk Dropdown 1 (Kolom C).
 */
function getUniqueLocations() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const locations = data.slice(1).map(row => row[LOCATION_COL_INDEX]);
    
    const uniqueLocations = [...new Set(locations)]
        .filter(location => location && String(location).trim() !== "")
        .sort();
        
    return uniqueLocations;
  } catch (e) {
    Logger.log('Error getUniqueLocations: ' + e.toString());
    return [];
  }
}

/**
 * Mengambil daftar unik Nama Pegawai (Kolom B) berdasarkan lokasi yang dipilih (Kolom C).
 */
function getEmployeesByLocation(locationFilter) {
  if (!locationFilter || locationFilter === "ALL") return getUniqueEmployees(); 

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const employeeNames = [];
    
    data.slice(1).forEach(row => {
      const rowLocation = String(row[LOCATION_COL_INDEX]).trim();
      const employee = String(row[EMPLOYEE_COL_INDEX]).trim();
      
      if (rowLocation === locationFilter && employee) {
        employeeNames.push(employee);
      }
    });

    const uniqueEmployees = [...new Set(employeeNames)].sort();
    
    return uniqueEmployees;
  } catch (e) {
    Logger.log('Error getEmployeesByLocation: ' + e.toString());
    return [];
  }
}

/**
 * Fungsi pembantu untuk mengembalikan semua nama pegawai unik (Kolom B).
 */
function getUniqueEmployees() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAME);
        if (!sheet) return [];
        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return [];

        const employees = data.slice(1).map(row => row[EMPLOYEE_COL_INDEX]);
        const uniqueEmployees = [...new Set(employees)]
            .filter(emp => emp && String(emp).trim() !== "")
            .sort();
        return uniqueEmployees;
    } catch (e) {
        return [];
    }
}


/**
 * Mengambil dan memfilter data berdasarkan lokasi, pegawai, dan rentang tanggal (multi-kondisi).
 */
function getFilteredData(startDateString, endDateString, locationFilter, employeeFilter) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const timeZone = ss.getSpreadsheetTimeZone();
  
  if (!sheet) {
    return [['Error', 'Sheet tidak ditemukan. Pastikan nama sheet sudah benar.']];
  }
  
  const allData = sheet.getDataRange().getValues();
  
  if (allData.length <= 1) {
    return [['Pesan', 'Tidak ada data di sheet.']];
  }
  
  const headers = allData[0];
  const dataRows = allData.slice(1);
  
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  endDate.setHours(23, 59, 59, 999);
  
  const filteredData = [];
  filteredData.push(headers); 
  
  dataRows.forEach(row => {
    const dateValue = row[DATE_COL_INDEX]; 
    const rowLocation = String(row[LOCATION_COL_INDEX]).trim(); 
    const rowEmployee = String(row[EMPLOYEE_COL_INDEX]).trim(); 

    let isDateMatch = false;
    if (dateValue instanceof Date && dateValue >= startDate && dateValue <= endDate) {
      isDateMatch = true;
    }

    let isLocationMatch = true;
    if (locationFilter && locationFilter !== "ALL") {
      isLocationMatch = (rowLocation === locationFilter);
    }

    let isEmployeeMatch = true;
    if (employeeFilter && employeeFilter !== "ALL") {
      isEmployeeMatch = (rowEmployee === employeeFilter);
    }
    
    if (isDateMatch && isLocationMatch && isEmployeeMatch) {
      const formattedRow = row.map((cell, index) => {
        if (index === DATE_COL_INDEX && cell instanceof Date) {
          return Utilities.formatDate(cell, timeZone, "dd/MM/yyyy");
        }
        return cell;
      });
      
      filteredData.push(formattedRow);
    }
  });
  
  return filteredData;
}

// Fungsi dummy untuk kompatibilitas, tapi tidak digunakan dalam skenario filter multi-kondisi
function getDataFromSheet() {
  const RANGE = 'A1:Z100'; 
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log('Sheet tidak ditemukan.');
      return [['Pesan', 'Sheet tidak ditemukan.']]; 
    }
    const data = sheet.getRange(RANGE).getValues();
    return data;
  } catch (e) {
    Logger.log('Error saat mengambil data: ' + e.toString());
    return [['Error', e.toString()]]; 
  }

/**
 * Mengambil dan memfilter data serta memformatnya untuk kebutuhan charting.
 * Hanya mengembalikan Tanggal, Forward Power, dan Reflected Power.
 * Digunakan untuk menggambar Line Chart.
 */
function getPowerChartData(startDateString, endDateString, locationFilter, employeeFilter) {
  try {
    // Memanggil fungsi filter yang sudah ada untuk mendapatkan data
    const fullData = getFilteredData(startDateString, endDateString, locationFilter, employeeFilter);

    // fullData[0] adalah header, fullData.slice(1) adalah baris data
    if (fullData.length <= 1) return []; 

    // Transformasi data untuk chart: [{Date: String "dd/MM/yyyy", ForwardPower: Number, ReflectedPower: Number}]
    const chartData = fullData.slice(1).map(row => {
      // Pastikan data power adalah angka, dan filter baris yang tidak valid
      const fp = parseFloat(row[FORWARD_POWER_COL_INDEX]);
      const rp = parseFloat(row[REFLECTED_POWER_COL_INDEX]);
      
      // Menggunakan row[DATE_COL_INDEX] yang sudah diformat "dd/MM/yyyy" dari getFilteredData [cite: 50]
      if (!isNaN(fp) && !isNaN(rp)) {
        return {
          Date: row[DATE_COL_INDEX],
          ForwardPower: fp,
          ReflectedPower: rp
        };
      }
      return null;
    }).filter(row => row !== null); // Hapus baris yang mengandung data power tidak valid
    
    return chartData;
  } catch (e) {
    Logger.log('Error getPowerChartData: ' + e.toString());
    return [];
  }
}

}
