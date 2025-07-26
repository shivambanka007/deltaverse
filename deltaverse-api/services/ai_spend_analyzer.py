"""
AI Spend Analyzer Service
Provides intelligent analysis of spending patterns using rule-based AI and pattern recognition
"""

import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from collections import defaultdict, Counter
import statistics

class AISpendAnalyzer:
    """AI-powered spend analysis engine"""
    
    def __init__(self):
        # AI categorization patterns
        self.category_patterns = {
            "CATEGORY_FOOD": {
                "keywords": ["restaurant", "food", "grocery", "cafe", "pizza", "swiggy", "zomato", "dominos", "mcdonald", "kfc", "subway", "starbucks", "dunkin"],
                "patterns": [r".*food.*", r".*restaurant.*", r".*cafe.*", r".*pizza.*"],
                "merchant_indicators": ["swiggy", "zomato", "uber eats", "food panda"]
            },
            "CATEGORY_TRANSPORTATION": {
                "keywords": ["fuel", "petrol", "uber", "ola", "metro", "bus", "taxi", "rapido", "auto", "parking"],
                "patterns": [r".*fuel.*", r".*petrol.*", r".*taxi.*", r".*uber.*"],
                "merchant_indicators": ["uber", "ola", "rapido", "indian oil", "bharat petroleum"]
            },
            "CATEGORY_UTILITIES": {
                "keywords": ["electricity", "water", "internet", "mobile", "phone", "broadband", "wifi", "airtel", "jio", "vodafone"],
                "patterns": [r".*electric.*", r".*water.*", r".*internet.*", r".*mobile.*"],
                "merchant_indicators": ["airtel", "jio", "vodafone", "bsnl", "tata power"]
            },
            "CATEGORY_ENTERTAINMENT": {
                "keywords": ["netflix", "amazon prime", "spotify", "movie", "cinema", "hotstar", "youtube", "gaming", "bookmyshow"],
                "patterns": [r".*netflix.*", r".*prime.*", r".*movie.*", r".*cinema.*"],
                "merchant_indicators": ["netflix", "amazon prime", "spotify", "bookmyshow", "pvr"]
            },
            "CATEGORY_SHOPPING": {
                "keywords": ["amazon", "flipkart", "mall", "store", "shopping", "myntra", "ajio", "nykaa", "purchase"],
                "patterns": [r".*amazon.*", r".*flipkart.*", r".*shopping.*", r".*store.*"],
                "merchant_indicators": ["amazon", "flipkart", "myntra", "ajio", "nykaa"]
            }
        }
        
        # AI insight thresholds (configurable)
        self.thresholds = {
            "high_spending_category": 0.30,  # 30% of total spending
            "unusual_transaction": 3.0,      # 3x average transaction
            "frequent_small_purchases": 10,   # 10+ transactions under ₹500
            "weekend_spending_spike": 1.5,   # 1.5x weekday average
            "subscription_detection": 0.95,  # 95% amount similarity
        }

    def analyze_spending_patterns(self, transactions: List[Dict]) -> Dict[str, Any]:
        """Main AI analysis function"""
        if not transactions:
            return self._empty_analysis()
        
        # Categorize transactions using AI
        categorized = self._ai_categorize_transactions(transactions)
        
        # Generate insights using AI
        insights = self._generate_ai_insights(categorized)
        
        # Detect patterns
        patterns = self._detect_spending_patterns(categorized)
        
        # Calculate metrics
        metrics = self._calculate_ai_metrics(categorized)
        
        return {
            "categorized_transactions": categorized,
            "insights": insights,
            "patterns": patterns,
            "metrics": metrics,
            "ai_confidence": self._calculate_overall_confidence(categorized)
        }

    def _ai_categorize_transactions(self, transactions: List[Dict]) -> List[Dict]:
        """AI-powered transaction categorization"""
        categorized = []
        
        for txn in transactions:
            description = txn.get("description", "").lower()
            amount = abs(float(txn.get("amount", 0)))
            
            # AI categorization logic
            category, confidence = self._predict_category(description, amount)
            
            # Detect merchant
            merchant = self._extract_merchant_ai(description)
            
            # Detect if recurring
            is_recurring = self._detect_recurring_pattern(txn, transactions)
            
            categorized_txn = {
                **txn,
                "category": category,
                "merchant": merchant,
                "is_recurring": is_recurring,
                "ai_confidence": confidence,
                "ai_tags": self._generate_ai_tags(description, amount)
            }
            
            categorized.append(categorized_txn)
        
        return categorized

    def _predict_category(self, description: str, amount: float) -> Tuple[str, float]:
        """AI category prediction with confidence scoring"""
        scores = {}
        
        for category, patterns in self.category_patterns.items():
            score = 0.0
            
            # Keyword matching with weights
            for keyword in patterns["keywords"]:
                if keyword in description:
                    score += 0.3
            
            # Pattern matching
            for pattern in patterns["patterns"]:
                if re.search(pattern, description, re.IGNORECASE):
                    score += 0.4
            
            # Merchant indicators
            for merchant in patterns["merchant_indicators"]:
                if merchant in description:
                    score += 0.5
            
            # Amount-based hints
            if category == "CATEGORY_FOOD" and 50 <= amount <= 2000:
                score += 0.1
            elif category == "CATEGORY_TRANSPORTATION" and 20 <= amount <= 1000:
                score += 0.1
            elif category == "CATEGORY_UTILITIES" and 200 <= amount <= 5000:
                score += 0.1
            
            scores[category] = min(score, 1.0)
        
        # Special case: Income detection
        if amount > 10000 and any(word in description for word in ["salary", "credit", "transfer", "deposit"]):
            return "CATEGORY_INCOME", 0.9
        
        # Return best match or default
        if scores:
            best_category = max(scores.items(), key=lambda x: x[1])
            if best_category[1] > 0.3:
                return best_category[0], best_category[1]
        
        return "CATEGORY_MISCELLANEOUS", 0.5

    def _generate_ai_insights(self, transactions: List[Dict]) -> List[Dict]:
        """Generate AI-powered spending insights"""
        insights = []
        
        if not transactions:
            return insights
        
        # Calculate spending by category
        category_spending = defaultdict(float)
        total_spending = 0
        
        for txn in transactions:
            if txn["category"] != "CATEGORY_INCOME":
                amount = abs(float(txn.get("amount", 0)))
                category_spending[txn["category"]] += amount
                total_spending += amount
        
        # Insight 1: High category spending
        for category, amount in category_spending.items():
            if total_spending > 0 and amount / total_spending > self.thresholds["high_spending_category"]:
                insights.append({
                    "type": "INSIGHT_OVERSPENDING",
                    "title": f"High {category.replace('CATEGORY_', '').title()} Spending",
                    "description": f"You spent ₹{amount:,.0f} on {category.replace('CATEGORY_', '').lower()}, which is {amount/total_spending*100:.1f}% of your total spending.",
                    "severity": "SEVERITY_MEDIUM" if amount/total_spending > 0.4 else "SEVERITY_LOW",
                    "amount_impact": amount,
                    "ai_confidence": 0.85
                })
        
        # Insight 2: Unusual transactions
        amounts = [abs(float(txn.get("amount", 0))) for txn in transactions if txn["category"] != "CATEGORY_INCOME"]
        if amounts:
            avg_amount = statistics.mean(amounts)
            for txn in transactions:
                amount = abs(float(txn.get("amount", 0)))
                if amount > avg_amount * self.thresholds["unusual_transaction"]:
                    insights.append({
                        "type": "INSIGHT_UNUSUAL_TRANSACTION",
                        "title": "Unusual Large Transaction",
                        "description": f"₹{amount:,.0f} spent on {txn.get('description', 'Unknown')} is {amount/avg_amount:.1f}x your average transaction.",
                        "severity": "SEVERITY_HIGH",
                        "amount_impact": amount - avg_amount,
                        "ai_confidence": 0.75
                    })
        
        # Insight 3: Savings opportunity
        food_spending = category_spending.get("CATEGORY_FOOD", 0)
        if food_spending > 15000:
            potential_savings = food_spending * 0.25
            insights.append({
                "type": "INSIGHT_SAVINGS_OPPORTUNITY",
                "title": "Food Spending Optimization",
                "description": f"You spent ₹{food_spending:,.0f} on food. Cooking at home could save ₹{potential_savings:,.0f} monthly.",
                "severity": "SEVERITY_LOW",
                "amount_impact": potential_savings,
                "ai_confidence": 0.70
            })
        
        # Insight 4: Positive trends
        income_total = sum(abs(float(txn.get("amount", 0))) for txn in transactions if txn["category"] == "CATEGORY_INCOME")
        if income_total > total_spending:
            surplus = income_total - total_spending
            insights.append({
                "type": "INSIGHT_POSITIVE_TREND",
                "title": "Positive Cash Flow",
                "description": f"Excellent! You saved ₹{surplus:,.0f} this month. Consider investing this surplus for long-term growth.",
                "severity": "SEVERITY_INFO",
                "amount_impact": surplus,
                "ai_confidence": 0.95
            })
        
        return insights

    def _detect_spending_patterns(self, transactions: List[Dict]) -> Dict[str, Any]:
        """Detect AI spending patterns"""
        patterns = {
            "recurring_subscriptions": [],
            "weekend_vs_weekday": {},
            "time_based_patterns": {},
            "merchant_loyalty": {}
        }
        
        # Detect recurring subscriptions
        amount_groups = defaultdict(list)
        for txn in transactions:
            amount = abs(float(txn.get("amount", 0)))
            rounded_amount = round(amount, -1)  # Round to nearest 10
            amount_groups[rounded_amount].append(txn)
        
        for amount, txns in amount_groups.items():
            if len(txns) >= 2:  # Potential recurring
                patterns["recurring_subscriptions"].append({
                    "amount": amount,
                    "frequency": len(txns),
                    "merchant": txns[0].get("merchant", "Unknown"),
                    "confidence": min(len(txns) * 0.3, 1.0)
                })
        
        return patterns

    def _calculate_ai_metrics(self, transactions: List[Dict]) -> Dict[str, Any]:
        """Calculate AI-enhanced metrics"""
        if not transactions:
            return {}
        
        # Basic metrics
        total_transactions = len(transactions)
        amounts = [abs(float(txn.get("amount", 0))) for txn in transactions]
        
        # AI-enhanced metrics
        return {
            "total_transactions": total_transactions,
            "average_transaction": statistics.mean(amounts) if amounts else 0,
            "median_transaction": statistics.median(amounts) if amounts else 0,
            "spending_volatility": statistics.stdev(amounts) if len(amounts) > 1 else 0,
            "ai_categorization_accuracy": self._calculate_categorization_accuracy(transactions),
            "spending_efficiency_score": self._calculate_efficiency_score(transactions)
        }

    def _extract_merchant_ai(self, description: str) -> str:
        """AI-powered merchant extraction"""
        # Clean description
        cleaned = re.sub(r'[^\w\s]', ' ', description).strip()
        words = cleaned.split()
        
        # Known merchant patterns
        known_merchants = ["amazon", "flipkart", "swiggy", "zomato", "uber", "ola", "netflix", "spotify"]
        for merchant in known_merchants:
            if merchant in description.lower():
                return merchant.title()
        
        # Extract first meaningful word
        if words:
            return words[0].title()
        
        return "Unknown"

    def _detect_recurring_pattern(self, txn: Dict, all_transactions: List[Dict]) -> bool:
        """AI-based recurring transaction detection"""
        amount = abs(float(txn.get("amount", 0)))
        description = txn.get("description", "").lower()
        
        # Look for similar transactions
        similar_count = 0
        for other_txn in all_transactions:
            other_amount = abs(float(other_txn.get("amount", 0)))
            other_desc = other_txn.get("description", "").lower()
            
            # Check amount similarity (within 5%)
            if abs(amount - other_amount) / max(amount, 1) < 0.05:
                # Check description similarity
                if self._text_similarity(description, other_desc) > 0.7:
                    similar_count += 1
        
        return similar_count >= 2

    def _generate_ai_tags(self, description: str, amount: float) -> List[str]:
        """Generate AI tags for transactions"""
        tags = []
        
        # Amount-based tags
        if amount < 100:
            tags.append("micro-transaction")
        elif amount > 5000:
            tags.append("large-transaction")
        
        # Description-based tags
        if any(word in description for word in ["online", "digital", "app"]):
            tags.append("digital")
        if any(word in description for word in ["subscription", "monthly", "annual"]):
            tags.append("subscription")
        
        return tags

    def _text_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity using simple algorithm"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0

    def _calculate_categorization_accuracy(self, transactions: List[Dict]) -> float:
        """Calculate AI categorization confidence"""
        if not transactions:
            return 0.0
        
        confidences = [txn.get("ai_confidence", 0.5) for txn in transactions]
        return statistics.mean(confidences)

    def _calculate_efficiency_score(self, transactions: List[Dict]) -> float:
        """Calculate spending efficiency score (0-100)"""
        # Simple efficiency calculation based on spending patterns
        score = 50.0  # Base score
        
        # Bonus for categorized transactions
        categorized_count = sum(1 for txn in transactions if txn.get("category") != "CATEGORY_MISCELLANEOUS")
        if transactions:
            score += (categorized_count / len(transactions)) * 20
        
        # Bonus for recurring transactions (planned spending)
        recurring_count = sum(1 for txn in transactions if txn.get("is_recurring", False))
        if transactions:
            score += (recurring_count / len(transactions)) * 15
        
        # Penalty for too many small transactions
        small_txn_count = sum(1 for txn in transactions if abs(float(txn.get("amount", 0))) < 100)
        if transactions and small_txn_count / len(transactions) > 0.5:
            score -= 15
        
        return min(max(score, 0), 100)

    def _calculate_overall_confidence(self, transactions: List[Dict]) -> float:
        """Calculate overall AI analysis confidence"""
        if not transactions:
            return 0.0
        
        confidences = [txn.get("ai_confidence", 0.5) for txn in transactions]
        return statistics.mean(confidences)

    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            "categorized_transactions": [],
            "insights": [],
            "patterns": {},
            "metrics": {},
            "ai_confidence": 0.0
        }


# Global AI analyzer instance
ai_spend_analyzer = AISpendAnalyzer()