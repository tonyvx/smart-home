function getFormattedTime(currentTime1 = new Date()) {
  return (
    ("0" + currentTime1.getHours()).substr(-2) +
    ":" +
    ("0" + currentTime1.getMinutes()).substr(-2) +
    ":" +
    ("0" + currentTime1.getSeconds()).substr(-2)
  );
}
const getTimeStamp = (unixTime) => {
  let unix_timestamp = unixTime;
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unix_timestamp * 1000);

  return getFormattedTime(date);
  // // Hours part from the timestamp
  // var hours = date.getHours();
  // // Minutes part from the timestamp
  // var minutes = "0" + date.getMinutes();
  // // Seconds part from the timestamp
  // var seconds = "0" + date.getSeconds();
  // // Will display time in 10:30:23 format
  // var formattedTime =
  //   hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  // console.log(formattedTime);
  // return formattedTime;
};
module.exports = { getFormattedTime, getTimeStamp };
