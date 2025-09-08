export interface TestCaseInfo {
  caseId: number;
  caseName: string;
}

const SPLIT_CHAR = '-';

// Map test titles to QASE case IDs
export function getTestCaseInfo(title: string): TestCaseInfo {
  if(title.indexOf(SPLIT_CHAR) <= 0) 
    return { caseId: 0, caseName: '' };

  const parts = title.split(SPLIT_CHAR);
  return {
    caseId: parseInt(parts[0].trim()) || 0,
    caseName: parts[1]?.trim() || ''
  };
}