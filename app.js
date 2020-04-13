const $ = elem => document.querySelector(elem);

const form = $('#covid19-form');
const population = $('[data-populaton]');
const timeToElapse = $('[data-time-to-elapse]');
const reportedCases = $('[data-reported-cases]');
const totalHospitalBeds = $('[data-total-hospital-beds]');
const periodType = $('[data-period-type]');


// Middle Column
const midPopulation = $(".population");
const midTimeToElapse = $(".timeToElapse");
const midPeriodType = $(".periodType");
const midReportedCases = $(".reportedCases");
const midTotalHospitalBeds = $(".totalHospitalBeds");


// Estimates Column
const ui_currentlyInfected = $(".currentlyInfected");
const ui_infectionsByRequestedTime = $(".infectionsByRequestedTime");
const ui_severeCasesByRequestedTime = $(".severeCasesByRequestedTime");
const ui_hospitalBedsByRequestedTime = $(".hospitalBedsByRequestedTime");
const ui_casesForICUByRequestedTime = $(".casesForICUByRequestedTime");
const ui_casesForventilatorsByRequestedTime = $(".casesForventilatorsByRequestedTime");
const ui_dollarsInFlight = $(".dollarsInFlight");


// Estimates Column: Severe Cases
const x_currentlyInfected = $(".x-currentlyInfected");
const x_infectionsByRequestedTime = $(".x-infectionsByRequestedTime");
const x_severeCasesByRequestedTime = $(".x-severeCasesByRequestedTime");
const x_hospitalBedsByRequestedTime = $(".x-hospitalBedsByRequestedTime");
const x_casesForICUByRequestedTime = $(".x-casesForICUByRequestedTime");
const x_casesForventilatorsByRequestedTime = $(".x-casesForventilatorsByRequestedTime");
const x_dollarsInFlight = $(".x-dollarsInFlight");

midPeriodType.innerHTML = `<p>Period (days, weeks, months):</p> ${periodType.value}`;


// Add Event Listeners On All Inputs
const addListenersOnInput = (eventType, elementWithListener, elementToChanged, textInElem) => {
  elementWithListener.addEventListener(eventType, event => {
    elementToChanged.innerHTML = `<p>${textInElem} ${event.target.value}</p>`;
  })
}

addListenersOnInput('keyup', population, midPopulation, 'Population:');
addListenersOnInput('keyup', timeToElapse, midTimeToElapse, 'Timme To Elapse:');
addListenersOnInput('keyup', reportedCases, midReportedCases, 'Number of Reported Cases:');
addListenersOnInput('change', periodType, midPeriodType, 'Period (days, weeks, months):');
addListenersOnInput('keyup', totalHospitalBeds, midTotalHospitalBeds, 'Total Hospital Beds:');


const updateUIwithEstimates = (outputData) => {
  const { impact, severeImpact } = outputData;

  updateLessCaseScenario(impact);
  updateSevereCaseScenario(severeImpact);
}


const updateLessCaseScenario = (impactData) => {
  const { 
    currentlyInfected,
    infectionsByRequestedTime,
    severeCasesByRequestedTime,
    hospitalBedsByRequestedTime,
    casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime,
    dollarsInFlight 
  } = impactData;

  // console.table(impactData);

  ui_currentlyInfected.innerHTML = `<p>Currently Infected: ${currentlyInfected}</p>`;
  ui_infectionsByRequestedTime.innerHTML = `<p>Infections By Requested Time: ${infectionsByRequestedTime}</p>`;
  ui_severeCasesByRequestedTime.innerHTML = `<p>Severe Cases By Requested Time: ${severeCasesByRequestedTime}</pSevere>`;
  ui_hospitalBedsByRequestedTime.innerHTML = `<p>Hospital Beds By Requested Time: ${hospitalBedsByRequestedTime}</p>`;
  ui_casesForICUByRequestedTime.innerHTML = `<p>Cases For ICU By Requested Time: ${casesForICUByRequestedTime}</p>`;
  ui_casesForventilatorsByRequestedTime.innerHTML = `<p>Cases For Ventilators By Requested Time: ${casesForVentilatorsByRequestedTime}</p>`;
  ui_dollarsInFlight.innerHTML = `<p>Amount of Money Lost During Outbreak: $${dollarsInFlight}</p>`;
}

const updateSevereCaseScenario = (severeImpactData) => {
  const {
    currentlyInfected,
    infectionsByRequestedTime,
    severeCasesByRequestedTime,
    hospitalBedsByRequestedTime,
    casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime,
    dollarsInFlight
  } = severeImpactData;

  x_currentlyInfected.innerHTML = `<p>Currently Infected: ${currentlyInfected}</p>`;
  x_infectionsByRequestedTime.innerHTML = `<p>Infections By Requested Time: ${infectionsByRequestedTime}</p>`;
  x_severeCasesByRequestedTime.innerHTML = `<p>Severe Cases By Requested Time: ${severeCasesByRequestedTime}</p>`;
  x_hospitalBedsByRequestedTime.innerHTML = `<p>Hospital Beds By Requested Time: ${hospitalBedsByRequestedTime}</p>`;
  x_casesForICUByRequestedTime.innerHTML = `<p>Cases For ICU By Requested Time: ${casesForICUByRequestedTime}</p>`;
  x_casesForventilatorsByRequestedTime.innerHTML = `<p>Cases For Ventilators By Requested Time: ${casesForVentilatorsByRequestedTime}</p>`;
  x_dollarsInFlight.innerHTML = `<p>Amount of Money Lost During Outbreak: $${dollarsInFlight}</p>`;
}


const convertToDays = (periodType, timeToElapse) => {
  const type = periodType.toLowerCase();
  const time = Number(timeToElapse);

  switch (type) {
    case 'days':
      return time;
    case 'weeks':
      return time * 7;
    case 'months':
      return time * 30;
    default:
      return time;
  }
};


const dollars = (
  obj,
  avgDailyIncomePopulation,
  avgDailyIncomeInUSD,
  periodType,
  timeToElapse
) => {
  const ans = Math.trunc(
    (obj.infectionsByRequestedTime *
      avgDailyIncomePopulation *
      avgDailyIncomeInUSD) /
      convertToDays(periodType, timeToElapse)
  );
  return ans;
};


const estimate = (event) => {
  event.preventDefault();

  const inputData = {
    region: {
      name: 'Africa',
      avgAge: 19.7,
      avgDailyIncomeInUSD: 5,
      avgDailyIncomePopulation: 0.71
    },
    periodType: periodType.value,
    timeToElapse: Number(timeToElapse.value),
    reportedCases: Number(reportedCases.value),
    population: Number(population.value),
    totalHospitalBeds: Number(totalHospitalBeds.value)
  };
  // console.log(inputData);
  
  covid19ImpactEstimator(inputData);
  form.reset();
}

const covid19ImpactEstimator = (data) => {
  const {
    reportedCases,
    periodType,
    timeToElapse,
    totalHospitalBeds,
    region: { avgDailyIncomeInUSD, avgDailyIncomePopulation }
  } = data;

  const output = {
    data,
    impact: {},
    severeImpact: {}
  };

  // CHALLENGE 1: CurrentlyInfected
  output.impact.currentlyInfected = Math.trunc(reportedCases * 10);
  output.severeImpact.currentlyInfected = Math.trunc(reportedCases * 50);

  // Infections By Requested
  const factor = Math.trunc(convertToDays(periodType, timeToElapse) / 3);
  const power = 2 ** factor;
  output.impact.infectionsByRequestedTime =
    output.impact.currentlyInfected * power;

  output.severeImpact.infectionsByRequestedTime =
    output.severeImpact.currentlyInfected * power;

  // CHALLENGE 2: Severe Cases Requested By Time
  output.impact.severeCasesByRequestedTime = Math.trunc(
    0.15 * output.impact.infectionsByRequestedTime
  );
  output.severeImpact.severeCasesByRequestedTime = Math.trunc(
    0.15 * output.severeImpact.infectionsByRequestedTime
  );

  // Hospital Beds Requested By Time
  // eslint-disable-next-line operator-linebreak
  output.impact.hospitalBedsByRequestedTime = Math.trunc(
    0.35 * totalHospitalBeds - output.impact.severeCasesByRequestedTime
  );
  output.severeImpact.hospitalBedsByRequestedTime = Math.trunc(
    0.35 * totalHospitalBeds - output.severeImpact.severeCasesByRequestedTime
  );

  // CHALLENGE 3: CasesForICU
  output.impact.casesForICUByRequestedTime = Math.trunc(
    0.05 * output.impact.infectionsByRequestedTime
  );
  output.severeImpact.casesForICUByRequestedTime = Math.trunc(
    0.05 * output.severeImpact.infectionsByRequestedTime
  );

  // Cases For Ventilators
  output.impact.casesForVentilatorsByRequestedTime = Math.trunc(
    0.02 * output.impact.infectionsByRequestedTime
  );
  output.severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(
    0.02 * output.severeImpact.infectionsByRequestedTime
  );

  // Dollars In Flight
  output.impact.dollarsInFlight = dollars(
    output.impact,
    avgDailyIncomePopulation,
    avgDailyIncomeInUSD,
    periodType,
    timeToElapse
  );

  output.severeImpact.dollarsInFlight = dollars(
    output.severeImpact,
    avgDailyIncomePopulation,
    avgDailyIncomeInUSD,
    periodType,
    timeToElapse
  );

  updateUIwithEstimates(output)
  return output;
};

form.addEventListener('submit', estimate);
