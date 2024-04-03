import { ZodIssue } from 'zod';

export const generateZodIssueResponse = (issues: ZodIssue[]) => {
  return issues.map(({ path, message }) => {
    return {
      property: path.join('.'),
      message,
    };
  });
};
