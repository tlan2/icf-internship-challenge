
var mykey = config.MY_KEY;
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
const dischargeDisposition = 
['Another Type Not Listed', 'Cancer Center or Children\'s Hospital', 'Court/Law Enforcement', 'Critical Access Hospital', 
'Expired', 'Facility w/ Custodial/Supportive Care', 'Federal Health Care Facility', 'Home or Self Care', 'Home w/ Home Health Services', 
'Hosp Basd Medicare Approved Swing Bed', 'Hospice - Home', 'Hospice - Medical Facility', 'Inpatient Rehabilitation Facility', 'Left Against Medical Advice', 
'Medicaid Cert Nursing Facility', 'Medicare Cert Long Term Care Hospital', 'Psychiatric Hospital or Unit of Hosp', 'Short-term Hospital', 'Skilled Nursing Home'];
const ethnicities = ['Black/African American', 'Multi-ethnic', 'Multi-racial', 'Not Span/Hispanic', 'Other Race', 'Spanish/Hispanic', 'Unknown', 'White'];

var counts;
// function getParameterVals(){
//   $.ajax({
//     url: "https://health.data.ny.gov/resource/gnzp-ekau.json?$where=UPPER(ccs_diagnosis_description) like '%25CANCER%25'",
//     type: "GET",
//     data: {
//       "$limit" : DATA_LIMIT,
//       "$$app_token" : mykey
//     }
//   }).done(function(cancerData) {
//     //alert("Retrieved " + data.length + " records from the dataset!");
//     console.log(cancerData.length);
//     var raceSet = new Set();
//     var ethnicitySet = new Set();
//     cancerData.forEach(function (patient) {
//       raceSet.add(patient.race);
//       ethnicitySet.add(patient.ethnicity);
//     });
//     printVar("raceSet", Array.from(raceSet).sort().join(", "));
//     printVar("ethnicitySet", Array.from(ethnicitySet).sort().join(", "));
//   });
// }


function getDataCount(url){
  var count = 0;
  $(document).ready(function(){
    $.ajax({
      url: url,
      async:true,
      dataType: "json",
      data: {
        "$limit" : DATA_LIMIT,
        "$$app_token" : mykey
      }, 
      success: function(data)
       { 
          console.log("data.length = " + data.length);
          ajaxResult.push(data);
       },
       error: function() {
        alert('Error occurred when retrieving data.')
      }
    });
  });
  // $(document).ready(function(){
  // var data = $.parseJSON($.ajax({
  //       url: url,
  //       type: "GET",
  //       data: {
  //         "$limit" : DATA_LIMIT,
  //         "$$app_token" : mykey
  //       },
  //       success: function(data) {
  //         //alert("Retrieved " + data.length + " records from the dataset!");
  //         console.log(data.length);
  //         addCount(data.length);
  //     }
  //     // error: function() {
  //     //   alert('Error occurred when retrieving data.')
  //     // }
  //   }).responseText);
  //   console.log(Array.isArray(data));
    
  // });
}


function chart1(){
    dropDownFromArray("age", ageGroups);
    dropDownFromArray("ethnicity", ethnicities);
}

function chart2(){
  var counts = []  
  var url = baseUrl + dischargeQueryString("Expired");
  console.log(url);
  getDataCount(url);
  console.log(Array.isArray(ajaxResult));
  console.log(Object.keys(ajaxResult).length);
  //console.log(count);
  //counts.push();
  // for (var i = 0; i < ethnicities.length; i++){
  //     var eth = ethnicities[i];
  // }

  
  var data = [{
    values: [19, 26, 55],
    labels: ethnicities,
    type: 'pie'
  }];
  
  var layout = {
    height: 400,
    width: 500
  };
  
  Plotly.newPlot('pieChart', data, layout);
}

// function chart3(){
  
// }

// function chart4(){
  
// }

// function chart5(){
  
// }

function addCount(val){
  counts.push(val);
}

function ageGroupsQueryString(value){
  let string = value.toLowerCase() == "all ages" ? "" : "&age_group=" + value;
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

function ethnicitiesQueryString(value){
  value = value.toLowerCase();
  if(value == 'all ethnicities') { return ""; }
  else if(value == 'multi-ethnic' || value == 'not span/hispanic' || value == 'spanish/hispanic' || value == 'unknown'){
    console.log(value + " is in ethnicity field");
    return "&ethnicity=" + value;
  } else {
    console.log(value + " is in race field");
    return "&race=" + value;
  }
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

function printVar(name, value){
  console.log(name + " = " + value);
}

//getDataCount(baseUrl);
//getParameterVals();
chart1();
chart2();
// chart3();
// chart4();
// chart5();





