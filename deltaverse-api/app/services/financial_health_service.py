from typing import Dict, List
import datetime
import logging
import os
import importlib.util

# Import models directly to avoid import chain issues
def import_module_directly(module_name, file_path):
    """Import a module directly from file path to avoid import chain issues"""
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# Get the base app directory
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Import models directly
models_path = os.path.join(app_dir, "models", "financial_health.py")
models_module = import_module_directly("financial_health_models", models_path)
FinancialHealthScore = models_module.FinancialHealthScore
ScoreComponent = models_module.ScoreComponent
Recommendation = models_module.Recommendation

logger = logging.getLogger(__name__)

class FinancialHealthService:
    def calculate_health_score(self, financial_data: Dict) -> FinancialHealthScore:
        """
        Calculate financial health score based on various components
        """
        try:
            components = []
            recommendations = []
            
            # Calculate Savings Rate component
            savings_rate = self._calculate_savings_rate(financial_data)
            components.append(savings_rate)
            
            # Calculate Debt Ratio component
            debt_ratio = self._calculate_debt_ratio(financial_data)
            components.append(debt_ratio)
            
            # Calculate Investment Diversification component
            investment_div = self._calculate_investment_diversification(financial_data)
            components.append(investment_div)
            
            # Calculate Emergency Fund component
            emergency_fund = self._calculate_emergency_fund(financial_data)
            components.append(emergency_fund)
            
            # Calculate Credit Health component
            credit_health = self._calculate_credit_health(financial_data)
            components.append(credit_health)
            
            # Generate recommendations based on components
            for component in components:
                # Generate recommendations for all components (not just those below 70)
                recs = self._generate_recommendations_for_component(component, financial_data)
                recommendations.extend(recs)
            
            # Calculate overall score (weighted average)
            overall_score = sum(c.score * c.weight for c in components)
            
            # Get historical scores (placeholder - would come from database in real implementation)
            historical_scores = self._get_historical_scores(financial_data.get("user_id", ""))
            
            return FinancialHealthScore(
                overall_score=overall_score,
                components=components,
                recommendations=recommendations,
                last_updated=datetime.datetime.now().isoformat(),
                historical_scores=historical_scores
            )
        except Exception as e:
            logger.error(f"Error calculating health score: {str(e)}")
            # Return a default score in case of errors to prevent breaking the application
            return self._get_default_health_score()
    
    def _calculate_savings_rate(self, financial_data: Dict) -> ScoreComponent:
        try:
            # Extract income and savings data
            income = self._get_nested_value(financial_data, "income.monthly_average", 0)
            savings = self._get_nested_value(financial_data, "savings.monthly_average", 0)
            
            # Calculate savings rate
            savings_rate = (savings / income * 100) if income > 0 else 0
            
            # Score based on savings rate
            if savings_rate >= 30:
                score = 100
                status = "excellent"
            elif savings_rate >= 20:
                score = 85
                status = "good"
            elif savings_rate >= 15:
                score = 70
                status = "fair"
            elif savings_rate >= 10:
                score = 50
                status = "poor"
            else:
                score = 30
                status = "critical"
                
            return ScoreComponent(
                name="Savings Rate",
                score=score,
                weight=0.25,
                description="Percentage of income saved each month",
                status=status,
                data_points={"savings_rate": savings_rate, "monthly_income": income, "monthly_savings": savings}
            )
        except Exception as e:
            logger.error(f"Error calculating savings rate: {str(e)}")
            return ScoreComponent(
                name="Savings Rate",
                score=50,
                weight=0.25,
                description="Percentage of income saved each month",
                status="unknown",
                data_points={}
            )
    
    def _calculate_debt_ratio(self, financial_data: Dict) -> ScoreComponent:
        try:
            # Extract debt and income data
            total_debt = self._get_nested_value(financial_data, "liabilities.total", 0)
            annual_income = self._get_nested_value(financial_data, "income.annual", 0)
            
            # Calculate debt-to-income ratio
            debt_ratio = (total_debt / annual_income) if annual_income > 0 else 0
            
            # Score based on debt ratio
            if debt_ratio <= 0.1:
                score = 100
                status = "excellent"
            elif debt_ratio <= 0.3:
                score = 85
                status = "good"
            elif debt_ratio <= 0.4:
                score = 70
                status = "fair"
            elif debt_ratio <= 0.5:
                score = 50
                status = "poor"
            else:
                score = 30
                status = "critical"
                
            return ScoreComponent(
                name="Debt Ratio",
                score=score,
                weight=0.2,
                description="Ratio of total debt to annual income",
                status=status,
                data_points={"debt_ratio": debt_ratio, "total_debt": total_debt, "annual_income": annual_income}
            )
        except Exception as e:
            logger.error(f"Error calculating debt ratio: {str(e)}")
            return ScoreComponent(
                name="Debt Ratio",
                score=50,
                weight=0.2,
                description="Ratio of total debt to annual income",
                status="unknown",
                data_points={}
            )
    
    def _calculate_investment_diversification(self, financial_data: Dict) -> ScoreComponent:
        try:
            # Extract investment data
            investments = self._get_nested_value(financial_data, "investments.portfolio", [])
            
            # Calculate diversification metrics
            asset_classes = set()
            total_investment = 0
            largest_allocation = 0
            
            for investment in investments:
                asset_class = investment.get("asset_class", "unknown")
                amount = investment.get("amount", 0)
                
                asset_classes.add(asset_class)
                total_investment += amount
                largest_allocation = max(largest_allocation, amount)
            
            # Calculate diversification score
            num_asset_classes = len(asset_classes)
            concentration_ratio = largest_allocation / total_investment if total_investment > 0 else 1
            
            # Score based on diversification
            if num_asset_classes >= 5 and concentration_ratio < 0.3:
                score = 100
                status = "excellent"
            elif num_asset_classes >= 4 and concentration_ratio < 0.4:
                score = 85
                status = "good"
            elif num_asset_classes >= 3 and concentration_ratio < 0.5:
                score = 70
                status = "fair"
            elif num_asset_classes >= 2:
                score = 50
                status = "poor"
            else:
                score = 30
                status = "critical"
                
            return ScoreComponent(
                name="Investment Diversification",
                score=score,
                weight=0.2,
                description="Diversity and balance of investment portfolio",
                status=status,
                data_points={
                    "asset_classes": num_asset_classes,
                    "concentration_ratio": concentration_ratio,
                    "total_investment": total_investment
                }
            )
        except Exception as e:
            logger.error(f"Error calculating investment diversification: {str(e)}")
            return ScoreComponent(
                name="Investment Diversification",
                score=50,
                weight=0.2,
                description="Diversity and balance of investment portfolio",
                status="unknown",
                data_points={}
            )
    
    def _calculate_emergency_fund(self, financial_data: Dict) -> ScoreComponent:
        try:
            # Extract emergency fund and monthly expenses
            emergency_fund = self._get_nested_value(financial_data, "savings.emergency_fund", 0)
            monthly_expenses = self._get_nested_value(financial_data, "expenses.monthly_average", 0)
            
            # Calculate months of expenses covered
            months_covered = emergency_fund / monthly_expenses if monthly_expenses > 0 else 0
            
            # Score based on emergency fund
            if months_covered >= 6:
                score = 100
                status = "excellent"
            elif months_covered >= 4:
                score = 85
                status = "good"
            elif months_covered >= 3:
                score = 70
                status = "fair"
            elif months_covered >= 1:
                score = 50
                status = "poor"
            else:
                score = 30
                status = "critical"
                
            return ScoreComponent(
                name="Emergency Fund",
                score=score,
                weight=0.15,
                description="Months of expenses covered by emergency savings",
                status=status,
                data_points={"months_covered": months_covered, "emergency_fund": emergency_fund, "monthly_expenses": monthly_expenses}
            )
        except Exception as e:
            logger.error(f"Error calculating emergency fund: {str(e)}")
            return ScoreComponent(
                name="Emergency Fund",
                score=50,
                weight=0.15,
                description="Months of expenses covered by emergency savings",
                status="unknown",
                data_points={}
            )
    
    def _calculate_credit_health(self, financial_data: Dict) -> ScoreComponent:
        try:
            # Extract credit score
            credit_score = self._get_nested_value(financial_data, "credit.score", 0)
            
            # Score based on credit score
            if credit_score >= 750:
                score = 100
                status = "excellent"
            elif credit_score >= 700:
                score = 85
                status = "good"
            elif credit_score >= 650:
                score = 70
                status = "fair"
            elif credit_score >= 600:
                score = 50
                status = "poor"
            else:
                score = 30
                status = "critical"
                
            return ScoreComponent(
                name="Credit Health",
                score=score,
                weight=0.2,
                description="Credit score and overall credit health",
                status=status,
                data_points={"credit_score": credit_score}
            )
        except Exception as e:
            logger.error(f"Error calculating credit health: {str(e)}")
            return ScoreComponent(
                name="Credit Health",
                score=50,
                weight=0.2,
                description="Credit score and overall credit health",
                status="unknown",
                data_points={}
            )
    
    def _generate_recommendations_for_component(self, component: ScoreComponent, financial_data: Dict) -> List[Recommendation]:
        recommendations = []
        
        try:
            if component.name == "Savings Rate":
                if component.score < 70:
                    # Critical/Poor savings rate
                    recommendations.append(
                        Recommendation(
                            title="Increase Your Savings Rate",
                            description="Your current savings rate is below the recommended 15%. Consider setting up automatic transfers to a savings account.",
                            impact="high",
                            difficulty="moderate",
                            potential_improvement=15.0,
                            action_steps=[
                                "Set up automatic transfer of 5% more of your income to savings",
                                "Review discretionary expenses for potential reductions",
                                "Consider a side income source to boost savings"
                            ],
                            category="Savings Rate"
                        )
                    )
                elif component.score < 85:
                    # Good but can be optimized
                    recommendations.append(
                        Recommendation(
                            title="Optimize Your Savings Strategy",
                            description="Your savings rate is good, but there's room for improvement. Consider increasing it to 25% for faster wealth building.",
                            impact="medium",
                            difficulty="easy",
                            potential_improvement=8.0,
                            action_steps=[
                                "Increase automatic savings by 2-3% of income",
                                "Explore high-yield savings accounts",
                                "Consider tax-advantaged savings options"
                            ],
                            category="Savings Rate"
                        )
                    )
                else:
                    # Excellent - provide advanced strategies
                    recommendations.append(
                        Recommendation(
                            title="Advanced Wealth Building Strategies",
                            description="Excellent savings rate! Consider advanced strategies like tax-loss harvesting and asset allocation optimization.",
                            impact="medium",
                            difficulty="challenging",
                            potential_improvement=5.0,
                            action_steps=[
                                "Explore tax-loss harvesting opportunities",
                                "Consider rebalancing your portfolio quarterly",
                                "Look into tax-advantaged investment accounts"
                            ],
                            category="Savings Rate"
                        )
                    )
            
            elif component.name == "Debt Ratio":
                if component.score < 70:
                    # High debt ratio
                    recommendations.append(
                        Recommendation(
                            title="Reduce Your Debt-to-Income Ratio",
                            description="Your debt-to-income ratio is higher than recommended. Focus on paying down high-interest debt first.",
                            impact="high",
                            difficulty="challenging",
                            potential_improvement=20.0,
                            action_steps=[
                                "Create a debt repayment plan focusing on high-interest debt first",
                                "Consider debt consolidation to lower interest rates",
                                "Avoid taking on new debt while paying down existing obligations"
                            ],
                            category="Debt Ratio"
                        )
                    )
                elif component.score < 85:
                    # Moderate debt - optimization opportunity
                    recommendations.append(
                        Recommendation(
                            title="Optimize Your Debt Management",
                            description="Your debt ratio is manageable, but consider strategies to pay it down faster and save on interest.",
                            impact="medium",
                            difficulty="moderate",
                            potential_improvement=10.0,
                            action_steps=[
                                "Make extra payments toward principal",
                                "Consider refinancing at lower rates",
                                "Set up bi-weekly payments to reduce interest"
                            ],
                            category="Debt Ratio"
                        )
                    )
                else:
                    # Low debt - maintain and optimize
                    recommendations.append(
                        Recommendation(
                            title="Maintain Your Excellent Debt Management",
                            description="Great job keeping debt low! Focus on maintaining this while optimizing your credit utilization.",
                            impact="low",
                            difficulty="easy",
                            potential_improvement=3.0,
                            action_steps=[
                                "Keep credit utilization below 10%",
                                "Consider paying off remaining debt early",
                                "Use credit strategically for rewards"
                            ],
                            category="Debt Ratio"
                        )
                    )
            
            elif component.name == "Investment Diversification":
                if component.score < 70:
                    recommendations.append(
                        Recommendation(
                            title="Diversify Your Investment Portfolio",
                            description="Your investments are concentrated in too few asset classes. Consider diversifying to reduce risk.",
                            impact="high",
                            difficulty="moderate",
                            potential_improvement=18.0,
                            action_steps=[
                                "Spread investments across different asset classes",
                                "Consider index funds for instant diversification",
                                "Review and rebalance portfolio quarterly"
                            ],
                            category="Investment Diversification"
                        )
                    )
                elif component.score < 85:
                    recommendations.append(
                        Recommendation(
                            title="Enhance Portfolio Diversification",
                            description="Good diversification foundation. Consider adding international exposure and alternative investments.",
                            impact="medium",
                            difficulty="moderate",
                            potential_improvement=8.0,
                            action_steps=[
                                "Add international market exposure",
                                "Consider REITs or commodities",
                                "Review sector allocation balance"
                            ],
                            category="Investment Diversification"
                        )
                    )
                else:
                    recommendations.append(
                        Recommendation(
                            title="Advanced Portfolio Optimization",
                            description="Excellent diversification! Consider advanced strategies like factor investing and tactical allocation.",
                            impact="medium",
                            difficulty="challenging",
                            potential_improvement=5.0,
                            action_steps=[
                                "Explore factor-based investing (value, growth, momentum)",
                                "Consider tactical asset allocation adjustments",
                                "Review correlation between holdings"
                            ],
                            category="Investment Diversification"
                        )
                    )
            
            elif component.name == "Emergency Fund":
                if component.score < 70:
                    recommendations.append(
                        Recommendation(
                            title="Build Your Emergency Fund",
                            description="Your emergency fund covers less than 3 months of expenses. Aim for 3-6 months of coverage.",
                            impact="high",
                            difficulty="moderate",
                            potential_improvement=25.0,
                            action_steps=[
                                "Set up automatic transfers to emergency fund",
                                "Start with a goal of 1 month expenses, then build up",
                                "Keep emergency fund in high-yield savings account"
                            ],
                            category="Emergency Fund"
                        )
                    )
                elif component.score < 85:
                    recommendations.append(
                        Recommendation(
                            title="Optimize Your Emergency Fund",
                            description="Good emergency fund foundation. Consider optimizing the amount and where it's stored.",
                            impact="medium",
                            difficulty="easy",
                            potential_improvement=8.0,
                            action_steps=[
                                "Aim for 6 months of expenses coverage",
                                "Use high-yield savings or money market account",
                                "Consider laddered CDs for part of the fund"
                            ],
                            category="Emergency Fund"
                        )
                    )
                else:
                    recommendations.append(
                        Recommendation(
                            title="Emergency Fund Excellence",
                            description="Perfect emergency fund! Consider strategies to make it work harder while maintaining liquidity.",
                            impact="low",
                            difficulty="easy",
                            potential_improvement=3.0,
                            action_steps=[
                                "Explore high-yield savings options",
                                "Consider I-bonds for inflation protection",
                                "Review and adjust for lifestyle changes"
                            ],
                            category="Emergency Fund"
                        )
                    )
            
            elif component.name == "Credit Health":
                if component.score < 70:
                    recommendations.append(
                        Recommendation(
                            title="Improve Your Credit Score",
                            description="Your credit score could use improvement. Focus on payment history and credit utilization.",
                            impact="high",
                            difficulty="moderate",
                            potential_improvement=15.0,
                            action_steps=[
                                "Pay all bills on time, every time",
                                "Keep credit utilization below 30%",
                                "Don't close old credit accounts"
                            ],
                            category="Credit Health"
                        )
                    )
                elif component.score < 85:
                    recommendations.append(
                        Recommendation(
                            title="Optimize Your Credit Profile",
                            description="Good credit score! Fine-tune your credit utilization and consider strategic credit building.",
                            impact="medium",
                            difficulty="easy",
                            potential_improvement=8.0,
                            action_steps=[
                                "Keep credit utilization below 10%",
                                "Consider requesting credit limit increases",
                                "Monitor credit report regularly"
                            ],
                            category="Credit Health"
                        )
                    )
                else:
                    recommendations.append(
                        Recommendation(
                            title="Maintain Excellent Credit",
                            description="Outstanding credit score! Focus on maintaining it and leveraging it for better rates.",
                            impact="low",
                            difficulty="easy",
                            potential_improvement=2.0,
                            action_steps=[
                                "Continue excellent payment habits",
                                "Use credit for rewards and benefits",
                                "Negotiate better rates on existing loans"
                            ],
                            category="Credit Health"
                        )
                    )
                
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
        
        return recommendations
    
    def _get_historical_scores(self, user_id: str) -> Dict[str, float]:
        # In a real implementation, this would fetch historical scores from a database
        # For now, return placeholder data
        today = datetime.datetime.now()
        return {
            (today - datetime.timedelta(days=90)).strftime("%Y-%m-%d"): 60.0,
            (today - datetime.timedelta(days=60)).strftime("%Y-%m-%d"): 62.5,
            (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d"): 65.0,
            today.strftime("%Y-%m-%d"): 67.5,
        }
    
    def _get_default_health_score(self) -> FinancialHealthScore:
        """Return a default health score in case of errors"""
        components = [
            ScoreComponent(
                name="Savings Rate",
                score=50,
                weight=0.25,
                description="Percentage of income saved each month",
                status="unknown",
                data_points={}
            ),
            ScoreComponent(
                name="Debt Ratio",
                score=50,
                weight=0.2,
                description="Ratio of total debt to annual income",
                status="unknown",
                data_points={}
            ),
            ScoreComponent(
                name="Investment Diversification",
                score=50,
                weight=0.2,
                description="Diversity and balance of investment portfolio",
                status="unknown",
                data_points={}
            ),
            ScoreComponent(
                name="Emergency Fund",
                score=50,
                weight=0.15,
                description="Months of expenses covered by emergency savings",
                status="unknown",
                data_points={}
            ),
            ScoreComponent(
                name="Credit Health",
                score=50,
                weight=0.2,
                description="Credit score and overall credit health",
                status="unknown",
                data_points={}
            )
        ]
        
        return FinancialHealthScore(
            overall_score=50.0,
            components=components,
            recommendations=[],
            last_updated=datetime.datetime.now().isoformat(),
            historical_scores={}
        )
    
    def _get_nested_value(self, data: Dict, path: str, default=None):
        """Safely get a nested value from a dictionary using dot notation"""
        keys = path.split('.')
        value = data
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
                
        return value
