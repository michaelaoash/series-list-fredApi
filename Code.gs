/********************************
BSD License
Copyright 2020 Michael Ash
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
********************************/


/********************************
Forked from https://github.com/timsternation/fredApi/

This script is designed to pull data from the FRED API. 
Documentation for the FRED API: https://fred.stlouisfed.org/docs/api/fred/

To use it, you'll need:

1. A free FRED API key available from https://research.stlouisfed.org/docs/api/api_key.html
2. A google sheet with a sheet called "Series" listing the FRED code for the series and parameters for the query.
2a. Test sheet with examples: https://docs.google.com/spreadsheets/d/1hkwqTgAVy-0vlpMOw8czQ3AANK0xdApeWQQavHpgSig/edit#gid=0 
3. Use Data -> Script Editor to open a Google Apps Script associated with the spreadsheet and paste this script into the script editor window, updating the FRED API key below with the key you registered in step 1
4. Run the script with menu FRED -> "Get FRED Data"

// Done
Retrieve series metadata
Read list of desired series and parameters (start, end, order, etc.) from spreadsheet


// To do
Permit join series by date
********************************/

function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Get FRED Data', functionName: 'myFunction'}];
  spreadsheet.addMenu('FRED', menuItems);
}
    
// The following defines a "global" variable for the FRED API Key.
PropertiesService.getScriptProperties().setProperty('mykey', '2c43987fff98daa62e436c00e39f99ff');

// myFunction() is the main function. It loops over the sheet names to call the getnwrite 
// function for each sheet (i.e. series)
 
function myFunction(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var seriesSheet = ss.getSheetByName("Series") ;

  // Get the series and parameters from the spreadsheet.
  var range = seriesSheet.getDataRange();
  var values = range.getValues();

  // Cycle through the series (one per row) to retrieve 
  for (var i = 1; i < values.length; i++) {
    var seriesname = values[i][0] ;
    if (values[i][4] == '') 
      var observation_start = ''
    else 
      var observation_start = Utilities.formatDate(values[i][4],"GMT", "yyyy-MM-dd"); 
    if (values[i][5] == '') 
      var observation_end = ''
    else 
      var observation_end = Utilities.formatDate(values[i][5],"GMT", "yyyy-MM-dd"); 
    var sort_order_text = values[i][6] ;
    var units_text = values[i][7] ;
    var frequency_text = values[i][8] ;
    var aggregation_method_text = values[i][9];
     
    var yourNewSheet = ss.getSheetByName(seriesname);
    if (yourNewSheet != null) {
      ss.deleteSheet(yourNewSheet);
    }
    yourNewSheet = ss.insertSheet();
    yourNewSheet.setName(seriesname);  
    getnwrite(s = yourNewSheet, ser = seriesname, observation_start, observation_end, sort_order_text, units_text, frequency_text, aggregation_method_text) ;
  } 
}


// getnrwrite() calls the FRED query functions and writes the data
function getnwrite(s, ser, observation_start, observation_end, sort_order_text, units_text, frequency_text, aggregation_method_text) { 
    switch(sort_order_text) {
      case 'Descending':
        var sort_order = 'desc' ;
        break ;
      case 'Ascending':
        var sort_order = 'asc' ;
        break ;
      default: 
        var sort_order = '';
    }
    switch(units_text) {
      case 'Change from Previous Period' :
        var units = 'chg' ;
        break ;
      case 'Change from Year Ago' :
        var units = 'ch1';
        break ;
      case 'Percent Change from Previous Period' :
        var units = 'pch' ;
        break ;
      case 'Percent Change from Year Ago' :
        var units = 'pc1' ;
        break ;
      case 'Compounded Annual Rate of Change' :
        var units = 'pca' ;
        break ;
      case 'Continuously Compounded Rate of Change' :
        var units = 'cch' ;
        break ;        
      case 'Compounded' :
        var units = 'cca' ;
        break ;
      case 'Log' :
        var units = 'log' ;
        break ;        
      case 'Default Units' :
        var units = 'lin' ;
        break ;
      default :
        var units = '' ;
    }
    switch(frequency_text) {
      case 'Daily' :
        var frequency = 'd' ;
        break;
      case 'Weekly' :
        var frequency = 'w' ;
        break;
      case 'Bi-weekly' :
        var frequency = 'bw' ;
        break;
      case 'Monthly' :
        var frequency = 'm' ;
        break;
      case 'Quarterly' :
        var frequency = 'q' ;
        break ;
      case 'Seminannual' :
        var frequency = 'sa' ;
        break ; 
      case 'Annual' :
        var frequency = 'a' ;
        break ;
      default :
        var frequency = '' ;
    }
    switch(aggregation_method_text) {
      case 'End of Period' :
        var aggregation_method = 'eop';
        break ;
      case 'Sum' :
        var aggregation_method = 'sum';
        break ;
      case 'Average' :
        var aggregation_method = 'avg';
        break ;
      default :
        var aggregation_method = '';
    }
  
  var meta = fredQueryMeta(series = ser) ;
  var data = fredQueryData(series = ser, observation_start, observation_end, sort_order, units, frequency, aggregation_method) ;
  s.clear() // delete old data, because BLS sometimes revises old estimates or sheetnames may have changed.
    
  var array = []
  // write four header rows
  array[0] = (['Title' , meta.seriess[0]["title"]]) ;
  array[1] = (['Units/Seasonality' , meta.seriess[0]["units"] + " " + units_text + ' / ' + meta.seriess[0]["seasonal_adjustment_short"]]) ; 
  if (observation_start=='')
      var start_text = meta.seriess[0]["observation_start"]
      else var start_text = observation_start ;
  if (observation_end=='')
      var end_text = meta.seriess[0]["observation_end"]
      else var end_text = observation_end ;
  array[2] = ([frequency_text + " " + aggregation_method_text, start_text + ' to ' + end_text]) ; 
  array[3] = (["Date", ser]);   
  // this for-loop creates an array of the data
  for (var i = 0; i < data.observations.length; i++) {
    array[i+4] = ([data.observations[i]["date"],
                   data.observations[i]["value"]])
  }
  
  //write array to sheet
  var num = array.length.toString()
  var r = s.getRange('a1:b'+num)
  s.setActiveRange(r)
  r.setValues(array)
  Logger.log(ser+' written')
  
}

// Construct, send query to FRED API for metadata on series
function fredQueryMeta(series)  {
 var url =  'https://api.stlouisfed.org/fred/series?'
 + 'series_id=' + series
 + '&api_key=' + PropertiesService.getScriptProperties().getProperty('mykey')
 + '&file_type=json'
  ;
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  var json = response.getContentText();
  var meta = JSON.parse(json);
  Logger.log(series + ' ' + url + " metadata fetched");  
  return meta ;  
}


// Construct, send query to FRED API for a data series
function fredQueryData(series, observation_start, observation_end, sort_order, units, frequency, aggregation_method) {
  
  var url = 'https://api.stlouisfed.org/fred/series/observations?'
  + 'series_id=' + series
  + '&observation_start=' + observation_start 
  + '&observation_end=' + observation_end 
  + '&sort_order=' + sort_order 
  + '&units=' + units 
  + '&frequency=' + frequency 
  + '&aggregation_method=' + aggregation_method
  + '&api_key=' + PropertiesService.getScriptProperties().getProperty('mykey')
  + '&file_type=json'
  ;
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  // Logger.log(response);
  var json = response.getContentText();
  var data = JSON.parse(json);
  Logger.log(series + ' ' + url + " data fetched");  
  return data;  
}