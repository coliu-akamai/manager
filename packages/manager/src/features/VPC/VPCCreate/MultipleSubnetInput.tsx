import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';

import { Divider } from 'src/components/Divider';
import { Button } from 'src/components/Button/Button';
import { SubnetFieldState } from 'src/utilities/subnets';
import { SubnetNode } from './SubnetNode';
import { SubnetError } from 'src/utilities/formikErrorUtils';

interface Props {
  subnets: SubnetFieldState[];
  onChange: (subnets: SubnetFieldState[]) => void;
  disabled?: boolean;
  subnetErrors: SubnetError[];
}

const EMPTY_SUBNET_ERROR: SubnetError = { label: [], ipv4: [], ipv6: [] };

export const MultipleSubnetInput = (props: Props) => {
  const theme = useTheme();
  const { subnets, subnetErrors, onChange, disabled } = props;

  const addSubnet = () => {
    onChange([
      ...subnets,
      { label: '', ipv4: '' },
    ]);
  };

  const handleSubnetChange = (
    subnet: SubnetFieldState,
    subnetIdx: number,
    removable: boolean
  ) => {
    const newSubnets = [...subnets];
    if (removable) {
      newSubnets.splice(subnetIdx, 1);
    } else {
      newSubnets[subnetIdx] = subnet;
    }
    onChange(newSubnets);
  };

  return (
    <Grid>
      {subnets.map((subnet, subnetIdx) => (
        <Grid key={`subnet-${subnetIdx}`}>
          {subnetIdx !== 0 && <Divider sx={{ marginTop: theme.spacing(3) }} />}
          <SubnetNode
            idx={subnetIdx}
            subnet={subnet}
            subnetError={subnetIdx < subnetErrors.length ? subnetErrors[subnetIdx] : EMPTY_SUBNET_ERROR}
            disabled={disabled}
            // janky solution to enable SubnetNode to work on its own or be part of MultipleSubnetInput
            onChange={(subnet, subnetIdx, removable) =>
              handleSubnetChange(subnet, subnetIdx ?? 0, !!removable)
            }
            removable={true}
          />
        </Grid>
      ))}
      <Button
        buttonType="outlined"
        disabled={disabled}
        onClick={addSubnet}
        sx={{ marginTop: theme.spacing(3) }}
      >
        Add a Subnet
      </Button>
    </Grid>
  );
};
