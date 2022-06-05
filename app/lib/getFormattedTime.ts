export function getFormattedTime(currentTime1 = new Date()) {
  return (
    String(currentTime1.getHours()).padStart(2, "0") +
    ":" +
    String(currentTime1.getMinutes()).padStart(2, "0") +
    ":" +
    String(currentTime1.getSeconds()).padStart(2, "0")
  );
}

export function getTimeValues(currentTime1 = new Date()) {
  console.log(currentTime1.getMilliseconds());
  return (
    {
      hours: String(currentTime1.getHours()).padStart(2, "0"), minutes: String(currentTime1.getMinutes()).padStart(2, "0"), seconds:
        String(currentTime1.getSeconds()).padStart(2, "0"), milliseconds: currentTime1.getMilliseconds()
    }
  );
}

export const formattedDate = () => {
  let options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let today = new Date()
  return today.toLocaleDateString("en-US", options);
}

export const getTimeStamp = (unixTime: string) => {
  let unix_timestamp = unixTime;
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(parseInt(unix_timestamp) * 1000);

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
