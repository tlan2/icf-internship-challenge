
var appToken = config.MY_KEY;
var secretkey = config.SECRET_KEY;
var ajaxResult = [];
var counts = [];

const DATA_LIMIT = 57834; // Max # of records that contained "cancer" in description
const baseUrl = "https://health.data.ny.gov/resource/gnzp-ekau.json?$where=UPPER(ccs_diagnosis_description) like '%25CANCER%25'";

// Hard-Coded for the purposes of time; Better solution is storing in global variable
const ageGroups = ['All Ages', '0 to 17', '18 to 29', '30 to 49', '50 to 69', '70 or Older'];
const cancerTypes = 
['All Cancer Types', 'Cancer of bladder', 'Cancer of bone and connective tissue', 'Cancer of brain and nervous system', 'Cancer of breast', 
'Cancer of bronchus; lung', 'Cancer of cervix', 'Cancer of colon', 'Cancer of esophagus', 'Cancer of head and neck', 'Cancer of kidney and renal pelvis', 
'Cancer of liver and intrahepatic bile duct', 'Cancer of other GI organs; peritoneum', 'Cancer of other female genital organs', 'Cancer of other male genital organs', 
'Cancer of other urinary organs', 'Cancer of ovary', 'Cancer of pancreas', 'Cancer of prostate', 'Cancer of rectum and anus', 'Cancer of stomach', 'Cancer of testis', 
'Cancer of thyroid', 'Cancer of uterus', 'Cancer; other and unspecified primary', 'Cancer; other respiratory and intrathoracic', 'Other non-epithelial cancer of skin'];
const discharge = 
['Another Type Not Listed', 'Cancer Center or Children\'s Hospital', 'Court/Law Enforcement', 'Critical Access Hospital', 
'Expired', 'Facility w/ Custodial/Supportive Care', 'Federal Health Care Facility', 'Home or Self Care', 'Home w/ Home Health Services', 
'Hosp Basd Medicare Approved Swing Bed', 'Hospice - Home', 'Hospice - Medical Facility', 'Inpatient Rehabilitation Facility', 'Left Against Medical Advice', 
'Medicaid Cert Nursing Facility', 'Medicare Cert Long Term Care Hospital', 'Psychiatric Hospital or Unit of Hosp', 'Short-term Hospital', 'Skilled Nursing Home'];
const ethnicities = ['Multi-ethnic', 'Not Span/Hispanic', 'Spanish/Hispanic', 'Unknown'];
const race = ['Black/African American', 'Multi-racial', 'Other Race', 'White']

//                            Ages: All Ages, 0-17, 18-29, 30-49,  50-69,  70+
const africanAmericanVisitsByAge = [  8624,   100,   94,   1056,   4635,  2739];
const multiRacialVisitsByAge =     [  581,     30,    6,     70,    260,   215];
const otherRaceVisitsByAge =       [ 12610,   235,  282,   2021,   6289,  3783];
const whiteVisitsByAge =           [ 36019,   422,  376,   3429,  17031, 14761];

/**
 * Creates Pie chart of Mortality Rates across Race
 */

function chart1Wrapper(){
  dropDownFromArray("c1drop1", ageGroups);
  chart1();
}

function chart1(){
  var age = getDropDownValue("c1drop1");
  console.log(age);
  var ageUrl = ageGroupsQueryString(age);
  var url = `https://health.data.ny.gov/resource/gnzp-ekau.json?$query=SELECT race, COUNT(patient_disposition) AS TOTAL_DEATHS WHERE%20UPPER(ccs_diagnosis_description)%20like%20%27%25CANCER%25%27 AND patient_disposition in('Expired', 'Hospice - Home', 'Hospice - Medical Facility') ${ageUrl} GROUP BY race`;
  console.log(url);
    $.ajax({
      url: url,
      type: "GET",
      contentType: "application/json; charset=utf-8", // this
      dataType: "json", // and this
      data: {
        "$$app_token" : appToken
      }
  }).done(function(data) {
    // alert("Retrieved " + data.length + " records from the dataset!");
    // console.log(data.length);
    console.log(data);
    var results = [];

    var raceTotalVisitsMap = new Map();
    for(var i=0; i < africanAmericanVisitsByAge.length; i++){
      raceTotalVisitsMap.set('Black/African American_' + ageGroups[i], africanAmericanVisitsByAge[i]);
      raceTotalVisitsMap.set('Multi-racial_' + ageGroups[i], multiRacialVisitsByAge[i]);
      raceTotalVisitsMap.set('Other Race_' + ageGroups[i], otherRaceVisitsByAge[i]);
      raceTotalVisitsMap.set('White_' + ageGroups[i], whiteVisitsByAge[i]);
    }

    for(var i=0; i < data.length; i++){
      console.log(data[i]);
      var key = data[i].race + "_" + age;
      console.log("key = " + key);
      console.log(raceTotalVisitsMap.get(key));
      var mortalityRate = calculateMortalityRate(data[i].TOTAL_DEATHS, raceTotalVisitsMap.get(key));
      console.log(mortalityRate)
      results.push(mortalityRate);
    }

    createPieChart("pieChart", results, race);
  });
}

function getDropDownValue(id) {
  return document.getElementById(id).value;
}

function dropDownFromArray(id, arr){
  var select = document.getElementById(id);

  for(var i = 0; i < arr.length; i++){
    var option = arr[i];
    var element = document.createElement("option");
    element.textContent = option;
    element.value = option;
    select.appendChild(element);
  }
}

function createPieChart(id, values, labels){
    var data = [{
      values: values,
      labels: labels,
      type: 'pie',
      textinfo: 'value'
    }];
    
    var layout = {
      height: 400,
      width: 500
    };

  Plotly.newPlot(id, data, layout);
}

function ageGroupsQueryString(value){
  let string = value.toLowerCase() == "all ages" ? "" : "AND age_group='" + value + "'";
  return string;
}

function cancerTypesQueryString(value){
  let string = value.toLowerCase() == "all cancer types" ? "" : "&ccs_diagnosis_description=" + value;
  return string;
}

function dischargeQueryString(value){
  let string = value.toLowerCase() != "expired" ? "" : "&patient_disposition=" + value;
  return string;
}

function raceQueryString(value){
  let string = value.toLowerCase() == 'allethnicities' ? "" : "&race=" + value;
  return string
}

function createRaceTotalVisitsMap(){
  
  console.log(raceTotalVisitsMap);
  return raceTotalVisitsMap;
}

function calculateMortalityRate(totalDeaths, totalPatients){
  var num = (1000 * totalDeaths) / totalPatients;
  return num.toFixed(2);
}

//getDataCount(baseUrl);
//getParameterVals();
chart1Wrapper();
// chart2();
// chart3();
// chart4();
// chart5();





