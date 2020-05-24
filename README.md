# series-list-fredApi
Google Sheets access to FRED API using Google Apps Script

This script is designed to pull data from the FRED API. 
Documentation for the FRED API: https://fred.stlouisfed.org/docs/api/fred/

# To use it, you'll need:

* A free FRED API key available from https://research.stlouisfed.org/docs/api/api_key.html
* A google sheet with a sheet called "Series" listing the FRED code for the series and parameters for the query.
* Test sheet with examples: https://docs.google.com/spreadsheets/d/1hkwqTgAVy-0vlpMOw8czQ3AANK0xdApeWQQavHpgSig/edit#gid=0 

# Use: 

- On sheet Notes/Technical: copy your 32-character FRED API Key to a one-cell Named Range called APIKey (currently cell A1 above).	
- On sheet Series: enter FRED series names in blue cells; and adjust parameters in pale blue section by selecting frequency, dates, etc. (blanks give the FRED defaults).	
- Use Data -> Script Editor to open a Google Apps Script associated with the spreadsheet and paste this script into the script editor window, updating the FRED API key with the same key registered in step 1	
- From the FRED item on the menu, select "Get FRED Series"	
	
# Source Notes	
- Forked from https://github.com/timsternation/fredApi/
- Michael Ash (UMass Amherst) & the FRED team (Federal Reserve Bank of St. Louis). Comments welcome: mash@econs.umass.edu

# To Do List
- [x] Retrieve series metadata
- [x] Read list of desired series and parameters (start, end, order, etc.) from spreadsheet
- [ ] Permit join series by date


