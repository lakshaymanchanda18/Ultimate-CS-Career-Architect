import { NextResponse } from 'next/server';

const providerEnvKeys = [
  'GEMINI_API_KEY',
  'AI_API_KEY',
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
  'MISTRAL_API_KEY',
  'CEREBRAS_API_KEY',
] as const;

export async function GET() {
  const configuredProviders = providerEnvKeys.filter((key) => Boolean(process.env[key]));

  return NextResponse.json({
    aiConfigured: configuredProviders.length > 0,
    configuredProviders,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    nextAuthConfigured: Boolean(process.env.NEXTAUTH_URL && process.env.NEXTAUTH_SECRET),
  });
}
