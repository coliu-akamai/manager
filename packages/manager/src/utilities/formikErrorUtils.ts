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
  labelError?: string;
  ipv4Error?: string;
  ipv6Error?: string;
}


// this is janky and i am not a fan

export const convertVpcApiErrors = (errors: APIError[], setFieldError: (field: string, message: string) => void, setError?: (message: string) => void) => {
  const subnetErrors = {};
  let subnetErrorBuilder: SubnetError = {};
  let curSubnetIndex = 0;
  let idx;

  for (let i = 0; i < errors.length; i++) {
    let error: APIError = errors[i];
    if (error.field) {
      if (error.field.includes("subnets[")) {
        const keys = error.field.split('.');
        idx = parseInt(keys[0].substring(keys[0].indexOf("[") + 1, keys[0].indexOf("]")));
        if (idx !== curSubnetIndex) {
          subnetErrors[curSubnetIndex] = (subnetErrorBuilder);
          curSubnetIndex = idx;
          subnetErrorBuilder = {}
          console.log('do we ever get here')
        }
        subnetErrorBuilder[keys[keys.length - 1]] = error.reason;
        console.log("does this happen", keys, idx, curSubnetIndex, subnetErrorBuilder, subnetErrors)
      } else {
        handleAPIErrors([error], setFieldError, setError);
      }
    }
  }

  if(idx && !subnetErrors[idx] && Object.keys(subnetErrorBuilder).length !== 0) {
    subnetErrors[idx] = subnetErrorBuilder;
  }

  return subnetErrors;
}