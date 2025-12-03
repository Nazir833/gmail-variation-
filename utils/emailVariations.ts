import { v4 as uuidv4 } from 'uuid';
import { GeneratedEmail } from '../types';

/**
 * Generates a list of unique email variations based on a base Gmail address.
 * Variations include different letter casings and optionally numbers at the end.
 * @param baseEmail The original Gmail address (e.g., "john.doe@gmail.com").
 * @param numToGenerate The desired number of unique variations to generate.
 * @returns An array of GeneratedEmail objects.
 */
export const generateEmailVariations = (baseEmail: string, numToGenerate: number): GeneratedEmail[] => {
  const uniqueVariations = new Set<string>();
  const parts = baseEmail.split('@');
  if (parts.length !== 2) return [];

  const username = parts[0];
  const domain = parts[1];

  // Store various base username patterns
  const baseUsernames: string[] = [];

  // Add original casing
  baseUsernames.push(username);

  // Add all lowercase
  baseUsernames.push(username.toLowerCase());

  // Add all uppercase
  baseUsernames.push(username.toUpperCase());

  // Add alternating case (e.g., "JoHnDoE")
  let altCaseUsername = '';
  for (let i = 0; i < username.length; i++) {
    altCaseUsername += i % 2 === 0 ? username[i].toUpperCase() : username[i].toLowerCase();
  }
  baseUsernames.push(altCaseUsername);

  // Add title case (e.g., "John.Doe" - capitalizes first letter and after dots)
  const titleCaseUsername = username
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('.');
  baseUsernames.push(titleCaseUsername);

  // Populate the uniqueVariations Set with casing variations first
  for (const u of baseUsernames) {
    uniqueVariations.add(`${u}@${domain}`);
  }

  // Then add variations with numbers to each base username, ensuring uniqueness
  let numSuffix = 1;
  // Generate a larger pool of variations to ensure we can meet numToGenerate,
  // up to a reasonable maximum (e.g., 5 times the requested count for suffixes).
  const maxSuffixAttempts = numToGenerate * 5;
  while (uniqueVariations.size < numToGenerate * 2 && numSuffix <= maxSuffixAttempts) {
    for (const u of baseUsernames) {
      uniqueVariations.add(`${u}${numSuffix}@${domain}`);
    }
    numSuffix++;
  }

  // Convert the set to an array, slice to the desired count, and map to GeneratedEmail objects
  const finalEmails: GeneratedEmail[] = Array.from(uniqueVariations)
    .slice(0, numToGenerate)
    .map(email => ({
      id: uuidv4(),
      email,
      copyCount: 0,
    }));

  return finalEmails;
};
