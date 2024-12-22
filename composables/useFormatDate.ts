type FormatDate = (date: Date) => string;

type DaysFormatOnMobile = (date: string) => string;

const daysFormatOnMobile: DaysFormatOnMobile = (date) => date?.split('-').slice(1, 3).join(' / ');


const formatDate: FormatDate = (date) => {
  const offsetToUTC8 = date.getHours() + 8;
  date.setHours(offsetToUTC8);
  return date.toISOString().split('T')[0];
};

const formateBirthday = (date: string) => {
  const dateArray = (date.split('T')[0]).split('-');
  return `${dateArray[0]}年${dateArray[1]}月${dateArray[2]}日`;
}

const countNights = (inDate: string, outDate: string) => {
  const resultInDate = new Date(inDate);
  const resultOutDate = new Date(outDate);
  const diffTime = Math.abs(resultOutDate.getTime() - resultInDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 1 ? diffDays - 1 : 1;
}

export { daysFormatOnMobile, formatDate, countNights, formateBirthday };
