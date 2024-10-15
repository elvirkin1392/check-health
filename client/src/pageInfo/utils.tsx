
export const data = [
  {
    start_date: new Date(2022, 9, 14),
    end_date: new Date(2022, 9, 24)
  },
  {
    start_date: new Date(2024, 5, 17),
    end_date: new Date(2024, 5, 23)
  },
  {
    start_date: new Date(2024, 2, 17),
    end_date: new Date(2024, 2, 27)
  },
  {
    start_date: new Date(2023, 9, 14),
    end_date: new Date(2023, 9, 24)
  },
].sort((a, b) => {
  if (a.start_date > b.start_date) return 1;
  return -1;
});

const getDiffDays = (start, end) => {
  const diffTime = Math.abs(start - end)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export const getSickDaysLastYear = (dataArr) => {
  if(!dataArr) return 0;
  const startPeriod = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  let countDays = 0;


  for (let i = dataArr.length - 1; i >= 0; i--) {
    const startDate = new Date(dataArr[i].start_date);
    const endDate = new Date(dataArr[i].end_date);

    if (startDate > startPeriod) {

      countDays = countDays + getDiffDays(startDate, endDate);


    } else if (endDate > startPeriod) {

      countDays = countDays + getDiffDays(endDate, startPeriod);

    } else {
      return countDays;
    }
  }
  return countDays
}

export const getAmountHealthyDays = (dataArr) => {
  if(dataArr.length === 0) return 0;

  const endDate = new Date(dataArr[dataArr.length - 1].end_date);
  return getDiffDays(new Date(), endDate);
}