// global.Promise = require("bluebird");

interface IDictionary<T = any> {
  [key: string]: T;
}

interface INumericArray<T> {
  [key: number]: T;
}

/** a string of the format: "YYYY-MM-DD" */
type datestring = string;
/** a string of the format: "HH:mm:ss" */
type timestring = string;
/** a string of the format: "UTC" */
type timezone = string;
/** string representation of datetime in format of "2016-07-17T13:29:11.652Z" */
type datetime = string;
