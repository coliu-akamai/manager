import { reverse } from 'ramda';

import { getAPIErrorOrDefault } from './errorUtils';
import { isNilOrEmpty } from './isNilOrEmpty';
// import { set } from './set';

import type { APIError } from '@linode/api-v4/lib/types';
import type { FormikErrors } from 'formik';

export const getFormikErrorsFromAPIErrors = <T>(
  errors: APIError[],
  prefixToRemoveFromFields?: string
): FormikErrors<T> => {
  return errors.reduce((acc: FormikErrors<T>, error: APIError) => {
    if (error.field) {
      const field = prefixToRemoveFromFields
        ? error.field.replace(prefixToRemoveFromFields, '')
        : error.field;

      return set(acc, field, error.reason);
    }
    return acc;
  }, {});
};

export const set = (obj: any, path: string, value: any): any => {
  // Split the path into parts, handling both dot notation and array indices
  const [head, ...rest] = path.split(/\.|\[|\]/).filter(Boolean);

  // protect against prototype pollution
  if (head === 'prototype' || head === '__proto__' || head === 'constructor') {
    return { ...obj };
  }

  // Since this is recursive, if there are no more parts in the path, set the value and return
  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }

  // Handle array indices
  if (head.match(/^\d+$/)) {
    const index = parseInt(head, 10);
    // Copy the existing one or create a new empty one
    const newArray = Array.isArray(obj) ? [...obj] : [];
    // Recursively set the value at the specified index
    newArray[index] = set(newArray[index] || {}, rest.join('.'), value);

    return newArray;
  }

  // Handle nested objects
  return {
    ...obj,
    // Recursively set the value for the nested path
    [head]: set(obj[head] || {}, rest.join('.'), value),
  };
};

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

  const generalError =
    typeof _apiErrors[0].reason !== 'string'
      ? _apiErrors[0].reason
      : _apiErrors
          .reduce(
            (result, { field, reason }) =>
              field ? result : [...result, reason],
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
  ipv4?: string;
  ipv6?: string;
  label?: string;
}

/**
 * Handles given API errors and converts any specific subnet related errors into a usable format;
 * Returns a map of subnets' indexes to their @interface SubnetError
 * Example: errors = [{ reason: 'error1', field: 'subnets[1].label' },
 *                    { reason: 'error2', field: 'subnets[1].ipv4' },
 *                    { reason: 'not a subnet error so will not appear in return obj', field: 'label'},
 *                    { reason: 'error3', field: 'subnets[4].ipv4' }]
 * returns: {
 *            1: { label: 'error1', ipv4: 'error2' },
 *            4: { ipv4: 'error3'}
 *          }
 *
 * @param errors the errors from the API
 * @param setFieldError function to set non-subnet related field errors
 * @param setError function to set (non-subnet related) general API errors
 */
export const handleVPCAndSubnetErrors = (
  errors: APIError[],
  setFieldError: (field: string, message: string) => void,
  setError?: (message: string) => void
) => {
  const subnetErrors: Record<number, SubnetError> = {};
  const nonSubnetErrors: APIError[] = [];

  errors.forEach((error) => {
    if (error.field && error.field.includes('subnets[')) {
      const [subnetIdx, field] = error.field.split('.');
      const idx = parseInt(
        subnetIdx.substring(subnetIdx.indexOf('[') + 1, subnetIdx.indexOf(']')),
        10
      );

      // if there already exists some previous error for the subnet at index idx, we
      // just add the current error. Otherwise, we create a new entry for the subnet.
      if (subnetErrors[idx]) {
        subnetErrors[idx] = { ...subnetErrors[idx], [field]: error.reason };
      } else {
        subnetErrors[idx] = { [field]: error.reason };
      }
    } else {
      nonSubnetErrors.push(error);
    }
  });

  handleAPIErrors(nonSubnetErrors, setFieldError, setError);
  return subnetErrors;
};
