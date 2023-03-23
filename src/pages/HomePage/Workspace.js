import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  demo: {
    height: 240,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    height: '100%',
    color: theme.palette.text.secondary,
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
});

class Workspace extends React.Component {
  state = {
    direction: 'row',
    justify: 'center',
    alignItems: 'stretch',
  };

  handleChange = key => (event, value) => {
    this.setState({
      [key]: value,
    });
  };

  render() {
    const { classes } = this.props;
    const { alignItems, direction, justify } = this.state;

    const code = `
\`\`\`jsx
<Grid
  container
  direction="${direction}"
  justify="${justify}"
  alignItems="${alignItems}"
>
\`\`\`
`;

    return (
      <Grid container className={classes.root}>
        <Grid item xs={12}>
        <Paper className={classes.control}>
           
           </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.control}>
           
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

Workspace.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Workspace);
