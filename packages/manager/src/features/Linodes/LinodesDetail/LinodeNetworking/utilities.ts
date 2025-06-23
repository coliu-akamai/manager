import type { IPTypes } from './types';

export const disableIPRow = (inputs: {
  hasInterfaces: boolean | undefined;
  hasPublicInterface: boolean | undefined;
  ipType: IPTypes;
  isLinodeInterface: boolean;
  isVPCOnlyLinode: boolean;
}) => {
  const {
    isLinodeInterface,
    hasInterfaces,
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
    (isLinodeInterface && !hasInterfaces)
  ) {
    return ipType === 'Public – IPv4' || ipType === 'Public – IPv6 – SLAAC';
  }

  if (
    // Linode Interface without a public interface will not have public IPv6 connectivity
    (isLinodeInterface && !hasPublicInterface) ||
    // if a legacy config has interfaces but doesn't have a public interface, it will not have public IPv6 connectivity
    (hasInterfaces && !hasPublicInterface)
  ) {
    return ipType === 'Public – IPv6 – SLAAC';
  }

  return isVPCOnlyLinode && ipType === 'Public – IPv4';
};
