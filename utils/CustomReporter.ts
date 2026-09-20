import type {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
    TestStep,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TestStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
}

interface StepInfo {
    title: string;
    category: string;
    duration: number;
    error?: string;
}

interface AttachmentInfo {
    name: string;
    contentType: string;
    path?: string;
}

interface TestDetails {
    id: string;
    title: string;
    file: string;
    category: string;
    status: 'passed' | 'failed' | 'skipped' | 'flaky';
    duration: number;
    startTime: string;
    error?: string;
    retries: number;
    steps: StepInfo[];
    attachments: AttachmentInfo[];
    tracePath?: string;
    screenshotPath?: string;
    videoPath?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTER
// ─────────────────────────────────────────────────────────────────────────────

export default class CustomReporter implements Reporter {
    private startTime: number = 0;
    private tests: TestDetails[] = [];
    private readonly outputDir: string = 'reports/custom';

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    onBegin(_config: FullConfig, suite: Suite): void {
        this.startTime = Date.now();
        console.log(`\n🚀 Starting test execution — ${suite.allTests().length} tests found\n`);
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const fileName = path.basename(test.location.file, '.spec.ts');

        // ── Collect steps ──────────────────────────────────────────────────────
        const steps = this.flattenSteps(result.steps);

        // ── Locate trace, screenshot & video attachments ───────────────────────
        const traceAttachment = result.attachments.find(
            (a) => a.name === 'trace' && a.path
        );
        const screenshotAttachment = result.attachments.find(
            (a) => a.contentType === 'image/png' && a.path
        );
        const videoAttachment = result.attachments.find(
            (a) => a.contentType === 'video/webm' && a.path
        );

        // ── Collect all attachments ────────────────────────────────────────────
        const attachments: AttachmentInfo[] = result.attachments.map((a) => ({
            name: a.name,
            contentType: a.contentType,
            path: a.path,
        }));

        this.tests.push({
            id: fileName,
            title: test.title,
            file: test.location.file,
            category: this.categorize(fileName),
            status: this.resolveStatus(result),
            duration: result.duration,
            startTime: new Date(result.startTime).toLocaleTimeString(),
            error: result.error?.message?.split('\n').slice(0, 3).join(' '),
            retries: result.retry,
            steps,
            attachments,
            tracePath: traceAttachment?.path,
            screenshotPath: screenshotAttachment?.path,
            videoPath: videoAttachment?.path,
        });
    }

    async onEnd(result: FullResult): Promise<void> {
        const totalDuration = Date.now() - this.startTime;
        const stats = this.calcStats();

        this.ensureDir(this.outputDir);
        this.writeHtml(stats, totalDuration);
        this.writeJson(stats, totalDuration);

        const status = result.status === 'passed' ? '✅' : '❌';
        console.log(`\n${status} Run finished in ${(totalDuration / 1000).toFixed(2)}s`);
        console.log(`   Passed: ${stats.passed}  Failed: ${stats.failed}  Skipped: ${stats.skipped}  Flaky: ${stats.flaky}`);
        console.log(`\n📊 Custom report → ${path.resolve(this.outputDir, 'index.html')}`);
        console.log(`📄 JSON results  → ${path.resolve(this.outputDir, 'results.json')}\n`);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private resolveStatus(result: TestResult): TestDetails['status'] {
        if (result.status === 'skipped') return 'skipped';
        if (result.status === 'passed' && result.retry > 0) return 'flaky';
        if (result.status === 'passed') return 'passed';
        return 'failed';
    }

    private categorize(fileName: string): string {
        if (/TC-001|valid_request/.test(fileName)) return 'Functional';
        if (/TC-002|response_time/.test(fileName)) return 'Performance';
        if (/TC-00[789]|TC-010|sql|xss|https/.test(fileName)) return 'Security';
        if (/TC-00[3-6]|TC-009|missing|invalid|empty/.test(fileName)) return 'Negative';
        return 'Other';
    }

    private flattenSteps(steps: TestStep[]): StepInfo[] {
        const flat: StepInfo[] = [];
        const walk = (list: TestStep[]) => {
            for (const s of list) {
                flat.push({
                    title: s.title,
                    category: s.category,
                    duration: s.duration,
                    error: s.error?.message,
                });
                if (s.steps?.length) walk(s.steps);
            }
        };
        walk(steps);
        return flat;
    }

    private calcStats(): TestStats {
        return {
            total: this.tests.length,
            passed: this.tests.filter((t) => t.status === 'passed').length,
            failed: this.tests.filter((t) => t.status === 'failed').length,
            skipped: this.tests.filter((t) => t.status === 'skipped').length,
            flaky: this.tests.filter((t) => t.status === 'flaky').length,
        };
    }

    private ensureDir(dir: string): void {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    private writeHtml(stats: TestStats, duration: number): void {
        const html = this.buildHtml(stats, duration);
        fs.writeFileSync(path.join(this.outputDir, 'index.html'), html, 'utf-8');
    }

    private writeJson(stats: TestStats, duration: number): void {
        const payload = {
            summary: { ...stats, duration, timestamp: new Date().toISOString() },
            tests: this.tests,
        };
        fs.writeFileSync(
            path.join(this.outputDir, 'results.json'),
            JSON.stringify(payload, null, 2),
            'utf-8'
        );
    }

    // ── HTML building ──────────────────────────────────────────────────────────

    private buildHtml(stats: TestStats, duration: number): string {
        const passRate = stats.total ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
        const passColor = parseFloat(passRate) >= 90 ? '#22c55e' : parseFloat(passRate) >= 70 ? '#f59e0b' : '#ef4444';
        const runDate = new Date().toLocaleString();
        const byCategory = this.groupByCategory();
        const categoryOrder = ['Functional', 'Performance', 'Negative', 'Security', 'Other'];
        const sortedCats = categoryOrder.filter((c) => byCategory[c]);

        const categoryIcons: Record<string, string> = {
            Functional: '⚙️',
            Performance: '⚡',
            Negative: '🚫',
            Security: '🔒',
            Other: '📁',
        };

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Pilot — Test Report</title>
  <style>
    :root {
      --purple: #7c3aed;
      --purple-light: #ede9fe;
      --green: #22c55e;
      --red: #ef4444;
      --yellow: #f59e0b;
      --orange: #f97316;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-900: #111827;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--gray-100);
      color: var(--gray-900);
      min-height: 100vh;
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      color: white;
      padding: 2.5rem 2rem 2rem;
      text-align: center;
    }
    .header h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }
    .header .subtitle { margin-top: 0.4rem; opacity: 0.85; font-size: 0.95rem; }
    .header .meta { margin-top: 1rem; opacity: 0.7; font-size: 0.8rem; letter-spacing: 0.3px; }

    /* ── Summary cards ── */
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-bottom: 1px solid var(--gray-200);
    }
    .card {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      padding: 1.25rem 1rem;
      text-align: center;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    .card .num  { font-size: 2.4rem; font-weight: 800; line-height: 1; }
    .card .lbl  { margin-top: 0.4rem; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--gray-500); }
    .card.total   .num { color: #4f46e5; }
    .card.passed  .num { color: var(--green); }
    .card.failed  .num { color: var(--red); }
    .card.skipped .num { color: var(--yellow); }
    .card.flaky   .num { color: var(--orange); }
    .card.rate    .num { color: ${passColor}; }
    .card.dur     .num { font-size: 1.6rem; color: var(--gray-700); }

    /* ── Progress bar ── */
    .progress-wrap { padding: 0 1.5rem 1.5rem; background: white; border-bottom: 1px solid var(--gray-200); }
    .progress-label { font-size: 0.8rem; color: var(--gray-500); margin-bottom: 0.4rem; }
    .progress-bar { height: 8px; background: var(--gray-200); border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--green) 0%, #16a34a 100%); border-radius: 99px; transition: width 0.8s ease; }

    /* ── Body layout ── */
    .body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }

    /* ── Category section ── */
    .cat-section { background: white; border-radius: 12px; border: 1px solid var(--gray-200); overflow: hidden; }
    .cat-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
      cursor: pointer;
      user-select: none;
    }
    .cat-header:hover { background: var(--gray-100); }
    .cat-title { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
    .cat-badge {
      background: var(--purple-light); color: var(--purple);
      padding: 0.2rem 0.65rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600;
    }
    .cat-chevron { color: var(--gray-500); font-size: 0.85rem; transition: transform 0.2s; }
    .cat-header.collapsed .cat-chevron { transform: rotate(-90deg); }

    /* ── Test rows ── */
    .tests-list { display: flex; flex-direction: column; }
    .test-row {
      border-bottom: 1px solid var(--gray-100);
      transition: background 0.15s;
    }
    .test-row:last-child { border-bottom: none; }
    .test-row-header {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.85rem 1.25rem;
      cursor: pointer;
    }
    .test-row-header:hover { background: var(--gray-50); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .status-dot.passed  { background: var(--green); }
    .status-dot.failed  { background: var(--red); }
    .status-dot.skipped { background: var(--yellow); }
    .status-dot.flaky   { background: var(--orange); }
    .test-name { flex: 1; font-size: 0.875rem; font-weight: 500; }
    .test-chips { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .chip {
      padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.7rem; font-weight: 600;
    }
    .chip.passed  { background: #dcfce7; color: #166534; }
    .chip.failed  { background: #fee2e2; color: #991b1b; }
    .chip.skipped { background: #fef9c3; color: #854d0e; }
    .chip.flaky   { background: #ffedd5; color: #9a3412; }
    .chip.time    { background: var(--gray-100); color: var(--gray-500); }
    .chip.retry   { background: #fef3c7; color: #92400e; }

    /* ── Expandable details ── */
    .test-details {
      display: none;
      padding: 0 1.25rem 1.25rem 2.75rem;
      background: var(--gray-50);
      border-top: 1px dashed var(--gray-200);
    }
    .test-details.open { display: block; }

    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .detail-block { background: white; border: 1px solid var(--gray-200); border-radius: 8px; padding: 0.875rem; }
    .detail-block h4 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--gray-500); margin-bottom: 0.5rem; }

    /* ── Steps table ── */
    .steps-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .steps-table th {
      text-align: left; padding: 0.4rem 0.6rem;
      background: var(--gray-100); color: var(--gray-500);
      font-weight: 600; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.6px;
    }
    .steps-table td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--gray-100); color: var(--gray-700); }
    .steps-table tr:last-child td { border-bottom: none; }
    .steps-table td:last-child { text-align: right; color: var(--gray-500); }
    .step-err { color: var(--red) !important; font-size: 0.75rem; }

    /* ── Error block ── */
    .error-block {
      background: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid var(--red);
      border-radius: 8px; padding: 0.875rem; margin-bottom: 1rem;
      font-family: 'Courier New', monospace; font-size: 0.8rem; color: #991b1b;
      white-space: pre-wrap; word-break: break-word;
    }

    /* ── Trace link ── */
    .trace-section { margin-top: 0.5rem; }
    .trace-note {
      background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
      padding: 0.75rem 1rem; font-size: 0.8rem; color: #1e40af; line-height: 1.6;
    }
    .trace-note code {
      background: #dbeafe; padding: 0.1rem 0.4rem; border-radius: 4px;
      font-family: 'Courier New', monospace; font-size: 0.78rem;
    }
    .trace-path {
      margin-top: 0.4rem; font-family: 'Courier New', monospace;
      font-size: 0.75rem; color: #1d4ed8; word-break: break-all;
      background: #dbeafe; padding: 0.4rem 0.6rem; border-radius: 6px;
    }

    /* ── Footer ── */
    footer {
      margin: 0 1.5rem 1.5rem;
      text-align: center; color: var(--gray-500); font-size: 0.8rem;
      padding: 1rem; background: white; border-radius: 8px; border: 1px solid var(--gray-200);
    }

    @media (max-width: 640px) {
      .details-grid { grid-template-columns: 1fr; }
      .summary { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>🚀 QA Pilot Project</h1>
    <p class="subtitle">Retail Width Checks API — Test Execution Report</p>
    <p class="meta">Run on ${runDate} &nbsp;|&nbsp; ${stats.total} tests &nbsp;|&nbsp; ${(duration / 1000).toFixed(2)}s total</p>
  </div>

  <div class="summary">
    <div class="card total">
      <div class="num">${stats.total}</div>
      <div class="lbl">Total</div>
    </div>
    <div class="card passed">
      <div class="num">${stats.passed}</div>
      <div class="lbl">Passed</div>
    </div>
    <div class="card failed">
      <div class="num">${stats.failed}</div>
      <div class="lbl">Failed</div>
    </div>
    <div class="card skipped">
      <div class="num">${stats.skipped}</div>
      <div class="lbl">Skipped</div>
    </div>
    <div class="card flaky">
      <div class="num">${stats.flaky}</div>
      <div class="lbl">Flaky</div>
    </div>
    <div class="card rate">
      <div class="num">${passRate}%</div>
      <div class="lbl">Pass Rate</div>
    </div>
    <div class="card dur">
      <div class="num">${(duration / 1000).toFixed(2)}s</div>
      <div class="lbl">Duration</div>
    </div>
  </div>

  <div class="progress-wrap">
    <div class="progress-label">Overall progress — ${stats.passed} / ${stats.total} tests passed</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${passRate}%"></div>
    </div>
  </div>

  <div class="body">
    ${sortedCats.map((cat) => this.renderCategory(cat, byCategory[cat], categoryIcons[cat] ?? '📁')).join('')}

    <footer>
      Generated on ${runDate} &nbsp;·&nbsp; Playwright + TypeScript &nbsp;·&nbsp; QA Pilot Project
    </footer>
  </div>

  <script>
    // Toggle category collapse
    document.querySelectorAll('.cat-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var list = header.nextElementSibling;
        header.classList.toggle('collapsed');
        list.style.display = header.classList.contains('collapsed') ? 'none' : '';
      });
    });

    // Toggle test details
    document.querySelectorAll('.test-row-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var details = header.nextElementSibling;
        if (details && details.classList.contains('test-details')) {
          details.classList.toggle('open');
        }
      });
    });
  </script>
</body>
</html>`;
    }

    private groupByCategory(): Record<string, TestDetails[]> {
        const grouped: Record<string, TestDetails[]> = {};
        for (const t of this.tests) {
            (grouped[t.category] ??= []).push(t);
        }
        return grouped;
    }

    private renderCategory(category: string, tests: TestDetails[], icon: string): string {
        const passCount = tests.filter((t) => t.status === 'passed').length;
        return `
    <div class="cat-section">
      <div class="cat-header">
        <span class="cat-title">${icon} ${category}</span>
        <span style="display:flex;gap:0.5rem;align-items:center">
          <span class="cat-badge">${passCount}/${tests.length} passed</span>
          <span class="cat-chevron">▼</span>
        </span>
      </div>
      <div class="tests-list">
        ${tests.map((t) => this.renderTest(t)).join('')}
      </div>
    </div>`;
    }

    private renderTest(t: TestDetails): string {
        const retryChip = t.retries > 0 ? `<span class="chip retry">↺ retry ${t.retries}</span>` : '';
        const stepsHtml = this.renderSteps(t.steps);
        const traceHtml = this.renderTrace(t);
        const screenshotHtml = this.renderScreenshot(t);
        const videoHtml = this.renderVideo(t);
        const errorHtml = t.error
            ? `<div class="error-block">${this.esc(t.error)}</div>`
            : '';

        return `
      <div class="test-row">
        <div class="test-row-header">
          <span class="status-dot ${t.status}"></span>
          <span class="test-name">${this.esc(t.title)}</span>
          <span class="test-chips">
            <span class="chip time">⏱ ${t.duration}ms</span>
            ${retryChip}
            <span class="chip ${t.status}">${t.status.toUpperCase()}</span>
          </span>
        </div>
        <div class="test-details">
          <div style="font-size:0.75rem;color:var(--gray-500);margin-bottom:0.75rem;">
            Started at ${t.startTime} &nbsp;·&nbsp; File: <code>${path.basename(t.file)}</code>
          </div>
          ${errorHtml}
          <div class="details-grid">
            <div class="detail-block">
              <h4>📋 Test Steps</h4>
              ${stepsHtml}
            </div>
            <div class="detail-block">
              <h4>🔍 Trace</h4>
              ${traceHtml}
            </div>
          </div>
          <div class="details-grid" style="margin-top:1rem;">
            <div class="detail-block">
              <h4>🖼️ Screenshot</h4>
              ${screenshotHtml}
            </div>
            <div class="detail-block">
              <h4>🎥 Video</h4>
              ${videoHtml}
            </div>
          </div>
        </div>
      </div>`;
    }

    private renderSteps(steps: StepInfo[]): string {
        if (!steps.length) {
            return `<p style="font-size:0.8rem;color:var(--gray-500)">No steps recorded.</p>`;
        }
        const rows = steps
            .map(
                (s) => `
        <tr>
          <td>${this.esc(s.title)}${s.error ? `<br><span class="step-err">${this.esc(s.error)}</span>` : ''}</td>
          <td>${s.duration}ms</td>
        </tr>`
            )
            .join('');

        return `
      <table class="steps-table">
        <thead><tr><th>Step</th><th>Duration</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    }

    private renderTrace(t: TestDetails): string {
        if (t.tracePath) {
            return `
        <div class="trace-note">
          <strong>Trace captured ✅</strong><br>
          Open the Playwright HTML report and click this test to view the full
          interactive trace — every request, response header, body, and assertion.<br><br>
          Or run in terminal:<br>
          <code>npx playwright show-trace "${t.tracePath.replace(/\\/g, '/')}"</code>
          <div class="trace-path">${t.tracePath}</div>
        </div>`;
        }
        return `<p style="font-size:0.8rem;color:var(--gray-500);">
      No trace available. Set <code>trace: 'on'</code> in <code>playwright.config.ts</code> to capture traces.
    </p>`;
    }

    private renderScreenshot(t: TestDetails): string {
        if (t.screenshotPath) {
            const relPath = path.relative(this.outputDir, t.screenshotPath).replace(/\\/g, '/');
            return `
        <div class="screenshot-wrap">
          <img src="${relPath}" alt="Screenshot" style="max-width:100%;border-radius:8px;border:1px solid var(--gray-200);" />
          <div class="trace-path" style="margin-top:0.4rem;">${t.screenshotPath}</div>
        </div>`;
        }
        return `<p style="font-size:0.8rem;color:var(--gray-500);">
      No screenshot available. Set <code>screenshot: 'on'</code> in <code>playwright.config.ts</code> to capture screenshots.
    </p>`;
    }

    private renderVideo(t: TestDetails): string {
        if (t.videoPath) {
            const relPath = path.relative(this.outputDir, t.videoPath).replace(/\\/g, '/');
            return `
        <div class="video-wrap">
          <video controls style="max-width:100%;border-radius:8px;border:1px solid var(--gray-200);">
            <source src="${relPath}" type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <div class="trace-path" style="margin-top:0.4rem;">${t.videoPath}</div>
        </div>`;
        }
        return `<p style="font-size:0.8rem;color:var(--gray-500);">
      No video available. Set <code>video: 'on'</code> in <code>playwright.config.ts</code> to capture videos.
    </p>`;
    }

    private esc(text: string): string {
        return text.replace(/[&<>"']/g, (c) =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] ?? c)
        );
    }
}
