import { APIError } from '@linode/api-v4/lib/types';
import { reverse } from 'ramda';

import { getAPIErrorOrDefault } from './errorUtils';
import { isNilOrEmpty } from './isNilOrEmpty';

export const handleFieldErrors = (
  callback: (error: unknown) => void,
  fieldErrors: APIError[] = []
) => {
  const mappedFieldErrors = reverse(fieldErrors).reduce(
    (result, { field, reason }) =>
      field ? { ...result, [field]: reason } : result,
    {}
  );

  if (!isNilOrEmpty(mappedFieldErrors)) {
    return callback(mappedFieldErrors);
  }
};

export const handleGeneralErrors = (
  callback: (error: unknown) => void,
  apiErrors: APIError[],
  defaultMessage: string = 'An error has occurred.'
) => {
  if (!apiErrors) {
    return callback(defaultMessage);
  }

  const _apiErrors = getAPIErrorOrDefault(apiErrors, defaultMessage);

  const generalError = _apiErrors
    .reduce(
      (result, { field, reason }) => (field ? result : [...result, reason]),
      []
    )
    .join(',');

  if (!isNilOrEmpty(generalError)) {
    return callback(generalError);
  }
};

export const handleAPIErrors = (
  errors: APIError[],
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void
) => {
  errors.forEach((error: APIError) => {
    if (error.field) {
      /**
       * The line below gets the field name because the API returns something like this...
       * {"errors": [{"reason": "Invalid credit card number", "field": "data.card_number"}]}
       * It takes 'data.card_number' and translates it to 'card_number'
       */
      const key = error.field.split('.')[error.field.split('.').length - 1];
      if (key) {
        setFieldError(key, error.reason);
      }
    } else {
      // Put any general API errors into a <Notice />
      if (setError) {
        setError(error.reason);
      }
    }
  });
};

export interface SubnetError {
  // string[] bc each field can have multiple errors associated with it...
  label?: string;
  ipv4?: string;
  ipv6?: string;
}

// this is janky and i am not a fan
// idea: handle vpc errors and create a list of errors associated with each subnet
// for subnets with no errors, they'll have an object with empty error arrays
// each subnet will have an associated subnetError
// this kinda creates a parallel mapping which isn't great,
// but there also just aren't many great solutions imo
export const convertVpcApiErrors = (
  errors: APIError[],
  numSubnets: number,
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void
) => {
  const vpcSubnetErrors: SubnetError[] = [];
  const convertedErrors = handleVpcAndConvertSubnetErrors(
    errors,
    setFieldError,
    setError
  );
  for (let i = 0; i < numSubnets ?? 0; i++) {
    if (convertedErrors[i]) {
      vpcSubnetErrors.push(convertedErrors[i]);
    } else {
      vpcSubnetErrors.push({});
    }
  }

  return vpcSubnetErrors;
};

// idea: handle vpc errors not related to subnets normally
// for subnet errors: convert to map/object of subnet's index: associated errors
// return this object
const handleVpcAndConvertSubnetErrors = (
  errors: APIError[],
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void
) => {
  const subnetErrors = {};
  let subnetErrorBuilder: SubnetError = {};
  let curSubnetIndex = 0;
  let idx;

  for (let i = 0; i < errors.length; i++) {
    const error: APIError = errors[i];
    if (error.field && error.field.includes('subnets[')) {
      const keys = error.field.split('.');
      const field = keys[keys.length - 1];
      idx = parseInt(
        keys[0].substring(keys[0].indexOf('[') + 1, keys[0].indexOf(']')),
        10
      );
      if (idx !== curSubnetIndex) {
        subnetErrors[curSubnetIndex] = subnetErrorBuilder;
        curSubnetIndex = idx;
        subnetErrorBuilder = {};
      }
      subnetErrorBuilder[field] = error.reason;
    } else {
      handleAPIErrors([error], setFieldError, setError);
    }
  }

  if (idx !== undefined && !subnetErrors[idx]) {
    subnetErrors[idx] = subnetErrorBuilder;
  }

  return subnetErrors;
};
