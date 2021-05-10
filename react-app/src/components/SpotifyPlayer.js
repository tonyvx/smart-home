import { Button, Container, Grid } from "@material-ui/core";
import React from "react";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import VolumeMuteIcon from "@material-ui/icons/VolumeMute";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import {
  AppContext,
  play,
  mute,
  decreaseVolume,
  increaseVolume,
  skipToNext,
} from "../AppContext";

export const SpotifyPlayer = () => {
  const { context, dispatch } = React.useContext(AppContext);

  const { playerStarted } = context;
  return (
    <Container align="center">
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => play(dispatch, playerStarted)}
          >
            {!playerStarted ? (
              <PlayCircleOutlineIcon />
            ) : (
              <PauseCircleOutlineIcon />
            )}
          </Button>
        </Grid>

        <Grid item xs={2}>
          <Button variant="outlined" onClick={() => skipToNext(dispatch)}>
            <SkipNextIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" onClick={() => mute(dispatch)}>
            <VolumeMuteIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => decreaseVolume(dispatch, context.volume)}
          >
            <VolumeDownIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => increaseVolume(dispatch, context.volume)}
          >
            <VolumeDownIcon />
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};
