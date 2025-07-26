/**
 * 📊 FINANCIAL REPORT GENERATOR
 * Professional report generation for all Financial Analysis modes
 * Supports PDF, Excel, and JSON formats
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export class FinancialReportGenerator {
  constructor(financialData, calculatedInsights) {
    this.financialData = financialData;
    this.insights = calculatedInsights;
    this.reportDate = new Date().toLocaleDateString();
  }

  /**
   * 💎 Generate Crystal Clear Insights Report
   */
  generateCrystalClearReport() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('💎 Crystal Clear Financial Insights Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${this.reportDate}`, 20, 45);
    
    let yPosition = 60;
    
    // 1. Retirement Analysis
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text('1. RETIREMENT READINESS', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Question: ${this.insights.retirement.question}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Status: ${this.insights.retirement.status}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Projected Amount: ₹${(this.insights.retirement.projectedAmount/10000000).toFixed(1)} Crores`, 20, yPosition);
    yPosition += 10;
    doc.text(`Progress: ${this.insights.retirement.progressPercentage.toFixed(0)}% of target`, 20, yPosition);
    yPosition += 10;
    doc.text(`Recommendation: ${this.insights.retirement.recommendation}`, 20, yPosition);
    yPosition += 20;
    
    // 2. Goals Analysis
    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text('2. LIFE GOALS PROGRESS', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Status: ${this.insights.goals.status}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Recommendation: ${this.insights.goals.recommendation}`, 20, yPosition);
    yPosition += 15;
    
    // Goals breakdown
    const goals = [this.insights.goals.emergencyGoal, this.insights.goals.houseGoal, this.insights.goals.educationGoal];
    goals.forEach((goal, index) => {
      const progress = ((goal.current / goal.target) * 100).toFixed(0);
      doc.text(`${goal.name}: ${progress}% complete`, 30, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
    
    // 3. Risk Analysis
    doc.setFontSize(16);
    doc.setTextColor(255, 152, 0);
    doc.text('3. FINANCIAL RISKS', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Overall Risk: ${this.insights.risks.status}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Market Risk: ${this.insights.risks.marketRisk}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Inflation Risk: ${this.insights.risks.inflationRisk}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Emergency Risk: ${this.insights.risks.emergencyRisk}`, 30, yPosition);
    yPosition += 15;
    
    // 4. Money Efficiency
    doc.setFontSize(16);
    doc.setTextColor(156, 39, 176);
    doc.text('4. MONEY EFFICIENCY', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Status: ${this.insights.cashFlow.status}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Savings Rate: ${this.insights.cashFlow.savingsRate.toFixed(0)}% (Target: 30%)`, 20, yPosition);
    yPosition += 10;
    doc.text(`Monthly Savings: ₹${(this.financialData.monthlySavings/1000).toFixed(0)}k`, 20, yPosition);
    yPosition += 10;
    doc.text(`Gap to Ideal: ₹${(this.insights.cashFlow.monthlyGap/1000).toFixed(0)}k`, 20, yPosition);
    
    // Save the PDF
    doc.save('Crystal_Clear_Financial_Insights.pdf');
  }

  /**
   * 📊 Generate Professional Analysis Report
   */
  generateProfessionalReport() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('📊 Professional Financial Analysis Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${this.reportDate}`, 20, 45);
    
    let yPosition = 60;
    
    // Financial Summary Table
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text('FINANCIAL SUMMARY', 20, yPosition);
    yPosition += 20;
    
    const summaryData = [
      ['Monthly Income', `₹${(this.financialData.monthlyIncome/1000).toFixed(0)}k`],
      ['Monthly Expenses', `₹${(this.financialData.monthlyExpenses/1000).toFixed(0)}k`],
      ['Monthly Savings', `₹${(this.financialData.monthlySavings/1000).toFixed(0)}k`],
      ['Current Savings', `₹${(this.financialData.currentSavings/100000).toFixed(1)}L`],
      ['Savings Rate', `${this.insights.cashFlow.savingsRate.toFixed(0)}%`],
      ['Risk Level', this.insights.risks.status]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243] }
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
    
    // Goals Analysis Table
    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text('GOALS ANALYSIS', 20, yPosition);
    yPosition += 20;
    
    const goalsData = [
      ['Emergency Fund', `₹${(this.insights.goals.emergencyGoal.target/100000).toFixed(1)}L`, `${((this.insights.goals.emergencyGoal.current/this.insights.goals.emergencyGoal.target)*100).toFixed(0)}%`],
      ['House Down Payment', `₹${(this.insights.goals.houseGoal.target/100000).toFixed(1)}L`, `${((this.insights.goals.houseGoal.current/this.insights.goals.houseGoal.target)*100).toFixed(0)}%`],
      ['Child Education', `₹${(this.insights.goals.educationGoal.target/100000).toFixed(1)}L`, `${((this.insights.goals.educationGoal.current/this.insights.goals.educationGoal.target)*100).toFixed(0)}%`]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Goal', 'Target', 'Progress']],
      body: goalsData,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80] }
    });
    
    // Save the PDF
    doc.save('Professional_Financial_Analysis.pdf');
  }

  /**
   * 🎯 Generate Visual Journey Report
   */
  generateVisualJourneyReport() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('🎯 Financial Journey Timeline Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${this.reportDate}`, 20, 45);
    
    let yPosition = 60;
    
    // Timeline milestones
    const milestones = [
      { age: 35, event: 'House Purchase', amount: '₹15L down payment' },
      { age: 45, event: 'Child Education', amount: '₹25L education fund' },
      { age: 60, event: 'Retirement', amount: '₹2Cr retirement corpus' }
    ];
    
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text('FINANCIAL TIMELINE', 20, yPosition);
    yPosition += 20;
    
    milestones.forEach((milestone, index) => {
      doc.setFontSize(14);
      doc.setTextColor(76, 175, 80);
      doc.text(`Age ${milestone.age}: ${milestone.event}`, 20, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Target: ${milestone.amount}`, 30, yPosition);
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
    doc.text(`Current Age: ${this.financialData.currentAge}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Years to Retirement: ${this.insights.retirement.yearsLeft}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Monthly Savings: ₹${(this.financialData.monthlySavings/1000).toFixed(0)}k`, 20, yPosition);
    yPosition += 10;
    doc.text(`Retirement Progress: ${this.insights.retirement.progressPercentage.toFixed(0)}%`, 20, yPosition);
    
    // Save the PDF
    doc.save('Financial_Journey_Timeline.pdf');
  }

  /**
   * 💡 Generate Quick Answers Report
   */
  generateQuickAnswersReport() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('💡 Quick Financial Answers Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${this.reportDate}`, 20, 45);
    
    let yPosition = 60;
    
    // Q&A Format
    const questions = [
      {
        q: "Will I have enough for retirement?",
        a: `${this.insights.retirement.status} - You're projected to have ₹${(this.insights.retirement.projectedAmount/10000000).toFixed(1)} Crores by retirement.`
      },
      {
        q: "Are my goals on track?",
        a: `${this.insights.goals.status} - ${this.insights.goals.recommendation}`
      },
      {
        q: "What are my biggest risks?",
        a: `${this.insights.risks.status} - Market: ${this.insights.risks.marketRisk}, Inflation: ${this.insights.risks.inflationRisk}, Emergency: ${this.insights.risks.emergencyRisk}`
      },
      {
        q: "Is my money working efficiently?",
        a: `${this.insights.cashFlow.status} - You're saving ${this.insights.cashFlow.savingsRate.toFixed(0)}% of income (target: 30%)`
      }
    ];
    
    questions.forEach((item, index) => {
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243);
      doc.text(`Q${index + 1}: ${item.q}`, 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(`A: ${item.a}`, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 7 + 10;
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
      ['Savings Rate', `${this.insights.cashFlow.savingsRate.toFixed(1)}%`, this.insights.cashFlow.status, '30%', ''],
      ['Retirement Corpus', this.insights.retirement.projectedAmount, this.insights.retirement.status, this.insights.retirement.targetAmount, `${this.insights.retirement.progressPercentage.toFixed(1)}%`],
      ['Emergency Fund', this.insights.goals.emergencyGoal.current, '', this.insights.goals.emergencyGoal.target, `${((this.insights.goals.emergencyGoal.current/this.insights.goals.emergencyGoal.target)*100).toFixed(1)}%`],
      ['House Fund', this.insights.goals.houseGoal.current, '', this.insights.goals.houseGoal.target, `${((this.insights.goals.houseGoal.current/this.insights.goals.houseGoal.target)*100).toFixed(1)}%`],
      ['Education Fund', this.insights.goals.educationGoal.current, '', this.insights.goals.educationGoal.target, `${((this.insights.goals.educationGoal.current/this.insights.goals.educationGoal.target)*100).toFixed(1)}%`],
      ['Market Risk', '', this.insights.risks.marketRisk, 'LOW', ''],
      ['Inflation Risk', '', this.insights.risks.inflationRisk, 'LOW', ''],
      ['Emergency Risk', '', this.insights.risks.emergencyRisk, 'LOW', '']
    ];
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
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
 * 🎯 Download Handler Function
 */
export const handleReportDownload = (reportType, financialData, calculatedInsights) => {
  const generator = new FinancialReportGenerator(financialData, calculatedInsights);
  
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

export default FinancialReportGenerator;
