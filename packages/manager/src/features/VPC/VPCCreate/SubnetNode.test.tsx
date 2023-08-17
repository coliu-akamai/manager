import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { SubnetNode } from './SubnetNode';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('SubnetNode', () => {
  it('should calculate the correct subnet mask', async () => {
    renderWithTheme(
      <SubnetNode
        disabled={false}
        idx={0}
        onChange={() => {}}
        subnet={{ label: '', ipv4: '' }}
        subnetError={{ label: [], ipv4: [], ipv6: [] }}
      />
    );
    const subnetAddress = screen.getAllByTestId('textfield-input');
    expect(subnetAddress[1]).toBeInTheDocument();
    await userEvent.type(subnetAddress[1], '192.0.0.0/24', { delay: 1 });

    expect(subnetAddress[1]).toHaveValue('192.0.0.0/24');
    const availIps = screen.getByText('Available IP Addresses: 252');
    expect(availIps).toBeInTheDocument();
  });

  it('should not show a subnet mask for an ip without a mask', async () => {
    renderWithTheme(
      <SubnetNode
        disabled={false}
        idx={0}
        onChange={() => {}}
        subnet={{ label: '', ipv4: ''}}
        subnetError={{ label: [], ipv4: [], ipv6: [] }}
      />
    );
    const subnetAddress = screen.getAllByTestId('textfield-input');
    expect(subnetAddress[1]).toBeInTheDocument();
    await userEvent.type(subnetAddress[1], '192.0.0.0', { delay: 1 });

    expect(subnetAddress[1]).toHaveValue('192.0.0.0');
    const availIps = screen.queryByText('Available IP Addresses:');
    expect(availIps).not.toBeInTheDocument();
  });
});
