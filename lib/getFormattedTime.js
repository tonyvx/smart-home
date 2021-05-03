function getFormattedTime(currentTime1 = new Date()) {
  return (
    ("0" + currentTime1.getHours()).substr(-2) +
    ":" +
    ("0" + currentTime1.getMinutes()).substr(-2) +
    ":" +
    ("0" + currentTime1.getSeconds()).substr(-2)
  );
}

module.exports = { getFormattedTime };
