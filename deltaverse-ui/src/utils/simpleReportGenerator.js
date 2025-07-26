/**
 * 📊 SIMPLE FINANCIAL REPORT GENERATOR
 * Fallback report generation without complex dependencies
 * Works reliably across all environments
 */

import { jsPDF } from 'jspdf';

export class SimpleFinancialReportGenerator {
  constructor(financialData, calculatedInsights) {
    this.financialData = financialData;
    this.insights = calculatedInsights;
    this.reportDate = new Date().toLocaleDateString();
  }

  /**
   * 🔧 Initialize PDF with proper encoding
   */
  initializePDF() {
    const doc = new jsPDF();
    
    // Set proper font encoding to avoid character issues
    doc.setFont('helvetica', 'normal');
    
    return doc;
  }

  /**
   * 💎 Generate Crystal Clear Insights Report
   */
  generateCrystalClearReport() {
    const doc = this.initializePDF();
    
    // Header with proper text encoding
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('Crystal Clear Financial Insights Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Generated on: ' + this.reportDate, 20, 45);
    
    let yPosition = 60;
    
    // 1. Retirement Analysis
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text('1. RETIREMENT READINESS', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Question: ' + String(this.insights.retirement.question || 'Will I have enough money to retire comfortably?'), 20, yPosition);
    yPosition += 10;
    doc.text('Status: ' + String(this.insights.retirement.status || 'NEED MORE'), 20, yPosition);
    yPosition += 10;
    doc.text('Projected Amount: Rs.' + String((this.insights.retirement.projectedAmount/10000000).toFixed(1)) + ' Crores', 20, yPosition);
    yPosition += 10;
    doc.text('Progress: ' + String(this.insights.retirement.progressPercentage.toFixed(0)) + '% of target', 20, yPosition);
    yPosition += 10;
    
    // Split long text into multiple lines with proper encoding
    const retirementRec = doc.splitTextToSize('Recommendation: ' + String(this.insights.retirement.recommendation || 'Save more per month to reach your goal'), 170);
    doc.text(retirementRec, 20, yPosition);
    yPosition += retirementRec.length * 7 + 15;
    
    // 2. Goals Analysis
    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text('2. LIFE GOALS PROGRESS', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Status: ' + String(this.insights.goals.status || 'BEHIND SCHEDULE'), 20, yPosition);
    yPosition += 10;
    
    const goalsRec = doc.splitTextToSize('Recommendation: ' + String(this.insights.goals.recommendation || 'Focus on building your emergency fund first'), 170);
    doc.text(goalsRec, 20, yPosition);
    yPosition += goalsRec.length * 7 + 10;
    
    // Goals breakdown with proper formatting
    const goals = [this.insights.goals.emergencyGoal, this.insights.goals.houseGoal, this.insights.goals.educationGoal];
    goals.forEach((goal, index) => {
      const progress = ((goal.current / goal.target) * 100).toFixed(0);
      const currentLakhs = (goal.current/100000).toFixed(1);
      const targetLakhs = (goal.target/100000).toFixed(1);
      doc.text(String(goal.name) + ': ' + progress + '% complete (Rs.' + currentLakhs + 'L / Rs.' + targetLakhs + 'L)', 30, yPosition);
      yPosition += 8;
    });
    yPosition += 15;
    
    // 3. Risk Analysis
    doc.setFontSize(16);
    doc.setTextColor(255, 152, 0);
    doc.text('3. FINANCIAL RISKS', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Overall Risk: ' + String(this.insights.risks.status || 'LOW RISK'), 20, yPosition);
    yPosition += 10;
    doc.text('Market Risk: ' + String(this.insights.risks.marketRisk || 'MEDIUM'), 30, yPosition);
    yPosition += 8;
    doc.text('Inflation Risk: ' + String(this.insights.risks.inflationRisk || 'LOW'), 30, yPosition);
    yPosition += 8;
    doc.text('Emergency Risk: ' + String(this.insights.risks.emergencyRisk || 'LOW'), 30, yPosition);
    yPosition += 15;
    
    // 4. Money Efficiency
    doc.setFontSize(16);
    doc.setTextColor(156, 39, 176);
    doc.text('4. MONEY EFFICIENCY', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Status: ' + String(this.insights.cashFlow.status || 'EXCELLENT'), 20, yPosition);
    yPosition += 10;
    doc.text('Savings Rate: ' + String(this.insights.cashFlow.savingsRate.toFixed(0)) + '% (Target: 30%)', 20, yPosition);
    yPosition += 10;
    doc.text('Monthly Savings: Rs.' + String((this.financialData.monthlySavings/1000).toFixed(0)) + 'k', 20, yPosition);
    yPosition += 10;
    doc.text('Gap to Ideal: Rs.' + String((this.insights.cashFlow.monthlyGap/1000).toFixed(0)) + 'k', 20, yPosition);
    
    // Save the PDF
    doc.save('Crystal_Clear_Financial_Insights.pdf');
  }

  /**
   * 📊 Generate Professional Analysis Report
   */
  generateProfessionalReport() {
    const doc = this.initializePDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('Professional Financial Analysis Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Generated on: ' + this.reportDate, 20, 45);
    
    let yPosition = 60;
    
    // Financial Summary
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text('FINANCIAL SUMMARY', 20, yPosition);
    yPosition += 20;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Monthly Income: Rs.' + String((this.financialData.monthlyIncome/1000).toFixed(0)) + 'k', 20, yPosition);
    yPosition += 10;
    doc.text('Monthly Expenses: Rs.' + String((this.financialData.monthlyExpenses/1000).toFixed(0)) + 'k', 20, yPosition);
    yPosition += 10;
    doc.text('Monthly Savings: Rs.' + String((this.financialData.monthlySavings/1000).toFixed(0)) + 'k', 20, yPosition);
    yPosition += 10;
    doc.text('Current Savings: Rs.' + String((this.financialData.currentSavings/100000).toFixed(1)) + 'L', 20, yPosition);
    yPosition += 10;
    doc.text('Savings Rate: ' + String(this.insights.cashFlow.savingsRate.toFixed(0)) + '%', 20, yPosition);
    yPosition += 10;
    doc.text('Risk Level: ' + String(this.insights.risks.status || 'LOW RISK'), 20, yPosition);
    yPosition += 20;
    
    // Goals Analysis
    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text('GOALS ANALYSIS', 20, yPosition);
    yPosition += 20;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const goals = [
      { name: 'Emergency Fund', data: this.insights.goals.emergencyGoal },
      { name: 'House Down Payment', data: this.insights.goals.houseGoal },
      { name: 'Child Education', data: this.insights.goals.educationGoal }
    ];
    
    goals.forEach(goal => {
      const progress = ((goal.data.current / goal.data.target) * 100).toFixed(0);
      doc.text(String(goal.name) + ':', 20, yPosition);
      yPosition += 8;
      doc.text('  Target: Rs.' + String((goal.data.target/100000).toFixed(1)) + 'L', 30, yPosition);
      yPosition += 8;
      doc.text('  Progress: ' + progress + '%', 30, yPosition);
      yPosition += 12;
    });
    
    // Save the PDF
    doc.save('Professional_Financial_Analysis.pdf');
  }

  /**
   * 🎯 Generate Visual Journey Report
   */
  generateVisualJourneyReport() {
    const doc = this.initializePDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('Financial Journey Timeline Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Generated on: ' + this.reportDate, 20, 45);
    
    let yPosition = 60;
    
    // Timeline milestones
    const milestones = [
      { age: 35, event: 'House Purchase', amount: 'Rs.15L down payment' },
      { age: 45, event: 'Child Education', amount: 'Rs.25L education fund' },
      { age: 60, event: 'Retirement', amount: 'Rs.2Cr retirement corpus' }
    ];
    
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text('FINANCIAL TIMELINE', 20, yPosition);
    yPosition += 20;
    
    milestones.forEach((milestone, index) => {
      doc.setFontSize(14);
      doc.setTextColor(76, 175, 80);
      doc.text('Age ' + String(milestone.age) + ': ' + String(milestone.event), 20, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Target: ' + String(milestone.amount), 30, yPosition);
      yPosition += 15;
    });
    
    // Current status
    yPosition += 10;
    doc.setFontSize(16);
    doc.setTextColor(255, 152, 0);
    doc.text('CURRENT STATUS', 20, yPosition);
    yPosition += 20;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Current Age: ' + String(this.financialData.currentAge), 20, yPosition);
    yPosition += 10;
    doc.text('Years to Retirement: ' + String(this.insights.retirement.yearsLeft || 30), 20, yPosition);
    yPosition += 10;
    doc.text('Monthly Savings: Rs.' + String((this.financialData.monthlySavings/1000).toFixed(0)) + 'k', 20, yPosition);
    yPosition += 10;
    doc.text('Retirement Progress: ' + String(this.insights.retirement.progressPercentage.toFixed(0)) + '%', 20, yPosition);
    
    // Save the PDF
    doc.save('Financial_Journey_Timeline.pdf');
  }

  /**
   * 💡 Generate Quick Answers Report
   */
  generateQuickAnswersReport() {
    const doc = this.initializePDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('Quick Financial Answers Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Generated on: ' + this.reportDate, 20, 45);
    
    let yPosition = 60;
    
    // Q&A Format
    const questions = [
      {
        q: "Will I have enough for retirement?",
        a: String(this.insights.retirement.status || 'NEED MORE') + ' - You are projected to have Rs.' + String((this.insights.retirement.projectedAmount/10000000).toFixed(1)) + ' Crores by retirement.'
      },
      {
        q: "Are my goals on track?",
        a: String(this.insights.goals.status || 'BEHIND SCHEDULE') + ' - ' + String(this.insights.goals.recommendation || 'Focus on building your emergency fund first')
      },
      {
        q: "What are my biggest risks?",
        a: String(this.insights.risks.status || 'LOW RISK') + ' - Market: ' + String(this.insights.risks.marketRisk || 'MEDIUM') + ', Inflation: ' + String(this.insights.risks.inflationRisk || 'LOW') + ', Emergency: ' + String(this.insights.risks.emergencyRisk || 'LOW')
      },
      {
        q: "Is my money working efficiently?",
        a: String(this.insights.cashFlow.status || 'EXCELLENT') + ' - You are saving ' + String(this.insights.cashFlow.savingsRate.toFixed(0)) + '% of income (target: 30%)'
      }
    ];
    
    questions.forEach((item, index) => {
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243);
      doc.text('Q' + String(index + 1) + ': ' + String(item.q), 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize('A: ' + String(item.a), 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 7 + 15;
    });
    
    // Save the PDF
    doc.save('Quick_Financial_Answers.pdf');
  }

  /**
   * 📈 Generate Excel Report
   */
  generateExcelReport() {
    // Create CSV content for Excel compatibility
    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Financial_Analysis_Data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 📄 Generate CSV Content
   */
  generateCSVContent() {
    const headers = ['Metric', 'Value', 'Status', 'Target', 'Progress'];
    const rows = [
      ['Monthly Income', this.financialData.monthlyIncome, '', '', ''],
      ['Monthly Expenses', this.financialData.monthlyExpenses, '', '', ''],
      ['Monthly Savings', this.financialData.monthlySavings, '', '', ''],
      ['Current Savings', this.financialData.currentSavings, '', '', ''],
      ['Savings Rate', String(this.insights.cashFlow.savingsRate.toFixed(1)) + '%', this.insights.cashFlow.status, '30%', ''],
      ['Retirement Corpus', this.insights.retirement.projectedAmount, this.insights.retirement.status, this.insights.retirement.targetAmount, String(this.insights.retirement.progressPercentage.toFixed(1)) + '%'],
      ['Emergency Fund', this.insights.goals.emergencyGoal.current, '', this.insights.goals.emergencyGoal.target, String(((this.insights.goals.emergencyGoal.current/this.insights.goals.emergencyGoal.target)*100).toFixed(1)) + '%'],
      ['House Fund', this.insights.goals.houseGoal.current, '', this.insights.goals.houseGoal.target, String(((this.insights.goals.houseGoal.current/this.insights.goals.houseGoal.target)*100).toFixed(1)) + '%'],
      ['Education Fund', this.insights.goals.educationGoal.current, '', this.insights.goals.educationGoal.target, String(((this.insights.goals.educationGoal.current/this.insights.goals.educationGoal.target)*100).toFixed(1)) + '%'],
      ['Market Risk', '', this.insights.risks.marketRisk, 'LOW', ''],
      ['Inflation Risk', '', this.insights.risks.inflationRisk, 'LOW', ''],
      ['Emergency Risk', '', this.insights.risks.emergencyRisk, 'LOW', '']
    ];
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => '"' + String(field) + '"').join(','))
      .join('\n');
    
    return csvContent;
  }

  /**
   * 🔄 Generate JSON Report
   */
  generateJSONReport() {
    const reportData = {
      reportType: 'Complete Financial Analysis',
      generatedOn: this.reportDate,
      financialData: this.financialData,
      insights: this.insights,
      summary: {
        overallStatus: this.insights.risks.status,
        retirementReadiness: this.insights.retirement.progressPercentage,
        goalsOnTrack: Object.values(this.insights.goals).filter(goal => 
          goal.current && goal.target && (goal.current / goal.target) > 0.5
        ).length - 2, // Subtract question and status properties
        savingsEfficiency: this.insights.cashFlow.savingsRate
      }
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Financial_Analysis_Complete.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * 🎯 Simple Download Handler Function
 */
export const handleSimpleReportDownload = (reportType, financialData, calculatedInsights) => {
  const generator = new SimpleFinancialReportGenerator(financialData, calculatedInsights);
  
  switch (reportType) {
    case 'crystal-clear':
      generator.generateCrystalClearReport();
      break;
    case 'professional':
      generator.generateProfessionalReport();
      break;
    case 'visual-journey':
      generator.generateVisualJourneyReport();
      break;
    case 'quick-answers':
      generator.generateQuickAnswersReport();
      break;
    case 'excel':
      generator.generateExcelReport();
      break;
    case 'json':
      generator.generateJSONReport();
      break;
    default:
      generator.generateCrystalClearReport();
  }
};

export default SimpleFinancialReportGenerator;
