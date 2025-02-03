import type {
  BaseCreateLinodeRequest,
  CreateLinodeInterfacePayload,
  InterfaceGenerationType,
  InterfacePayload,
} from '@linode/api-v4';

export type LinodeCreateType =
  | 'Backups'
  | 'Clone Linode'
  | 'Images'
  | 'OS'
  | 'One-Click'
  | 'StackScripts';

// TS typeguards with Interfaces
export interface BaseInterface {
  interfaceType?: InterfaceGenerationType;
}

export interface LinodeInterfaceWithTypePayload
  extends BaseInterface,
    CreateLinodeInterfacePayload {
  interfaceType: 'linode';
}

export interface LegacyInterfaceWithTypePayload
  extends BaseInterface,
    InterfacePayload {
  interfaceType: 'legacy_config';
}

export type CreateInterfacePayload =
  | LegacyInterfaceWithTypePayload
  | LinodeInterfaceWithTypePayload;

/**
 * This type is very similar to the API's CreateLinodeRequest type, except that
 * all interfaces have additional information to determine which type (legacy or linode)
 * of interface they are for convenience. When we send the request values back to the API,
 * we strip out this information to maintain the shape of CreateLinodeRequest.
 */
export interface CreateLinodeWithInterfaceType extends BaseCreateLinodeRequest {
  /**
   * An array of Network Interfaces to add to this Linode’s Configuration Profile.
   * Types updated to include information on whether this is a legacy or linode interface
   */
  interfaces?: CreateInterfacePayload[];
}
