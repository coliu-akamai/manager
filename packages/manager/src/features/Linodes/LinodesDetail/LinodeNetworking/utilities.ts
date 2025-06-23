import type { IPTypes } from './types';

export const disableIPRow = (inputs: {
  hasLinodeInterfaces: boolean | undefined;
  hasPublicInterface: boolean | undefined;
  ipType: IPTypes;
  isLinodeInterface: boolean;
  isVPCOnlyLinode: boolean;
}) => {
  const {
    isLinodeInterface,
    hasLinodeInterfaces,
    hasPublicInterface,
    isVPCOnlyLinode,
    ipType,
  } = inputs;

  if (
    // regardless of interface type, if Linode is VPC only without a public interface, disable both public IPv4 and IPv6
    (isVPCOnlyLinode && !hasPublicInterface) ||
    // For Linode interfaces without any interfaces, disable both public IPv4 and IPv6
    // We exclude this check for legacy interfaces bc it doesn't always apply - some Linodes without interfaces may still have public connectivity
    // (see comment at lines 275-277 in LinodeCreate/utilities.ts getInterfacePayload)
    (isLinodeInterface && !hasLinodeInterfaces)
  ) {
    return ipType === 'Public – IPv4' || ipType === 'Public – IPv6 – SLAAC';
  }

  // Linode Interface without a public interface will not have public IPv6 connectivity
  if (isLinodeInterface && !hasPublicInterface) {
    return ipType === 'Public – IPv6 – SLAAC';
  }

  return isVPCOnlyLinode && ipType === 'Public – IPv4';
};
