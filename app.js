const form = document.querySelector('#covid19-form');
const population = document.querySelector('[data-populaton]');
const timeToElapse = document.querySelector('[data-time-to-elapse]');
const reportedCases = document.querySelector('[data-reported-cases]');
const totalHospitalBeds = document.querySelector('[data-total-hospital-beds]');
const periodType = document.querySelector('[data-period-type]');


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
  console.log(inputData);
  
  covid19ImpactEstimator(inputData)
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
  // console.log(output);
  return output;
};

form.addEventListener('submit', estimate);
