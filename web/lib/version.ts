export const getAppVersion = () => {
  return process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION || '1.0.0';
};

export const getAppName = () => {
  return process.env.NEXT_PUBLIC_APP_NAME || process.env.APP_NAME || 'Philand';
};

export const getVersionInfo = () => {
  return {
    version: getAppVersion(),
    name: getAppName(),
    buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
  };
};