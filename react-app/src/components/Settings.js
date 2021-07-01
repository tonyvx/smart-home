import { Divider, List, ListItem, Dialog, Toolbar, IconButton, AppBar, Typography, Button, ListItemText, Slide, TextField, FormControl, InputLabel, Select } from "@material-ui/core";
import React, { useState } from "react";
import { AppContext, showSettingsPage } from "../AppContext";
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));


export const Settings = (props) => {
  const classes = useStyles();
  const [data, setData] = useState({});

  const setupData = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  }

  const { context, dispatch } = React.useContext(AppContext);
  const { devices } = context;
  console.log("settings",devices);
  return (<Dialog fullScreen open={props.open} onClose={() => showSettingsPage(dispatch)} >
    <AppBar className={classes.appBar} color="secondary">
      <Toolbar >
        <IconButton edge="start" color="inherit" onClick={() => showSettingsPage(dispatch)} aria-label="close">
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Settings
        </Typography>
        <Button autoFocus color="inherit" onClick={() => { showSettingsPage(dispatch, data); }}>
          save
        </Button>
      </Toolbar>
    </AppBar>
    <List>
      <ListItem button>
        <ListItemText primary="Application Access" secondary="Setup personal app access tokens" />
      </ListItem>
      <Divider />
      <ListItem >
        <ListItemText primary="Open Weather API Token : Login https://openweathermap.org/api" secondary="Subscribe for Current Weather. Generate API Keys" />
        <TextField name="OPENWEATHER_TOKEN" id="standard-basic" label="Open Weather API Key" color="secondary" value={data["OPENWEATHER_TOKEN"]} onChange={setupData} />
      </ListItem>
      <ListItem >
        <ListItemText primary="Spotify Client Creds : Login https://developer.spotify.com/dashboard" secondary="Click create an app. Client Id is shown in top-left, just below that there is a show secret link" />
        <TextField name="SPOTIFY_CLIENT_ID" id="standard-basic" label="Spotify Client ID" color="secondary" style={{ marginRight: 8 }} value={data["SPOTIFY_CLIENT_ID"]} onChange={setupData} />
        <TextField name="SPOTIFY_CLIENT_SECRET" id="standard-basic" label="Spotify Client Secrets" color="secondary" value={data["SPOTIFY_CLIENT_SECRET"]} onChange={setupData} />
      </ListItem>
      <Divider />
      <ListItem >
        <ListItemText primary="Wireless Speaker for Spotify" secondary="Select Wireless Player for Spotify" />
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="age-native-simple" color="secondary">Device</InputLabel>
          <Select color="secondary"
            name="DEVICE_ID"
            native
            value={data["DEVICE_ID"]}
            onChange={setupData}
            inputProps={{
              name: 'DEVICE_ID',
              id: 'age-native-simple',
            }}
          >
            {devices.map(device => <option value={device.id} key={device.id}>{device.name}</option>)}
          </Select>
        </FormControl>
      </ListItem>
    </List>
  </Dialog>);
};
