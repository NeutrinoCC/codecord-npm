import { isFormatKey } from "./type";

export class DateParser {
  date: Date;

  constructor(date?: Date) {
    this.date = date || new Date();
  }

  static differenceToString(date_1: Date, date_2: Date) {
    var difference = this.difference(date_1, date_2);

    // Convert the difference from milliseconds to years, months, days, hours, minutes, and seconds
    var years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
    difference -= years * 1000 * 60 * 60 * 24 * 365;
    var months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30.44)); // Using average days in a month
    difference -= months * 1000 * 60 * 60 * 24 * 30.44;
    var days = Math.floor(difference / (1000 * 60 * 60 * 24));
    difference -= days * 1000 * 60 * 60 * 24;
    var hours = Math.floor(difference / (1000 * 60 * 60));
    difference -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(difference / (1000 * 60));
    difference -= minutes * 1000 * 60;
    var seconds = Math.floor(difference / 1000);

    // Construct the output string
    var differenceString = "";
    if (years > 0) {
      differenceString += years + " año" + (years === 1 ? "" : "s") + ", ";
    }
    if (months > 0) {
      differenceString += months + " mes" + (months === 1 ? "" : "es") + ", ";
    }
    if (days > 0 && !months) {
      differenceString += days + " día" + (days === 1 ? "" : "s") + ", ";
    }
    if (hours > 0 && !days) {
      differenceString += hours + " hora" + (hours === 1 ? "" : "s") + ", ";
    }

    if (minutes > 0 && !hours) {
      differenceString +=
        minutes + " minuto" + (minutes === 1 ? "" : "s") + ", ";
    }
    if (seconds > 0 && !minutes) {
      differenceString += seconds + " segundo" + (seconds === 1 ? "" : "s");
    }

    // Remove the trailing comma and space if needed
    if (differenceString.endsWith(", ")) {
      differenceString = differenceString.slice(0, -2);
    }

    return differenceString;
  }

  static difference(date_1: Date, date_2: Date) {
    // Get the current date
    var currentDate = date_1;

    // Calculate the difference in milliseconds between the two dates
    var difference = currentDate.getTime() - date_2.getTime();

    return difference;
  }

  static stringToDate(dateString: string, format: string): Date | null {
    const formats = {
      yyyy: "(\\d{4})",
      mm: "(\\d{2})",
      dd: "(\\d{2})",
      hh: "(\\d{2})",
      ii: "(\\d{2})",
      ss: "(\\d{2})",
    };

    let regex = format;

    Object.keys(formats).forEach((key) => {
      if (!isFormatKey(key)) return;
      regex = regex.replace(new RegExp(key, "g"), formats[key]);
    });

    const match = dateString.match(new RegExp(`^${regex}$`));

    if (!match) {
      return null;
    }

    const year = parseInt(match[1], 10);

    let month = parseInt(match[2], 10);

    const day = parseInt(match[3], 10);

    const hour = parseInt(match[4], 10);

    const minute = parseInt(match[5], 10);

    const second = parseInt(match[6], 10);

    // Adjust month (JavaScript months are 0-based)

    month -= 1;

    return new Date(year, month, day, hour, minute, second);
  }
}
