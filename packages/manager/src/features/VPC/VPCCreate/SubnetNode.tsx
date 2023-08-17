import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import Close from '@mui/icons-material/Close';
import { Button } from 'src/components/Button/Button';
import { TextField } from 'src/components/TextField';
import { SubnetFieldState } from 'src/utilities/subnets';
import { FormHelperText } from 'src/components/FormHelperText';
import { determineIPType } from '@linode/validation';
import { calculateAvailableIpv4s } from 'src/utilities/subnets';

interface Props {
  disabled?: boolean;
  idx?: number;
  // janky solution to enable SubnetNode to be an independent component or be part of MultipleSubnetInput
  // (not the biggest fan tbh)
  onChange: (
    subnet: SubnetFieldState,
    subnetIdx?: number,
    remove?: boolean
  ) => void;
  removable?: boolean;
  subnet: SubnetFieldState;
}

const RESERVED_IP_NUMBER = 4;

// TODO: VPC - currently only supports IPv4, must update when/if IPv6 is also supported
export const SubnetNode = (props: Props) => {
  const { disabled, idx, onChange, subnet, removable } = props;
  const [availIps, setAvailIps] = React.useState<number | undefined>(undefined);

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = {
      ...subnet,
      label: e.target.value,
      labelError: '',
    };
    onChange(newSubnet, idx);
  };

  const onIpv4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ipType = determineIPType(e.target.value);
    const newSubnet = {
      ...subnet,
      ip: { ipv4: e.target.value },
    };
    setAvailIps(calculateAvailableIpv4s(e.target.value, ipType));
    onChange(newSubnet, idx);
  };

  const removeSubnet = () => {
    onChange(subnet, idx, removable);
  };

  return (
    <Grid key={idx} sx={{ maxWidth: 460 }}>
      <Grid direction="row" container spacing={2}>
        <Grid xs={removable ? 11 : 12}>
          <TextField
            disabled={disabled}
            label="Subnet label"
            onChange={onLabelChange}
            value={subnet.label}
            errorText={subnet.labelError}
          />
        </Grid>
        <Grid xs={1}>
          <StyledButton onClick={removeSubnet}>
            <Close data-testid={`delete-subnet-${idx}`} />
          </StyledButton>
        </Grid>
      </Grid>
      <Grid xs={removable ? 11 : 12}>
        <TextField
          disabled={disabled}
          label="Subnet IP Address Range"
          onChange={onIpv4Change}
          value={subnet.ip.ipv4}
          errorText={subnet.ip.ipv4Error}
        />
        {availIps && (
          <FormHelperText>
            Available IP Addresses:{' '}
            {availIps > 4 ? availIps - RESERVED_IP_NUMBER : 0}
          </FormHelperText>
        )}
      </Grid>
    </Grid>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  '& :hover, & :focus': {
    backgroundColor: theme.color.grey2,
  },
  '& > span': {
    padding: 2,
  },
  color: theme.textColors.tableHeader,
  marginTop: theme.spacing(6),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
