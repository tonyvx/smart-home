import {
  Avatar,

  Container,

  Grid,
  Typography
} from "@material-ui/core";
import React from "react";
import { AppContext } from "../AppContext";
import { useStyles } from "../App";

export const SpotifyRecentlyPlayed = () => {
  const classes = useStyles();
  const { context } = React.useContext(AppContext);

  const { recentlyPlayed } = context;

  return (
    <Grid container spacing={3}>
      {recentlyPlayed &&
        Array.isArray(recentlyPlayed) &&
        recentlyPlayed.map((p, i) => (
          <Grid key={i} item xs={3}>
            <Container
              align="center"
              onClick={() => window.api.send("toMain_OpenPlayer", p.url)}
            >
              <Avatar
                variant={"rounded"}
                src={p.image.url}
                className={classes.avatar} />
              <Typography variant="subtitle2">
                {p.name} - from {p.album} - by {p.artist}
              </Typography>
            </Container>
          </Grid>
        ))}
      <Grid item xs={12}></Grid>
    </Grid>
  );
};
