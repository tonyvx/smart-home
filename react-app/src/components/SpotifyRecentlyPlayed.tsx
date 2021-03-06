import {
  Avatar,
  Typography,
  List,
  ListItem,
  Container,
  Popper,
} from "@material-ui/core";
import React from "react";
import { useStyles } from "../App";
import { SpotifyContext, play } from "../contexts/SpotifyContext";

export type HoverConfigType = {
  anchorEl: HTMLDivElement | null;
  id: string | null;
}

export const SpotifyRecentlyPlayed = () => {
  const classes = useStyles();
  const { dispatch, context } = React.useContext(SpotifyContext);
  const [hover, setHover] = React.useState<HoverConfigType>({ anchorEl: null, id: null });

  const { recentlyPlayed } = context;

  return (
    <List className={classes.listHorizontalDisplay}>
      {Array.isArray(recentlyPlayed) &&
        recentlyPlayed.map((item) => (
          <ListItem key={item.name} style={{ height: "50%" }}>
            <Container
              onClick={(event) => {
                play(dispatch, item.uri, item.name)
                setHover({ anchorEl: event.currentTarget, id: item.name })
              }}
              onMouseEnter={(event) =>
                setHover({ anchorEl: event.currentTarget, id: item.name })
              }
            >
              <Avatar
                variant={"rounded"}
                src={item.image}
                className={classes.avatar}
              />
            </Container>
            <Popper
              open={!!hover.anchorEl && hover.id === item.name}
              id={
                !!hover.anchorEl && hover.id === item.name
                  ? "transitions-popper"
                  : undefined
              }
              anchorEl={
                !!hover.anchorEl && hover.id === item.name
                  ? hover.anchorEl
                  : null
              }
              placement="top"
            >
              <Container style={{ background: "white", color: "grey" }}>
                <Typography variant="subtitle1">{item.name}</Typography>
                <Typography variant="subtitle2">
                  {item.description.substring(0, 40)}
                </Typography>
              </Container>
            </Popper>
          </ListItem>
        ))}
    </List>
  );
};
