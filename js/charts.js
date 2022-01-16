
var mykey = config.MY_KEY;
var secretkey = config.SECRET_KEY;

const DATA_LIMIT = 57834; // Max # of records that contained "cancer" in description
const ageGroups = new Set();
const cancerTypes = new Set();
const dischargeDisposition = new Set();
const ethnicities = new Set();

function getParameterVals(){
  $.ajax({
    url: "https://health.data.ny.gov/resource/gnzp-ekau.json?$where=UPPER(ccs_diagnosis_description) like '%25CANCER%25'",
    type: "GET",
    data: {
      "$limit" : DATA_LIMIT,
      "$$app_token" : mykey
    }
  }).done(function(cancerData) {
    //alert("Retrieved " + data.length + " records from the dataset!");
    console.log(cancerData.length);
    cancerData.forEach(function (patient) {
      ageGroups.add(patient.age_group);
      cancerTypes.add(patient.ccs_diagnosis_description);
      dischargeDisposition.add(patient.patient_disposition);
      ethnicities.add(patient.race);
      ethnicities.add(patient.ethnicity);
    });
    printVar("ageGroups", Array.from(ageGroups).sort().join(", "));
    printVar("cancerTypes", Array.from(cancerTypes).sort().join(", "));
    printVar("dischargDisposition", Array.from(dischargeDisposition).sort().join(", "));
    printVar("ethnicities", Array.from(ethnicities).sort().join(", "));
  });
}

function chart1(){
}

function chart2(){
}

function chart3(){
  
}

function chart4(){
  
}

function chart5(){
  
}

function printVar(name, value){
  console.log(name + " = " + value);
}

getParameterVals();
chart1();
//chart2();
// getParameters();





