
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';



function valuetext(value) {
  return `${value}`;
}

export default function ClassificationThresholdSelector({ settings, setSettings }) {

  const marks = [
    {
      value: 0,
      label: '0',
    },
    {
      value: .1,
      label: '.1',
    },
    {
      value: .2,
      label: '.2',
    },
    {
      value: .3,
      label: '.3',
    },
    {
      value: .4,
      label: '.4',
    },
    {
      value: .5,
      label: '.5',
    },
    {
      value: .6,
      label: '.6',
    }, {
      value: .7,
      label: '.7',
    },
    {
      value: .8,
      label: '.8',
    },
    {
      value: .9,
      label: '.9',
    },
    {
      value: 1,
      label: '1',
    },

  ];
  return (<>
    <Typography sx={{pb:4}}>Classification Threshold</Typography>

    <Slider
      min={0}
      max={1}
      aria-label="Always visible"
      value={settings.nlu.threshold}
      getAriaValueText={valuetext}
      step={.01}
      marks={marks}
      valueLabelDisplay="on"
      onChange={(e) => { setSettings({ ...settings, nlu: { threshold: e.target.value } }) }}
    /></>

  );
}