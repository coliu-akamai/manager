import { useLinodeInterfacesQuery, useVPCQuery } from '@linode/queries';

import { useDetermineReachableIPsConfigInterface } from './useDetermineReachableIPsConfigInterface';

/**
 * Returns outputs that can be used to determine if a Linode's public IPv4 and IPv6 ips are reachable.
 *
 * NOTE: due to the complexity of configuration profiles/interfaces, for legacy config interfaces,
 * usage of this hook maintains functionality of determining IP reachability based on whether a Linode is a "VPC only Linode"
 *
 * Returns the VPC Interface and VPC the Linode with the given ID is assigned to. Determines
 * whether to use config profile related queries or Linode Interface related queries
 * based on the types of interfaces this Linode is using
 */
export const useDetermineReachableIPs = (inputs: {
  isLinodeInterface: boolean;
  linodeId: number;
}) => {
  const { isLinodeInterface, linodeId } = inputs;

  const {
    hasLinodeInterfaces,
    hasPublicLinodeInterface,
    isVPCOnlyLinodeInterface,
    linodeInterfaceWithVPC,
    vpcLinodeIsAssignedTo: vpcLinodeIsAssignedToInterface,
  } = useDetermineReachableIPsLinodeInterface(linodeId, isLinodeInterface);
  const {
    configInterfaceWithVPC,
    configs,
    hasPublicConfigInterface,
    isVPCOnlyLinode: isVPCOnlyLinodeConfig,
    vpcLinodeIsAssignedTo: vpcLinodeIsAssignedToConfig,
  } = useDetermineReachableIPsConfigInterface(linodeId, !isLinodeInterface);

  const isVPCOnlyLinode = isVPCOnlyLinodeConfig || isVPCOnlyLinodeInterface;
  const vpcLinodeIsAssignedTo =
    vpcLinodeIsAssignedToConfig ?? vpcLinodeIsAssignedToInterface;

  return {
    configs, // undefined if this Linode is using Linode Interfaces
    hasLinodeInterfaces, // undefined if this Linode is using config interfaces. Is only used when the Linode is known to be using Linode Interfaces
    hasPublicInterface: hasPublicConfigInterface ?? hasPublicLinodeInterface,
    interfaceWithVPC: linodeInterfaceWithVPC ?? configInterfaceWithVPC,
    isVPCOnlyLinode,
    vpcLinodeIsAssignedTo,
  };
};

/**
 * Linode Interface equivalent to useDetermineReachableIPsConfigInterface
 * Returns the active VPC Linode interface (an VPC interface that is the default route for IPv4),
 * the VPC of that interface, and if this Linode is a VPC only Linode
 */
export const useDetermineReachableIPsLinodeInterface = (
  linodeId: number,
  enabled: boolean = true
) => {
  const { data: interfaces } = useLinodeInterfacesQuery(linodeId, enabled);

  const hasLinodeInterfaces =
    interfaces?.interfaces && interfaces.interfaces.length > 0;
  const vpcInterfaces = interfaces?.interfaces.filter((iface) => iface.vpc);

  // if a Linode is a VPCOnlyLinode but has a public interface, its public IPv4 address will be associated with
  // this public interface, but just won't be the default route
  const hasPublicLinodeInterface = Boolean(
    interfaces?.interfaces.some((iface) => iface.public)
  );

  // Some Linodes may have multiple VPC Linode interfaces. If so, we want the interface that
  // is a default route (otherwise just get the first one)
  const linodeInterfaceWithVPC =
    vpcInterfaces?.find((vpcIface) => vpcIface.default_route.ipv4) ??
    vpcInterfaces?.[0];

  const { data: vpcLinodeIsAssignedTo } = useVPCQuery(
    linodeInterfaceWithVPC?.vpc?.vpc_id ?? -1,
    Boolean(vpcInterfaces?.length) && enabled
  );

  // For Linode Interfaces, a VPC only Linode is a VPC interface that is the default route for ipv4
  // but doesn't have a nat_1_1 val
  const isVPCOnlyLinodeInterface = Boolean(
    linodeInterfaceWithVPC?.default_route.ipv4 &&
      !linodeInterfaceWithVPC?.vpc?.ipv4?.addresses.some(
        (address) => address.nat_1_1_address
      )
  );

  return {
    hasLinodeInterfaces,
    hasPublicLinodeInterface,
    isVPCOnlyLinodeInterface,
    linodeInterfaceWithVPC,
    vpcLinodeIsAssignedTo,
  };
};
