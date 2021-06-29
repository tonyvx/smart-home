import { Typography } from "@material-ui/core";

import { getFormattedTime, getTimeValues, formattedDate } from "../../../lib/getFormattedTime";
import React from "react";

export function Clock() {
  const [currentTime, setCurrentTime] = React.useState("00:00:00");
  const [date, setDate] = React.useState(formattedDate());

  React.useEffect(() => {
    var timerID = setInterval(() => {
      setCurrentTime(getFormattedTime());
      setDate(formattedDate());
    }, 1000 - getTimeValues().milliseconds);
    return function cleanup() {
      clearInterval(timerID);
    };
  }, []);

  return (
    <>
      <Typography variant="subtitle1" align="center" padding="10">
        {date}
      </Typography>
      <Typography variant="h1" align="center" padding="10">
        {currentTime}
      </Typography>
    </>
  );
}
