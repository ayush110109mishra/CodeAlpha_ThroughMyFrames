/**
 * ==============================================================================
 * Environment Variable Validator
 * ==============================================================================
 * WHY THIS VALIDATOR EXISTS:
 * "Fail fast" security pattern. If a required secret or configuration variable is
 * missing or insecure, the server refuses to boot immediately rather than crashing
 * unpredictably mid-request during runtime or leaving the app vulnerable.
 */

export const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = [];

  if (!process.env.MONGO_URI) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.CLIENT_URL) missing.push('CLIENT_URL');

  if (missing.length > 0) {
    console.error('\n❌ [CRITICAL CONFIGURATION ERROR]: Missing required environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error('\nPlease verify your server/.env file or deployment dashboard environment settings.\n');
    process.exit(1);
  }

  // Production hardening checks
  if (isProduction) {
    const jwtSecret = process.env.JWT_SECRET;
    const sampleStrings = [
      'default',
      'sample',
      'secret',
      'change_me',
      'through_my_frames_super_secret_jwt_key_2026_at_least_32_characters_long',
      'your_jwt_secret',
    ];

    if (jwtSecret.length < 32) {
      console.error(
        '\n🔒 [SECURITY REFUSAL]: In production, JWT_SECRET must be at least 32 characters long to resist brute-force cryptographic cracking.'
      );
      process.exit(1);
    }

    const matchesSample = sampleStrings.some((sample) =>
      jwtSecret.toLowerCase().includes(sample)
    );

    if (matchesSample) {
      console.error(
        '\n🔒 [SECURITY REFUSAL]: In production, JWT_SECRET cannot be a sample or default placeholder string. Generate a high-entropy secret using `openssl rand -hex 32`.'
      );
      process.exit(1);
    }
  }
};
