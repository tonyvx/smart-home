import { Button, Container, Grid, Typography } from "@material-ui/core";
import React from "react";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import VolumeMuteIcon from "@material-ui/icons/VolumeMute";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
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

  const { playerStarted, playBackState, currentTrack } = context;
  playBackState.item &&
    setTimeout(
      () => window.api.send("toMain_Playback", null),
      playBackState.item.duration_ms
    );
  return (
    <Container align="center">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" align="center">
            {currentTrack.track} - {currentTrack.artist}
          </Typography>
        </Grid>

        <Grid item xs={1}></Grid>
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
          {context.volume > 0 && (
            <Button variant="outlined" onClick={() => mute(dispatch)}>
              <VolumeMuteIcon />
            </Button>
          )}
          {context.volume === 0 && (
            <Button
              variant="outlined"
              onClick={() => increaseVolume(dispatch, context.volume)}
            >
              <VolumeOffIcon />
            </Button>
          )}
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
            <VolumeUpIcon />
          </Button>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={12}>
          {context.playBackState.device && (
            <Typography variant="overline">
              {context.playBackState.device.type}
              {" : "}
              {context.playBackState.device.name}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          {playBackState.item && (
            <Typography variant="overline" align="center">
              {Math.ceil(playBackState.progress_ms / 60000)}:
              {playBackState.progress_ms % 60000} -{" "}
              {Math.ceil(playBackState.item.duration_ms / 60000)}:
              {playBackState.item.duration_ms % 60000}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
