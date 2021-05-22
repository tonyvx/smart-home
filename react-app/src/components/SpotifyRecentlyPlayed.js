import {
  Avatar,
  Typography,
  List,
  ListItem,
  Container,
} from "@material-ui/core";
import React from "react";
import { useStyles } from "../App";
import { AppContext, play } from "../AppContext";
import "react-virtualized/styles.css";

export const SpotifyRecentlyPlayed = () => {
  const classes = useStyles();
  const { dispatch, context } = React.useContext(AppContext);

  const { recentlyPlayed } = context;

  return (
    <List className={classes.listHorizontalDisplay}>
      {Array.isArray(recentlyPlayed) &&
        recentlyPlayed.map((item) => (
          <ListItem
            key={item.name}
            align="center"
            onClick={() => play(dispatch, false, item.uri)}
          >
            <Container>
              <Avatar
                variant={"rounded"}
                src={item.image}
                className={classes.avatar}
              />
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="subtitle2">
                {item.description.substring(0, 40)}
              </Typography>
            </Container>
          </ListItem>
        ))}
    </List>
  );
};
