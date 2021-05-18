import { Avatar, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useStyles } from "../App";
import { AppContext, play } from "../AppContext";

export const SpotifyRecentlyPlayed = () => {
  const classes = useStyles();
  const { dispatch, context } = React.useContext(AppContext);

  const { recentlyPlayed } = context;
  const [pos, setPos] = useState(0);

  return (
    <Grid container spacing={3}>
      {recentlyPlayed &&
        Array.isArray(recentlyPlayed) &&
        recentlyPlayed
          .filter((a, i) => i > pos && i <= pos + 4)
          .map((p) => (
            <Grid
              item
              xs={3}
              key={p.name}
              align="center"
              onClick={() => play(dispatch, false, p.uri)}
            >
              <Avatar
                variant={"rounded"}
                src={p.image}
                className={classes.avatar}
              />
              <Typography variant="subtitle1">{p.name}</Typography>
              <Typography variant="subtitle2">{p.description}</Typography>
            </Grid>
          ))}
    </Grid>
  );
};
