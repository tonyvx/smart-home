import { Button, Container, Grid, Typography } from "@material-ui/core";
import React from "react";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import VolumeMuteIcon from "@material-ui/icons/VolumeMute";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import { decreaseVolume, increaseVolume, mute, play, skipToNext, skipToPrevious, SpotifyContext } from "../contexts/SpotifyContext";


export const SpotifyPlayer = () => {
  const { context, dispatch } = React.useContext(SpotifyContext);

  const { playerStarted, playBackState, currentTrack, volume, playlist } = context;
  playBackState?.item &&
    setTimeout(
      () => {
        window.api.send("toMain_Playback", null); console.log("Check in ", playBackState?.item?.duration_ms);
      },
      playBackState?.item?.duration_ms
    );
  return (
    <Container style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {currentTrack.track && <>
            <Typography variant="h5" align="center">
              {currentTrack.track} - {currentTrack.artist}  ({volume}%)
            </Typography>
            <Typography variant="h5" align="center">
              {playlist}
            </Typography>
          </>}
        </Grid>

        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => play(dispatch, currentTrack.uri)}
          >
            {!playerStarted ? (
              <PlayCircleOutlineIcon />
            ) : (
              <PauseCircleOutlineIcon />
            )}
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" onClick={() => skipToPrevious(dispatch, playerStarted)}>
            <SkipPreviousIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" onClick={() => skipToNext(dispatch, playerStarted)}>
            <SkipNextIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          {context.volume > 0 && (
            <Button variant="outlined" onClick={() => mute(dispatch, volume)}>
              <VolumeMuteIcon />
            </Button>
          )}
          {context.volume === 0 && (
            <Button
              variant="outlined"
              onClick={() => increaseVolume(dispatch, volume)}
            >
              <VolumeOffIcon />
            </Button>
          )}
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => decreaseVolume(dispatch, volume)}
          >
            <VolumeDownIcon />
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            onClick={() => increaseVolume(dispatch, volume)}
          >
            <VolumeUpIcon />
          </Button>
        </Grid>
        <Grid item xs={12}>
          {context?.playBackState?.device && (
            <Typography variant="overline" align={'center'} component="div">
              {context?.playBackState?.device?.type}
              {" : "}
              {context?.playBackState?.device?.name}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container >
  );
};
