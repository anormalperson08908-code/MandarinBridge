// tests/lighthouse_test.js
// Run with: node tests/lighthouse_test.js

import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';

const URLs = [
    { name: 'Home Page', url: 'http://127.0.0.1:5000/' },
    { name: 'Login Page', url: 'http://127.0.0.1:5000/login' },
    { name: 'Register Page', url: 'http://127.0.0.1:5000/register' },
    { name: 'Dashboard', url: 'http://127.0.0.1:5000/dashboard' },
    { name: 'Profile Page', url: 'http://127.0.0.1:5000/profile' },
    { name: 'Quiz Page', url: 'http://127.0.0.1:5000/quiz' }
];

async function runLighthouseTest(url, name) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const options = {
        logLevel: 'error',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: (new URL(browser.wsEndpoint())).port
    };
    
    const runnerResult = await lighthouse(url, options);
    
    await browser.close();
    
    const report = {
        name: name,
        url: url,
        performance: runnerResult.lhr.categories.performance.score * 100,
        accessibility: runnerResult.lhr.categories.accessibility.score * 100,
        bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
        seo: runnerResult.lhr.categories.seo.score * 100,
        firstContentfulPaint: runnerResult.lhr.audits['first-contentful-paint'].displayValue,
        largestContentfulPaint: runnerResult.lhr.audits['largest-contentful-paint'].displayValue,
        totalBlockingTime: runnerResult.lhr.audits['total-blocking-time'].displayValue,
        cumulativeLayoutShift: runnerResult.lhr.audits['cumulative-layout-shift'].displayValue
    };
    
    return report;
}

async function runAllTests() {
    console.log('\n📊 Running Lighthouse Performance Tests...\n');
    
    const results = [];
    
    for (const page of URLs) {
        console.log(`Testing: ${page.name}...`);
        try {
            const result = await runLighthouseTest(page.url, page.name);
            results.push(result);
            console.log(`  ✅ Performance: ${result.performance}%`);
            console.log(`  📱 Accessibility: ${result.accessibility}%`);
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        environment: 'Production',
        results: results,
        summary: {
            averagePerformance: results.reduce((sum, r) => sum + r.performance, 0) / results.length,
            averageAccessibility: results.reduce((sum, r) => sum + r.accessibility, 0) / results.length,
            bestPerformance: Math.max(...results.map(r => r.performance)),
            worstPerformance: Math.min(...results.map(r => r.performance))
        }
    };
    
    // Save report
    fs.writeFileSync('lighthouse-report.json', JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Average Performance Score: ${report.summary.averagePerformance.toFixed(1)}%`);
    console.log(`Average Accessibility Score: ${report.summary.averageAccessibility.toFixed(1)}%`);
    console.log(`Best Performance: ${report.summary.bestPerformance}%`);
    console.log(`Worst Performance: ${report.summary.worstPerformance}%`);
    console.log('\n✅ Report saved to: lighthouse-report.json');
}

runAllTests().catch(console.error);