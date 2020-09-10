const { Environment } = require('@sage/bc-debug-testrunner');

module.exports = (environment, region) => {
    const shortCode = environment.substring(0, 3);
    const postfix = shortCode === 'prd' ? '' : `-${shortCode}`;

    if (!environment || environment === Environment.local) {
        return 'https://localhost';
    }

    if (environment.indexOf('prd') !== -1) {
        return region === 'eu-west-1' ? 'https://' : 'https://';
    }

    return `https://bnkc-skeleton-${environment}-${region}.sagebanking${postfix}.cloud`;
};
