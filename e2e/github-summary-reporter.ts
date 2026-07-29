import { appendFileSync } from 'node:fs';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
} from '@playwright/test/reporter';

const escapeCell = (value: string) => value.replaceAll('|', '\\|');

class GitHubSummaryReporter implements Reporter {
  private suite?: Suite;

  onBegin(_config: FullConfig, suite: Suite) {
    this.suite = suite;
  }

  onEnd(result: FullResult) {
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryPath || !this.suite) return;

    const tests = this.suite.allTests();
    const counts = tests.reduce<Record<string, number>>((totals, test) => {
      const outcome = test.outcome();
      totals[outcome] = (totals[outcome] ?? 0) + 1;
      return totals;
    }, {});
    const duration = tests.reduce(
      (total, test) =>
        total + test.results.reduce((sum, testResult) => sum + testResult.duration, 0),
      0,
    );
    const failures = tests.filter((test) => test.outcome() === 'unexpected');

    const lines = [
      '## Playwright E2E results',
      '',
      `**${result.status === 'passed' ? '✅ Passed' : '❌ Failed'}** in ${(duration / 1000).toFixed(1)}s`,
      '',
      '| Passed | Failed | Flaky | Skipped | Total |',
      '| ---: | ---: | ---: | ---: | ---: |',
      `| ${counts.expected ?? 0} | ${counts.unexpected ?? 0} | ${counts.flaky ?? 0} | ${counts.skipped ?? 0} | ${tests.length} |`,
      '',
    ];

    if (failures.length) {
      lines.push('### Failed tests', '');
      failures.forEach((test: TestCase) => {
        lines.push(`- ${escapeCell(test.titlePath().join(' › '))}`);
      });
      lines.push('');
    }

    lines.push('The full HTML report is available in this run’s artifacts.', '');
    appendFileSync(summaryPath, lines.join('\n'));
  }
}

export default GitHubSummaryReporter;
