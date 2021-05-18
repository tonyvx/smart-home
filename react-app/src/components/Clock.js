import { Typography } from "@material-ui/core";

import { getFormattedTime } from "../../../lib/getFormattedTime";
import React from "react";

export function Clock() {
  const [currentTime, setCurrentTime] = React.useState("00:00:00");

  React.useEffect(() => {
    var timerID = setInterval(() => setCurrentTime(getFormattedTime()), 1000);
    return function cleanup() {
      clearInterval(timerID);
    };
  }, []);

  return (
    <Typography variant="h1" align="center" padding="10">
      {currentTime}
    </Typography>
  );
}
