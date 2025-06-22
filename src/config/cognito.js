// src/config/cognito.js
export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_OWGJIHWbR',
      userPoolClientId: '2t9elmqo217fecocfk1pp15pdr',
      loginWith: {
        email: true,
        username: false,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        given_name: {
          required: true,
        },
        family_name: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
};