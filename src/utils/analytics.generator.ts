import { Model } from 'mongoose';

type MonthData = {
  month: string;
  count: number;
};

export async function generatedLast12MonthData<T>(
  model: Model<T>,
): Promise<{ last12MonthsData: MonthData[] }> {
  const last12MonthsData: MonthData[] = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      currentDate.getDate(),
    );

    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 1);

    const monthYear = endDate.toLocaleString('default', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    last12MonthsData.push({ month: monthYear, count });
  }
  return { last12MonthsData };
}

//!
export async function generateLastMonthsData<T>(
  model: Model<T>,
  numberOfMonths: number,
): Promise<{ lastMonthsData: MonthData[] }> {
  const lastMonthsData: MonthData[] = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate() - 28 * numberOfMonths,
  );

  // Loop through each month
  for (let i = 0; i < numberOfMonths; i++) {
    const startDateOfMonth = new Date(startDate);
    const endDateOfMonth = new Date(endDate);

    startDateOfMonth.setMonth(startDate.getMonth() + i);
    endDateOfMonth.setMonth(endDate.getMonth() + i);

    const monthYear = endDateOfMonth.toLocaleString('default', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const count = await model.countDocuments({
      createdAt: {
        $gte: startDateOfMonth,
        $lt: endDateOfMonth,
      },
    });

    lastMonthsData.push({ month: monthYear, count });
  }

  return { lastMonthsData };
}

type PeriodData = {
  period: string;
  count: number;
};

export async function generatePeriodData<T>(
  model: Model<T>,
  periodInDays: number,
): Promise<{ periodData: PeriodData[] }> {
  const periodData: PeriodData[] = [];
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = periodInDays - 1; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i,
      23,
      59,
      59,
      999,
    );
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 1,
      0,
      0,
      0,
      0,
    );
    const period = endDate.toLocaleString('default', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    periodData.push({ period, count });
  }
  return { periodData };
}
