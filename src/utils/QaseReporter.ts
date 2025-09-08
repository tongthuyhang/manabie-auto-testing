import axios from 'axios';
import { CommonConstants } from '../constants/commonConstants';
import { TestInfo } from '@playwright/test';

export class QaseReporter {
  private baseUrl: string;
  private apiToken: string;
  private projectCode: string;
  private runId?: number;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.QASE_BASE_URL || '';
    this.apiToken = process.env.QASE_API_TOKEN || '';
    this.projectCode = process.env.QASE_PROJECT_CODE || '';
    this.enabled = process.env.QASE_ENABLED === 'True' || false;
  }

  async createTestRun(title: string = 'Automated Test Run'): Promise<void> {
    if (!this.enabled) return;

    try {
      const response = await axios.post(
        `${this.baseUrl}/run/${this.projectCode}`,
        { title },
        {
          headers: {
            'Token': this.apiToken,
            'Content-Type': 'application/json'
          }
        }
      );
      this.runId = response.data.result.id;

      console.log(`Created test run with ID: ${this.runId}`);
    } catch (error) {
      console.error('Failed to create test run:', error);
    }
  }

  async reportTestResult(caseId: number, testInfo: TestInfo, comment?: string): Promise<void> {
    if (!this.enabled || !this.runId || caseId <= 0) return;

    const isPassed = testInfo.status === CommonConstants.PASS_STATUS;
    const finalStatus = isPassed             
      ? CommonConstants.PASS_STATUS 
      : CommonConstants.FAIL_STATUS;
    const finalComment = isPassed 
      ? comment
      : testInfo.error?.message;

    try {
      await axios.post(
        `${this.baseUrl}/result/${this.projectCode}/${this.runId}`,
        {
          case_id: caseId,
          status: finalStatus,
          comment: finalComment
        },
        {
          headers: {
            'Token': this.apiToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Reported result for case ${caseId}: ${finalStatus}`);
    } catch (error) {
      console.error('Failed to report test result:', error);
    }
  }

  async completeTestRun(): Promise<void> {
    if (!this.enabled || !this.runId) return;

    try {
      await axios.post(
        `${this.baseUrl}/run/${this.projectCode}/${this.runId}/complete`,
        {},
        {
          headers: {
            'Token': this.apiToken
          }
        }
      );

      console.log(`Completed test run ${this.runId}`);
    } catch (error) {
      console.error('Failed to complete test run:', error);
    }
  }
}