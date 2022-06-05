import { Paper, Typography } from "@material-ui/core";

import React from "react";
import { formattedDate, getFormattedTime, getTimeValues } from "../getFormattedTime";

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
    <Paper style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)', marginBottom: 16
    }}>
      <Typography variant="subtitle1" align="center">
        {date}
      </Typography>
      <Typography variant="h1" align="center" >
        {currentTime}
      </Typography>
    </Paper>
  );
}
