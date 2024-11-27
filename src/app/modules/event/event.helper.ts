const getDayName = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    console.log(dayName);
    return dayName;
  };
  
  const getNextWeek = (dates: Date) => {
    const nextTuesday = new Date(dates);
    nextTuesday.setDate(dates.getDate() + 7); // Add 7 days for next week
    return nextTuesday;
  };
  
  const getNextMonth = (dates: Date) => {
    const nextMonthDate = new Date(dates);
    nextMonthDate.setMonth(dates.getMonth() + 1);
    return nextMonthDate;
  };
  
  const getNextYear = (dates: Date) => {
    const nextYearDate = new Date(dates);
    nextYearDate.setFullYear(dates.getFullYear() + 1);
    return nextYearDate;
  };
  
  export const EventDate = {
    getDayName,
    getNextWeek,
    getNextMonth,
    getNextYear,
  };