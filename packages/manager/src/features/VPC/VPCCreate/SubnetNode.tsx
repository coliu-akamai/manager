import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { TextField } from 'src/components/TextField';
import { Divider } from 'src/components/Divider';
import { SubnetFieldState } from './VPCCreate';

interface Props {
  disabled: boolean;
  idx: number;
  key: string;
  onChange: (subnet: SubnetFieldState) => void;
  subnet: SubnetFieldState;
  // TODO CONNIE -- maybe make own frontend subnet type (label, ip) and then transform to necessary payload
}

export const SubnetNode = (props: Props) => {
  const { disabled, idx, onChange, subnet } = props;

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = { ...subnet, label: e.target.value };
    onChange(newSubnet);
  };

  const onIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subnetError = subnet.ip.error ?? '';
    const newSubnet = {
      ...subnet,
      ip: { address: e.target.value, error: subnetError },
    };
    onChange(newSubnet);
  };

  return (
    <Grid key={idx}>
      {idx !== 0 && <Divider sx={{ marginTop: '24px' }} />}
      <TextField
        disabled={disabled}
        label="Subnet label"
        onChange={onLabelChange}
        value={subnet.label}
      />
      <TextField
        disabled={disabled}
        label="Subnet IP Range Address"
        onChange={onIpChange}
        value={subnet.ip.address}
        errorText={subnet.ip.error}
      />
    </Grid>
    // TODO calculate available ips
  );
};
