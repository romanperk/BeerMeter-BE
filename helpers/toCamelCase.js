const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const value = obj[key];
      result[camelKey] =
        value !== null && typeof value === 'object' && !(value instanceof Date) ? toCamelCase(value) : value;
      return result;
    }, {});
  }
  return obj;
};

module.exports = toCamelCase;
