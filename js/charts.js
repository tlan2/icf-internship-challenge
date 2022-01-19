// Tom Lancaster (c) 2022
// charts.js

// App Token Key and secret key pulled from config.js file.
// This could be used to hide keys moving forward. 
// Not done in this case for the sake of this exercise.
var appToken = config.MY_KEY;
var secretkey = config.SECRET_KEY;
var ajaxResult = [];
var counts = [];

// Max # of records that contained "cancer" in description
const DATA_LIMIT = 57834; 

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
chart4Wrapper();


/**
 * Creates drop down for pie chart and calls pie chart method.
 * Separates the static drop down menu and dynamic pie chart call.
 */
function chart1Wrapper(){
  dropDownFromArray("c1drop1", ageGroups);
  chart1();
}

/**
 * Makes API Call and creates pie chart for 
 * cancer mortality rates across race and age.
 */
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

/**
 * Makes drop down for bar chart and calls bar chart method.
 * Separates the static drop down menu and dynamic bar chart call.
 */
function chart2Wrapper(){
  dropDownFromArray("c2drop1", cancerTypes);
  chart2();
}

/**
 * Calls API call and populates bar chart for age-cancer type correlations.
 */
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

/**
 * Makes API call and creates chart for total cancer diagnoses across gender and race
 */
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

/**
 * Makes drop down for line graph chart and calls line graph chart method.
 * Separates the static drop down menu and dynamic line graph chart call.
 */
function chart4Wrapper(){
  dropDownFromArray("c4drop1", cancerTypes.slice(1));
  dropDownFromArray("c4drop2", cancerTypes.slice(1), 1);
  chart4();
}

/**
 * Creates line graph based on the selected drop down values.
 * Compares 2 cancer types
 */
function chart4(){
  console.log("=== Chart 4 Activity ===");
  var cType1 = getDropDownValue("c4drop1");
  console.log(cType1);
  var cType1String = cancerTypesQueryString(cType1);
  var cType2 = getDropDownValue("c4drop2");
  console.log(cType2);
  var cType2String = cancerTypesQueryString(cType2);
  var url = `https://health.data.ny.gov/resource/gnzp-ekau.json?$query=SELECT age_group, ccs_diagnosis_description, count(ccs_diagnosis_description) as count WHERE (${cType1String} OR ${cType2String}) GROUP BY age_group, ccs_diagnosis_description ORDER BY ccs_diagnosis_description, age_group`
  console.log(url);
    $.ajax({
      url: url,
      type: "GET",
      data: {
        "$$app_token" : appToken
      }
  }).done(function(data) {
    console.log(data);
    var c1x = [];
    var c2x = [];
    var c1y = [];
    var c2y = [];

    var xAges = createAgeValsMap();
    
    for(var i=0; i < data.length; i++){
      var xVal = data[i].age_group;
      var yVal = data[i].count;

      if(data[i].ccs_diagnosis_description.toLowerCase() === cType1.toLowerCase()){
        c1x.push(xAges.get(xVal));
        c1y.push(yVal);
      } else { 
        c2x.push(xAges.get(xVal));
        c2y.push(yVal); 
      }
    }

    createLineGraph("lineGraph", c1x, c1y, c2x, c2y, cType1, cType2, "Total Cancer Diagnoses");
  });
}

/** Chart Helper Methods */

/**
 * Creates pie chart found chart 1 for
 * cancer mortality rates across race and age.
 * 
 * @param {string} id
 * @param {TYPE} values 
 * @param {!Array<Type>} labels 
 * @param {string} title 
 */
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

/**
 * Creates bar chart for age-cancer type correlations
 * 
 * @param {string} id 
 * @param {TYPE} values 
 * @param {!ARRAY<string>} labels 
 * @param {string} title 
 */
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

/**
 * Creates grouped bar chart for 
 * total cancer diagnoses across gender and race
 * 
 * @param {string} id 
 * @param {!Array<string>}} xLabels 
 * @param {TYPE} y1Vals 
 * @param {TYPE} y2Vals 
 */
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
      width: 750 
    };
    Plotly.newPlot(id, data, layout);
}

/**
 * Returns line graph for Comparing 2 Cancer Types in chart 4.
 * 
 * @param {string} id 
 * @param {!Array<Integer>} x1Vals 
 * @param {!Array<Integer>} y1Vals 
 * @param {!Array<Integer>} x2Vals 
 * @param {!Array<Integer>} y2Vals 
 * @param {string} c1Name 
 * @param {string} c2Name 
 * @param {string} title 
 */
function createLineGraph(id, x1Vals, y1Vals, x2Vals, y2Vals, c1Name, c2Name, title){
  var trace1 = {
    x: x1Vals,
    y: y1Vals,
    name: c1Name,
    mode: 'lines+markers',
    type: 'scatter'
  };
  
  var trace2 = {
    x: x2Vals,
    y: y2Vals,
    name: c2Name,
    mode: 'lines+markers',
    type: 'scatter'
  };
  
  var data = [trace1, trace2];

  var layout = {
    title: `<b>${title} </b>`,
    height: 550,
    width: 950,
    font: {
      size: 11
    },
    xaxis: {
      title: {
        text: '<b>Age</b>',
      }
    }
  };
  
  Plotly.newPlot(id, data, layout);
}

/**
 * Calculates the mortality rate using the deaths and total patient visits.
 * Use fractions conversions to get the correct value for each category.
 *
 * @param {!Array<Integer>} totalDeaths 
 * @param {!Array<Integer>} totalPatients 
 * @returns {Float}
 */
 function calculateMortalityRate(totalDeaths, totalPatients){
  var num = (1000 * totalDeaths) / totalPatients;
  return num.toFixed(2);
}

/**
 * Creates a hash map for age x values found chart 4.
 * @returns {Map}
 */
function createAgeValsMap(){
  var ageMap = new Map();
  ageMap.set('0 to 17', 9);
  ageMap.set('18 to 29', 24);
  ageMap.set('30 to 49', 40);
  ageMap.set('50 to 69', 60);
  ageMap.set('70 or Older', 80);
  return ageMap;
}

/**
 * Populates the drop down list at the specific id
 * 
 * @param {string} id 
 * @param {!Array<string>} arr 
 * @param {Integer} selected
 */
function dropDownFromArray(id, arr, selected = 0){
    var select = document.getElementById(id);

    for(var i = 0; i < arr.length; i++){
      var option = arr[i];
      var element = document.createElement("option");
      if(i == selected) { element.selected = true; }
      element.textContent = option;
      element.value = option;
      select.appendChild(element);
    }
  }

/**
 * Returns the drop down list value
 * 
 * @param {string} id 
 * @returns {string}
 */
function getDropDownValue(id) {
  return document.getElementById(id).value;
}

/** Query Helper Methods */

/**
 * Returns valid URL query string to retrieve data based on age value.
 * 
 * @param {string} value 
 * @returns {string}
 */
function ageGroupsQueryString(value){
  let string = value.toLowerCase() == "all ages" ? "" : "AND age_group='" + value + "'";
  return string;
}

/**
 * Returns valid URL query string to retrieve data based on cancer type value.
 * @param {*} value 
 * @returns 
 */
function cancerTypesQueryString(value){
  let string = value.toLowerCase() == "all cancer types" ? "%20UPPER(ccs_diagnosis_description)%20like%20%27%25CANCER%25%27" : "ccs_diagnosis_description='" + value + "'";
  return string;
}