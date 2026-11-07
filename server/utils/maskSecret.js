/**
 * Masks credentials (passwords, auth tokens) in MongoDB URIs or connection strings.
 * E.g., mongodb://user:secret@host -> mongodb://user:****@host
 */
export const maskMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/g, '//$1:****@');
};
