function doGet(e) {
  if (!e.parameter.page) {
    // Default to Home page if no page parameter
    var htmlOutput = HtmlService.createTemplateFromFile('Home');
    return htmlOutput.evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    // Return requested page
    try {
      var template = HtmlService.createTemplateFromFile(e.parameter.page);
      return template.evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      // Handle errors (e.g., if the requested page doesn't exist)
      var errorTemplate = HtmlService.createTemplateFromFile('Home');
      return errorTemplate.evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  }
}

function fetchIQAirData(lat, lng) {
  const apiKey = '2522d09d-7193-4585-8198-516cc1196e81'; // ใช้ API key ของคุณ
  const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lng}&key=${apiKey}`;
  
  try {
    // ใช้ UrlFetchApp แทน fetch ใน Apps Script
    const response = UrlFetchApp.fetch(url);
    const responseText = response.getContentText();
    
    // บันทึกข้อมูลที่ได้รับเพื่อตรวจสอบ
    Logger.log("API Response: " + responseText);
    
    return responseText;
  } catch(error) {
    Logger.log("API Error: " + error);
    return JSON.stringify({
      status: 'error',
      data: { message: 'ไม่สามารถเชื่อมต่อกับ API ได้: ' + error.message }
    });
  }
}

// เพิ่มฟังก์ชันนี้เพื่อใช้ตรวจสอบโครงสร้างข้อมูล API
function testAPIResponse(lat, lng) {
  const response = fetchIQAirData(lat, lng);
  try {
    const data = JSON.parse(response);
    Logger.log("Full API Response Object:");
    Logger.log(data);
    
    if (data.status === 'success') {
      Logger.log("Data structure:");
      Logger.log("City: " + data.data.city);
      Logger.log("Weather: " + JSON.stringify(data.data.current.weather));
      Logger.log("Pollution: " + JSON.stringify(data.data.current.pollution));
      
      if (data.data.current.pollution) {
        Logger.log("AQI US: " + data.data.current.pollution.aqius);
        Logger.log("PM2.5: " + data.data.current.pollution.pm25);
      }
    }
    return "บันทึกข้อมูลเรียบร้อย ตรวจสอบในบันทึกของ Apps Script";
  } catch (e) {
    Logger.log("Error parsing JSON: " + e);
    return "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล: " + e;
  }
}

function getUrl(){
  var url = ScriptApp.getService().getUrl()
  return url
}

/* PROCESS FORM */
function processForm(formObject){  
  var result = "";
  if(formObject.searchtext){//Execute if form passes search text
      result = search(formObject.searchtext);
  }
  return result;
}


//SEARCH FOR MATCHED CONTENTS 
function search(searchtext){
  var spreadsheetId   = '1kHQEY2WTOGhdsZkKYNgCOqSHL2GCP8o4HbtEmCothsw'; //** CHANGE !!!
  var dataRange        = 'จุดเสี่ยง!A2:I';                                    //** CHANGE !!!
  var data = Sheets.Spreadsheets.Values.get(spreadsheetId, dataRange).values;
  var ar = [];
  
  data.forEach(function(f) {
    if (~f.toString().toLowerCase().indexOf(searchtext.toString().toLowerCase())) {
      ar.push(f);
    }
  });
  return ar;
}


var SCRIPT_PROP = PropertiesService.getScriptProperties();
var sheetID= '1kHQEY2WTOGhdsZkKYNgCOqSHL2GCP8o4HbtEmCothsw'
function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty(sheetID, doc.getId());
}

function uploadFile(data, file,id,stdCode,firstname,lastname,address,tel,email) {
try {1
    var folder=DriveApp.getFolderById('1Ot4RIMggNBUxeM00deCMKVQKvUnvC6Fv');
    var contentType = data.substring(5,data.indexOf(';')),
        bytes = Utilities.base64Decode(data.substr(data.indexOf('base64,')+7)),
        blob = Utilities.newBlob(bytes, contentType, file),
      file = folder.createFolder([firstname+lastname+new Date()]).createFile(blob),
        filelid =file.getId() ;
        image = 'https://lh5.googleusercontent.com/d/'+filelid
    var lock = LockService.getPublicLock();
        lock.waitLock(30000);    
    var doc = SpreadsheetApp.openById(sheetID);
    var sheet = doc.getSheetByName("จุดเสี่ยง");
    var row = [new Date,id,stdCode,firstname,lastname,address,"'"+tel,email,image];

  sheet.appendRow(row)
    return "OK";
   } catch (f) {
    return f.toString();
  } finally {
    lock.releaseLock();
  }
}

