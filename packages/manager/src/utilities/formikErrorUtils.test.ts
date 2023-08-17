import { handleAPIErrors, convertVpcApiErrors } from './formikErrorUtils';

const errorWithoutField = [{ reason: 'Internal server error' }];
const errorWithField = [
  { field: 'data.card_number', reason: 'Invalid credit card number' },
];

const setFieldError = jest.fn();
const setError = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

describe('handleAPIErrors', () => {
  it('should handle api error with a field', () => {
    handleAPIErrors(errorWithField, setFieldError, setError);
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });

  it('should handle a general api error', () => {
    handleAPIErrors(errorWithoutField, setFieldError, setError);
    expect(setFieldError).not.toHaveBeenCalledWith();
    expect(setError).toHaveBeenCalledWith(errorWithoutField[0].reason);
  });
});

const subnetMultipleErrorsPerField = [
  {
    reason: 'not expected error for label',
    field: 'subnets[0].label',
  },
  {
    reason: 'expected error for label',
    field: 'subnets[0].label',
  },
  {
    reason: 'not expected error for ipv4',
    field: 'subnets[0].ipv4',
  },
  {
    reason: 'expected error for ipv4',
    field: 'subnets[0].ipv4',
  },
];

const subnetsWithWithoutErrors = [
  {
    reason: 'Label required',
    field: 'subnets[1].label',
  },
  {
    reason: 'bad label',
    field: 'subnets[2].label',
  },
  {
    reason: 'cidr ipv4',
    field: 'subnets[2].ipv4',
  },
  {
    reason: 'needs an ip',
    field: 'subnets[4].ipv4',
  },
  {
    reason: 'needs an ipv6',
    field: 'subnets[4].ipv6',
  },
];

describe('convertVpcApiErrors', () => {
  it('converts API errors for subnets into array of SubnetErrors', () => {
    const errors = convertVpcApiErrors(
      subnetsWithWithoutErrors,
      5,
      setFieldError,
      setError
    );
    expect(errors).toHaveLength(5);
    // a subnet with no errors has an empty {} object associated with it
    expect(Object.keys(errors[0])).toHaveLength(0);
    expect(Object.keys(errors[1])).toHaveLength(1);
    expect(errors[1].label).toBe('Label required');
    expect(Object.keys(errors[2])).toHaveLength(2);
    expect(errors[2].label).toBe('bad label');
    expect(errors[2].ipv4).toBe('cidr ipv4');
    expect(Object.keys(errors[3])).toHaveLength(0);
    expect(Object.keys(errors[4])).toHaveLength(2);
    expect(errors[4].ipv6).toBe('needs an ipv6');
    expect(errors[4].ipv4).toBe('needs an ip');
  });

  it('takes the last error to display if a subnet field has multiple errors associated with it', () => {
    const errors = convertVpcApiErrors(
      subnetMultipleErrorsPerField,
      2,
      setFieldError,
      setError
    );
    expect(errors).toHaveLength(2);
    expect(Object.keys(errors[0])).toHaveLength(2);
    expect(errors[0].label).toBe('expected error for label');
    expect(errors[0].ipv4).toBe('expected error for ipv4');
    expect(Object.keys(errors[1])).toHaveLength(0);
  });

  it('returns an array of objects the length of the number of subnets passed in', () => {
    const errors = convertVpcApiErrors(
      errorWithField,
      10,
      setFieldError,
      setError
    );
    expect(errors).toHaveLength(10);
    errors.forEach((error) => {
      expect(Object.keys(error)).toHaveLength(0);
    });

    const badCall = convertVpcApiErrors(
      errorWithField,
      -1,
      setFieldError,
      setError
    );
    expect(badCall).toHaveLength(0);
  });

  it('passes errors without the subnet field to handleApiErrors', () => {
    const errors = convertVpcApiErrors(
      errorWithField,
      0,
      setFieldError,
      setError
    );
    expect(errors).toHaveLength(0);
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });
});
