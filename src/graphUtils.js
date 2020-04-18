import { Stats } from 'fast-stats';

const getInProjection = entries => {
  const record = [];
  const projectionDiff = [];

  for (let i = 0; i < entries.length; i++) {
    if (entries[i].smoothed && entries[i].minProjected && entries[i].maxProjected) {
      const isInProjection = (entries[i].smoothed >= entries[i].minProjected) && (entries[i].smoothed <= entries[i].maxProjected);

      record.push(isInProjection);

      if (!isInProjection) {
        const amountAbove = Math.max(0, entries[i].smoothed - entries[i].maxProjected);
        const amountBelow = Math.max(0, entries[i].minProjected - entries[i].smoothed);
        const projectionAverage = (entries[i].minProjected + entries[i].maxProjected) / 2;

        if (amountAbove !== 0) {
          const percentDiff = amountAbove / projectionAverage;
          projectionDiff.push(percentDiff);
        } else if (amountBelow !== 0) {
          const percentDiff = amountBelow / projectionAverage;
          projectionDiff.push(percentDiff);
        }
      }
    }
  }

  const averageDiff = projectionDiff.length ? (projectionDiff.reduce((sum, diff) => sum + diff, 0) / projectionDiff.length) : 0;
  const trueRecords = record.filter(Boolean);

  return {
    inProjection: ((trueRecords.length / record.length) * 100).toFixed(1),
    averageDiff: (averageDiff * 100).toFixed(1)
  };
};

const getMinimum = entries => {
  const entriesToSum = entries.filter(({ glucose }) => typeof glucose === 'number');

  const glucoseLevels = entriesToSum.map(({ glucose }) => glucose);

  return Math.min(...glucoseLevels);
};

const getAverage = entries => {
  const entriesToSum = entries.filter(({ glucose }) => typeof glucose === 'number');

  const sum = entriesToSum.reduce((sum, { glucose }) => sum + glucose, 0);

  return Math.floor(sum / entriesToSum.length);
};

const getMaximum = entries => {
  const entriesToSum = entries.filter(({ glucose }) => typeof glucose === 'number');

  const glucoseLevels = entriesToSum.map(({ glucose }) => glucose);

  return Math.max(...glucoseLevels);
};

const getMinimumVelocity = entries => {
  const entriesToSum = entries.filter(({ velocity }) => typeof velocity === 'number');

  const velocityLevels = entriesToSum.map(({ velocity }) => velocity);

  return Math.min(...velocityLevels);
};

const getAverageVelocity = entries => {
  const entriesToSum = entries.filter(({ velocity }) => typeof velocity === 'number');

  const sum = entriesToSum.reduce((sum, { velocity }) => sum + velocity, 0);

  return Math.floor(sum / entriesToSum.length);
};

const getMaximumVelocity = entries => {
  const entriesToSum = entries.filter(({ velocity }) => typeof velocity === 'number');

  const velocityLevels = entriesToSum.map(({ velocity }) => velocity);

  return Math.max(...velocityLevels);
};

const getMinimumAcceleration = entries => {
  const entriesToSum = entries.filter(({ acceleration }) => typeof acceleration === 'number');

  const accelerationLevels = entriesToSum.map(({ acceleration }) => acceleration);

  return Math.min(...accelerationLevels);
};

const getAverageAcceleration = entries => {
  const entriesToSum = entries.filter(({ acceleration }) => typeof acceleration === 'number');

  const sum = entriesToSum.reduce((sum, { acceleration }) => sum + acceleration, 0);

  return Math.floor(sum / entriesToSum.length);
};

const getMaximumAcceleration = entries => {
  const entriesToSum = entries.filter(({ acceleration }) => typeof acceleration === 'number');

  const accelerationLevels = entriesToSum.map(({ acceleration }) => acceleration);

  return Math.max(...accelerationLevels);
};

const getStandardDeviation = entries => {
  const glucoseValues = entries
    .filter(({ glucose }) => typeof glucose === 'number')
    .map(({ glucose }) => glucose);

  const stats = new Stats().push(...glucoseValues);
  return Math.floor(stats.σ());
};

const getVelocities = entries => {
  const glucoseValues = entries
    .filter(({ glucose }) => typeof glucose === 'number')
    .map(({ glucose }) => glucose);
};

const getTimeStringFromDate = date => {
  const newDate = new Date(date);
  const hours = newDate.getHours();
  const minutes = `${newDate.getMinutes()}`;
  const isPm = hours > 12;
  const hoursInTwelveHourFormat = isPm ? hours - 12 : hours;

  return `${hoursInTwelveHourFormat}:${minutes.length === 1 ? `0${minutes}` : minutes} ${isPm ? 'pm' : 'am'}`;
};

const getDurationString = entries => {
  const minutes = entries.length * 5;
  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes - hours * 60;
  const formattedMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes;

  return `${hours}:${formattedMinutes}:00`;
};

const getStartString = entries => {
  return entries[0] && entries[0].date && getTimeStringFromDate(entries[0].date);
};

const getEndString = entries => {
  return entries[entries.length - 1] && entries[entries.length - 1].date && getTimeStringFromDate(entries[entries.length - 1].date);
};

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const getDateStringFromDate = date => {
  if (!date) {
    return '';
  }

  const dateObject = new Date(date);
  const dayOfWeek = DAYS_OF_WEEK[dateObject.getDay()];
  const month = dateObject.getMonth() + 1;
  const formattedDate = dateObject.getDate();
  const hours = dateObject.getHours();

  return `${dayOfWeek} ${month}/${formattedDate} 12:00${hours === 0 ? 'am' : 'pm'} - 12:00${hours === 0 ? 'pm' : 'am'}`;
};

export {
  getInProjection,
  getMinimum,
  getAverage,
  getMaximum,
  getMinimumVelocity,
  getAverageVelocity,
  getMaximumVelocity,
  getMinimumAcceleration,
  getAverageAcceleration,
  getMaximumAcceleration,
  getStandardDeviation,
  getVelocities,
  getTimeStringFromDate,
  getDurationString,
  getStartString,
  getEndString,
  getDateStringFromDate
};
