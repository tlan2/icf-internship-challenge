// Tom Lancaster (c) 2022
// charts.js

var appToken = config.MY_KEY;
var secretkey = config.SECRET_KEY;
var ajaxResult = [];
var counts = [];

const DATA_LIMIT = 57834; // Max # of records that contained "cancer" in description

// Hard-Coded for the purposes of time.
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

// Total Cancer Patient Visits by Age Group
//                            Ages: All Ages, 0-17, 18-29, 30-49,  50-69,  70+
const africanAmericanVisitsByAge = [  8624,   100,   94,   1056,   4635,  2739];
const multiRacialVisitsByAge =     [  581,     30,    6,     70,    260,   215];
const otherRaceVisitsByAge =       [ 12610,   235,  282,   2021,   6289,  3783];
const whiteVisitsByAge =           [ 36019,   422,  376,   3429,  17031, 14761];

/** Call Chart Functions */
chart1Wrapper();
chart2Wrapper();
chart3();


/**
 * Creates Pie chart of Mortality Rates across Race
 */
function chart1Wrapper(){
  dropDownFromArray("c1drop1", ageGroups);
  chart1();
}

function chart1(){
  console.log("=== Chart 1 Activity ===");
  var age = getDropDownValue("c1drop1");
  console.log(age);
  var ageUrl = ageGroupsQueryString(age);
  var url = `https://health.data.ny.gov/resource/gnzp-ekau.json?$query=SELECT race, COUNT(patient_disposition) AS TOTAL_DEATHS WHERE%20UPPER(ccs_diagnosis_description)%20like%20%27%25CANCER%25%27 AND patient_disposition in('Expired', 'Hospice - Home', 'Hospice - Medical Facility') ${ageUrl} GROUP BY race`;
  console.log(url);
    $.ajax({
      url: url,
      type: "GET",
      data: {
        "$$app_token" : appToken
      }
  }).done(function(data) {
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
      var key = data[i].race + "_" + age;
      var mortalityRate = calculateMortalityRate(data[i].TOTAL_DEATHS, raceTotalVisitsMap.get(key));
      results.push(mortalityRate);
    }

    createPieChart("pieChart", results, race, age);
  });
}

function chart2Wrapper(){
  dropDownFromArray("c2drop1", cancerTypes);
  chart2();
}

function chart2(){
  console.log("=== Chart 2 Activity ===");
  var cType = getDropDownValue("c2drop1");
  console.log(cType);
  var cTypeUrl = cancerTypesQueryString(cType);
  var url = `https://health.data.ny.gov/resource/gnzp-ekau.json?$query=SELECT age_group, COUNT(ccs_diagnosis_description) AS TOTAL WHERE ${cTypeUrl} GROUP BY age_group`;
  console.log(url);
    $.ajax({
      url: url,
      type: "GET",
      data: {
        "$$app_token" : appToken
      }
  }).done(function(data) {
    console.log(data);
    var results = [];

    for(var i=0; i < data.length; i++){
      results.push(data[i].TOTAL);
    }

    createBarChart("barChart", results, ageGroups.slice(1), cType);
  });
}

function chart3(){
  console.log("=== Chart 3 Activity ===");
  var url = "https://health.data.ny.gov/resource/gnzp-ekau.json?$query=SELECT gender, race, count(ccs_diagnosis_description) as cancer_diagnoses WHERE%20UPPER(ccs_diagnosis_description)%20like%20%27%25CANCER%25%27 GROUP BY gender, race"
  console.log(url);
    $.ajax({
      url: url,
      type: "GET",
      data: {
        "$$app_token" : appToken
      }
  }).done(function(data) {
    console.log(data);
    var m = [];
    var f = []
    
    for(var i=0; i < data.length; i++){
      if(data[i].gender == "F"){
        f.push(data[i].cancer_diagnoses);
      } else { m.push(data[i].cancer_diagnoses); }
    }

    createDualBarChart("dualBar", race, f, m);
  });
}

/** Chart Helper Methods */

function createPieChart(id, values, labels, title){
    var data = [{
      values: values,
      labels: labels,
      type: 'pie',
      textinfo: 'value'
    }];

    var layout = {
      title: `${title} - # of deaths per 1000 cancer patients by race`,
      height: 400,
      width: 500
    };

  Plotly.newPlot(id, data, layout);
}

function createBarChart(id, values, labels, title){
  var data = [
    {
      x: labels,
      y: values,
      marker:{
        color: ['rgba(29,152,106,1)', 'rgba(255,192,203,1)', 'rgba(50,42,89,1)', 'rgba(241,191,1,1)', 'rgba(234,89,42,1)']
      },
      type: 'bar'
    }
  ];

  var layout = {
    title: `${title}`,
    height: 400,
    width: 500
  };

  Plotly.newPlot(id, data, layout);
}

function createDualBarChart(id, xLabels, y1Vals, y2Vals){
    var trace1 = {
      x: xLabels,
      y: y1Vals,
      marker: {
        color: ['rgba(255,192,203,1)', 'rgba(255,192,203,1)', 'rgba(255,192,203,1)', 'rgba(255,192,203,1)']
      },
      type: "bar",
      name: "Female"
    };
    var trace2 = {
      x: xLabels,
      y: y2Vals,
      marker: {
        color: ['rgba(46,98,182,1)', 'rgba(46,98,182,1)', 'rgba(46,98,182,1)', 'rgba(46,98,182,1)']
      },
      type: "bar",
      name: "Male"
    };
    var data = [trace1, trace2];
    var layout = { 
      title: "Total Cancer Diagnoses by Gender and Race",
      height: 400,
      width: 600 
    };
    Plotly.newPlot(id, data, layout);
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

function getDropDownValue(id) {
return document.getElementById(id).value;
}

function calculateMortalityRate(totalDeaths, totalPatients){
  var num = (1000 * totalDeaths) / totalPatients;
  return num.toFixed(2);
}

/** Query Helper Methods */

function ageGroupsQueryString(value){
  let string = value.toLowerCase() == "all ages" ? "" : "AND age_group='" + value + "'";
  return string;
}

function cancerTypesQueryString(value){
  let string = value.toLowerCase() == "all cancer types" ? "%20UPPER(ccs_diagnosis_description)%20like%20%27%25CANCER%25%27" : "ccs_diagnosis_description='" + value + "'";
  return string;
}