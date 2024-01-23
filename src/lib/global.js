
import moment from "moment";

// Great

export class WorkdayStats {
  constructor(data) {
    this.workdayData = data;
  }


  regularHoursPerDay = 8;

  calTotalHours() {
    let totalDuration = moment.duration();
    // console.log(this.workdayData); // Log the data to the console

    this.workdayData.forEach(({ total_work_hour }) => {
      const [hours, minutes] = total_work_hour.split(":").map(Number);
      const duration = moment.duration({ hours, minutes });
      totalDuration.add(duration);
    });

    const totalHours = Math.floor(totalDuration.asHours());
    const totalMinutes = totalDuration.minutes();
    return `${totalHours.toString().padStart(2, "0")}:${totalMinutes.toString().padStart(2, "0")}`;
  }

  calTotalDaysWorked() {
    const uniqueDays = new Set();

    this.workdayData.forEach(({ date }) => {
      const formattedDate = moment(date, "YYYY/MM/DD").format("YYYY-MM-DD");
      uniqueDays.add(formattedDate);
    });

    return uniqueDays.size;
  }

  calTargetHours() {
    const totalDaysWorked = this.calTotalDaysWorked();
    const totalHours = totalDaysWorked * this.regularHoursPerDay;
  
    const targetHours = Math.floor(totalHours);
    const targetMinutes = (totalHours - targetHours) * 60;
  
    // If targetMinutes is greater than or equal to 60, increment targetHours and reset targetMinutes
    if (targetMinutes >= 60) {
      targetHours += Math.floor(targetMinutes / 60);
      targetMinutes %= 60;
    }
  
    // Format the result as HH:mm
    return `${targetHours.toString().padStart(2, "0")}:${targetMinutes.toString().padStart(2, "0")}`;
  }

  calOvertimeHours() {
    const targetHours = this.calTargetHours();
    const totalHours = this.calTotalHours();

    const [targetHoursNum, targetMinutesNum] = targetHours.split(":").map(Number);
    const [totalHoursNum, totalMinutesNum] = totalHours.split(":").map(Number);

    let overtimeHours = totalHoursNum - targetHoursNum;

    let overtimeMinutes = totalMinutesNum;

    if (overtimeMinutes < 0) {
      overtimeHours -= 1;
      overtimeMinutes += 60;
    }

    return `${overtimeHours.toString().padStart(2, "0")}:${overtimeMinutes.toString().padStart(2, "0")}`;
  }

  isHoursExceeded() {
    const totalHours = moment.duration(this.calTotalHours());
    const targetHours = moment.duration(this.calTargetHours());

    return totalHours > targetHours;
  }
  
}

export function getCurrentMonthYear() {
  const currentDate = moment();
  const currentMonth = currentDate.month() + 1;
  const currentYear = currentDate.year();
  return {
    currentMonth,
    currentYear
  };
}


export function getMonthRange(month, year) {
  // Validate input values
  if (!month || !year) {
    throw new Error('Month and year are required.');
  }

  // Ensure month is in the format 'MM'
  const formattedMonth = month.toString().padStart(2, '0');

  // Create a moment object for the first day of the specified month and year
  const firstDayOfMonth = moment(`${year}-${formattedMonth}-01`);

  // Get the last day of the month
  const lastDayOfMonth = firstDayOfMonth.clone().endOf('month');

  // Format the dates as 'YYYY-MM-DD'
  const formattedFirstDay = firstDayOfMonth.format('YYYY-MM-DD');
  const formattedLastDay = lastDayOfMonth.format('YYYY-MM-DD');


  return { formattedFirstDay, formattedLastDay };
}


export function changeMonth(viewingMonth, viewingYear, amount) {
  viewingMonth += amount;

  if (viewingMonth > 12) {
    viewingMonth = 1;
    viewingYear += 1;
  } else if (viewingMonth < 1) {
    viewingMonth = 12;
    viewingYear -= 1;
  }

  return { viewingMonth, viewingYear };
}

export function changeYear(viewingYear, amount) {
  viewingYear += amount;
  return { viewingYear };
}

export function downloadCSV(workdayData, year, month) {
  let csvData = "Date,In,Out,Hours\n";
  
  workdayData.forEach(({ date, start_time, end_time, total_work_hour }) => {
    csvData += `${date},${start_time},${end_time},${total_work_hour}\n`;
  });

  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const filename = `workday${year}-${month}.csv`; 
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
