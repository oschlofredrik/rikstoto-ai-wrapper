#!/usr/bin/env python3
"""
V64 Betting JSON Data Comprehensive Analysis Tool
=================================================

Performs mathematical consistency, logical error detection, data integrity checks,
and realistic betting pattern analysis for V64 betting JSON data.

Author: Claude Code Analysis
Date: 2025-08-27
"""

import json
import math
from typing import Dict, List, Any, Tuple
from collections import defaultdict

class V64Analyzer:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
        
    def analyze_json(self, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main analysis function that performs all checks"""
        self.errors = []
        self.warnings = []
        self.info = []
        
        # Basic structure validation
        self._validate_structure(json_data)
        
        # Mathematical consistency checks
        self._check_mathematical_consistency(json_data)
        
        # V64 business logic validation
        self._validate_v64_logic(json_data)
        
        # Prize calculation validation
        self._validate_prize_calculations(json_data)
        
        # Data integrity checks
        self._check_data_integrity(json_data)
        
        # Realistic betting pattern analysis
        self._analyze_betting_patterns(json_data)
        
        # Winner determination logic
        self._validate_winner_determination(json_data)
        
        # Statistical accuracy checks
        self._check_statistical_accuracy(json_data)
        
        return {
            "summary": {
                "total_errors": len(self.errors),
                "total_warnings": len(self.warnings),
                "total_info": len(self.info),
                "overall_status": "FAIL" if self.errors else "PASS" if self.warnings else "EXCELLENT"
            },
            "errors": self.errors,
            "warnings": self.warnings,
            "info": self.info
        }
    
    def _validate_structure(self, data: Dict[str, Any]):
        """Validate basic JSON structure for V64"""
        required_fields = [
            "product", "track", "date", "startTime", "betDetails",
            "poolInfo", "markings", "raceResults", "result", "prizes"
        ]
        
        for field in required_fields:
            if field not in data:
                self.errors.append(f"Missing required field: {field}")
        
        # V64 should have exactly 6 races
        if data.get("product") == "V64":
            race_results = data.get("raceResults", [])
            if len(race_results) != 6:
                self.errors.append(f"V64 must have exactly 6 races, found {len(race_results)}")
                
            # Check result field consistency
            result = data.get("result", {})
            if result.get("totalRaces") != 6:
                self.errors.append(f"Result totalRaces should be 6 for V64, found {result.get('totalRaces')}")
    
    def _check_mathematical_consistency(self, data: Dict[str, Any]):
        """Check mathematical consistency in pools, odds, and calculations"""
        
        # Pool size consistency
        pool_info = data.get("poolInfo", {})
        total_pool = pool_info.get("totalPool", 0)
        
        if total_pool <= 0:
            self.errors.append("Total pool must be positive")
            return
            
        # Sum of individual race pools vs total (should be reasonable)
        race_results = data.get("raceResults", [])
        race_pool_sum = sum(race.get("poolSize", 0) for race in race_results)
        
        # Race pools typically sum to less than total pool (administration fees, etc.)
        if race_pool_sum > total_pool:
            self.errors.append(f"Sum of race pools ({race_pool_sum:,}) exceeds total pool ({total_pool:,})")
        elif race_pool_sum < total_pool * 0.3:
            self.warnings.append(f"Sum of race pools ({race_pool_sum:,}) seems very low compared to total pool ({total_pool:,})")
        
        # Check betting amount consistency for each race
        for race_idx, race in enumerate(race_results, 1):
            self._validate_race_betting_math(race, race_idx)
    
    def _validate_race_betting_math(self, race: Dict[str, Any], race_num: int):
        """Validate betting mathematics for a single race"""
        results = race.get("results", [])
        pool_size = race.get("poolSize", 0)
        
        if not results or pool_size <= 0:
            return
        
        total_amount_bet = sum(horse.get("amountBet", 0) for horse in results)
        total_percentage = sum(horse.get("percentageBet", 0) for horse in results)
        
        # Check if betting amounts roughly match pool size
        if abs(total_amount_bet - pool_size) > pool_size * 0.1:  # 10% tolerance
            self.warnings.append(
                f"Race {race_num}: Total amount bet ({total_amount_bet:,}) doesn't match pool size ({pool_size:,})"
            )
        
        # Check if percentages sum to reasonable value (should be close to 100%)
        if abs(total_percentage - 100) > 10:  # 10% tolerance for rounding
            self.errors.append(
                f"Race {race_num}: Betting percentages sum to {total_percentage:.1f}%, should be close to 100%"
            )
        
        # Validate odds vs percentage relationship
        for horse in results:
            percentage = horse.get("percentageBet", 0)
            odds = horse.get("odds", 0)
            
            if percentage > 0 and odds > 0:
                # Implied probability from odds should roughly match betting percentage
                implied_prob = 100 / odds  # Convert odds to percentage
                
                # Allow significant tolerance since odds include bookmaker margin
                if abs(implied_prob - percentage) > percentage * 0.5:  # 50% tolerance
                    self.warnings.append(
                        f"Race {race_num}, Horse {horse.get('horse')}: "
                        f"Odds {odds} imply {implied_prob:.1f}% but betting is {percentage:.1f}%"
                    )
    
    def _validate_v64_logic(self, data: Dict[str, Any]):
        """Validate V64-specific business rules"""
        
        # Check markings structure
        markings = data.get("markings", {})
        
        if len(markings) != 6:
            self.errors.append(f"V64 should have markings for 6 races, found {len(markings)}")
        
        # Validate marking keys are "1" through "6"
        expected_keys = {str(i) for i in range(1, 7)}
        actual_keys = set(markings.keys())
        
        if actual_keys != expected_keys:
            missing = expected_keys - actual_keys
            extra = actual_keys - expected_keys
            if missing:
                self.errors.append(f"Missing markings for races: {sorted(missing)}")
            if extra:
                self.errors.append(f"Unexpected marking keys: {sorted(extra)}")
        
        # Check if marked horses exist in race results
        race_results = data.get("raceResults", [])
        for race_idx, race in enumerate(race_results, 1):
            race_key = str(race_idx)
            marked_horses = markings.get(race_key, [])
            
            race_horses = {horse.get("horse") for horse in race.get("results", [])}
            
            for marked in marked_horses:
                if marked not in race_horses:
                    self.errors.append(f"Race {race_idx}: Marked horse {marked} not found in results")
                    
    def _validate_prize_calculations(self, data: Dict[str, Any]):
        """Validate prize pool calculations and payouts"""
        
        pool_info = data.get("poolInfo", {})
        total_pool = pool_info.get("totalPool", 0)
        prizes = data.get("prizes", {})
        result = data.get("result", {})
        
        # Calculate expected prize pool (typically 65% of total pool)
        expected_prize_pool = total_pool * 0.65
        
        # Sum all prize amounts * winners
        total_distributed = 0
        for prize_level, prize_data in prizes.items():
            winners = prize_data.get("winners", 0)
            amount = prize_data.get("amount", 0)
            total_distributed += winners * amount
        
        # Check if total distributed is reasonable
        if total_distributed > expected_prize_pool * 1.1:  # 10% tolerance
            self.warnings.append(
                f"Total prize distribution ({total_distributed:,}) exceeds expected prize pool ({expected_prize_pool:,.0f})"
            )
        elif total_distributed < expected_prize_pool * 0.5:  # Very low distribution
            self.warnings.append(
                f"Total prize distribution ({total_distributed:,}) seems very low compared to prize pool ({expected_prize_pool:,.0f})"
            )
        
        # Validate V64 prize structure percentages
        if "sixCorrect" in prizes and "fiveCorrect" in prizes and "fourCorrect" in prizes:
            six_total = prizes["sixCorrect"]["winners"] * prizes["sixCorrect"]["amount"]
            five_total = prizes["fiveCorrect"]["winners"] * prizes["fiveCorrect"]["amount"]
            four_total = prizes["fourCorrect"]["winners"] * prizes["fourCorrect"]["amount"]
            
            total = six_total + five_total + four_total
            if total > 0:
                six_pct = six_total / total * 100
                five_pct = five_total / total * 100
                four_pct = four_total / total * 100
                
                # V64 typical distribution: 50% for 6 correct, 30% for 5, 20% for 4
                if abs(six_pct - 50) > 20:
                    self.warnings.append(f"6-correct prize share is {six_pct:.1f}%, expected ~50%")
                if abs(five_pct - 30) > 15:
                    self.warnings.append(f"5-correct prize share is {five_pct:.1f}%, expected ~30%")
                if abs(four_pct - 20) > 15:
                    self.warnings.append(f"4-correct prize share is {four_pct:.1f}%, expected ~20%")
        
        # Validate payout calculation
        correct_races = result.get("correctRaces", 0)
        payout = result.get("payout", 0)
        bet_details = data.get("betDetails", {})
        rows = bet_details.get("rows", 1)
        
        # Calculate expected payout based on correct races
        expected_payout = 0
        if correct_races == 6 and "sixCorrect" in prizes:
            expected_payout = prizes["sixCorrect"]["amount"] * rows
        elif correct_races == 5 and "fiveCorrect" in prizes:
            expected_payout = prizes["fiveCorrect"]["amount"] * rows
        elif correct_races == 4 and "fourCorrect" in prizes:
            expected_payout = prizes["fourCorrect"]["amount"] * rows
        
        if expected_payout != payout and correct_races >= 4:
            self.errors.append(
                f"Payout calculation error: Expected {expected_payout:,}, got {payout:,} "
                f"for {correct_races} correct races with {rows} rows"
            )
        
    def _check_data_integrity(self, data: Dict[str, Any]):
        """Check data field consistency and integrity"""
        
        race_results = data.get("raceResults", [])
        
        for race_idx, race in enumerate(race_results, 1):
            results = race.get("results", [])
            total_starters = race.get("totalStarters", 0)
            
            # Check if number of results matches totalStarters
            if len(results) != total_starters:
                self.errors.append(
                    f"Race {race_idx}: {len(results)} results but totalStarters is {total_starters}"
                )
            
            # Check position uniqueness and completeness
            positions = [horse.get("position") for horse in results]
            expected_positions = set(range(1, total_starters + 1))
            actual_positions = set(positions)
            
            if actual_positions != expected_positions:
                missing = expected_positions - actual_positions
                duplicates = len(positions) - len(set(positions))
                
                if missing:
                    self.errors.append(f"Race {race_idx}: Missing positions {sorted(missing)}")
                if duplicates > 0:
                    self.errors.append(f"Race {race_idx}: {duplicates} duplicate positions found")
            
            # Check horse number uniqueness
            horse_numbers = [horse.get("horse") for horse in results]
            if len(horse_numbers) != len(set(horse_numbers)):
                self.errors.append(f"Race {race_idx}: Duplicate horse numbers found")
            
            # Validate winner consistency
            winner = race.get("winner")
            winner_name = race.get("winnerName")
            winner_odds = race.get("winnerOdds")
            
            # Find the winning horse in results
            winning_horse = None
            for horse in results:
                if horse.get("position") == 1:
                    winning_horse = horse
                    break
            
            if winning_horse:
                if winning_horse.get("horse") != winner:
                    self.errors.append(
                        f"Race {race_idx}: Winner field ({winner}) doesn't match position 1 horse ({winning_horse.get('horse')})"
                    )
                if winning_horse.get("name") != winner_name:
                    self.errors.append(
                        f"Race {race_idx}: Winner name mismatch"
                    )
                if abs(winning_horse.get("odds", 0) - (winner_odds or 0)) > 0.1:
                    self.errors.append(
                        f"Race {race_idx}: Winner odds mismatch"
                    )
                    
    def _analyze_betting_patterns(self, data: Dict[str, Any]):
        """Analyze if betting patterns are realistic"""
        
        race_results = data.get("raceResults", [])
        
        for race_idx, race in enumerate(race_results, 1):
            results = race.get("results", [])
            betting_dist = race.get("bettingDistribution", {})
            
            # Check if betting distribution makes sense
            if betting_dist:
                favorite = betting_dist.get("favorite", {})
                second_choice = betting_dist.get("secondChoice", {})
                third_choice = betting_dist.get("thirdChoice", {})
                
                # Favorite should have higher percentage than second choice
                if (favorite.get("percentage", 0) <= second_choice.get("percentage", 0)):
                    self.warnings.append(f"Race {race_idx}: Favorite percentage not highest")
                
                # Check if betting distribution horses exist
                for choice_name, choice_data in [("favorite", favorite), ("secondChoice", second_choice), ("thirdChoice", third_choice)]:
                    horse_num = choice_data.get("horse")
                    if horse_num:
                        horse_exists = any(h.get("horse") == horse_num for h in results)
                        if not horse_exists:
                            self.errors.append(f"Race {race_idx}: {choice_name} horse {horse_num} not found in results")
            
            # Analyze odds distribution
            odds_list = [horse.get("odds", 0) for horse in results if horse.get("odds", 0) > 0]
            if odds_list:
                min_odds = min(odds_list)
                max_odds = max(odds_list)
                
                # Check for unrealistic odds ranges
                if min_odds < 1.1:
                    self.warnings.append(f"Race {race_idx}: Very low minimum odds ({min_odds})")
                if max_odds > 500:
                    self.warnings.append(f"Race {race_idx}: Very high maximum odds ({max_odds})")
                    
                # Check odds progression
                sorted_horses = sorted(results, key=lambda x: x.get("odds", 0))
                for i in range(len(sorted_horses) - 1):
                    current_odds = sorted_horses[i].get("odds", 0)
                    next_odds = sorted_horses[i + 1].get("odds", 0)
                    
                    # Odds should generally increase (lower odds = more favored)
                    if current_odds > next_odds * 1.1:  # Allow some tolerance
                        pass  # This could indicate odd odds progression but might be normal
    
    def _validate_winner_determination(self, data: Dict[str, Any]):
        """Validate winner determination logic"""
        
        markings = data.get("markings", {})
        race_results = data.get("raceResults", [])
        result = data.get("result", {})
        
        calculated_correct = 0
        
        for race_idx, race in enumerate(race_results, 1):
            race_key = str(race_idx)
            marked_horses = markings.get(race_key, [])
            winner = race.get("winner")
            hit = race.get("hit", False)
            
            # Check if hit calculation is correct
            should_hit = winner in marked_horses
            
            if hit != should_hit:
                self.errors.append(
                    f"Race {race_idx}: Hit calculation wrong. Winner {winner}, "
                    f"marked {marked_horses}, recorded as {'hit' if hit else 'miss'}, should be {'hit' if should_hit else 'miss'}"
                )
            
            if should_hit:
                calculated_correct += 1
        
        # Check if total correct races matches calculation
        recorded_correct = result.get("correctRaces", 0)
        if calculated_correct != recorded_correct:
            self.errors.append(
                f"Correct races mismatch: Calculated {calculated_correct}, recorded {recorded_correct}"
            )
            
    def _check_statistical_accuracy(self, data: Dict[str, Any]):
        """Check statistical accuracy and realism"""
        
        statistics = data.get("statistics", {})
        race_results = data.get("raceResults", [])
        
        if not statistics:
            self.warnings.append("No statistics section found")
            return
        
        # Validate average winner odds calculation
        winner_odds = []
        for race in race_results:
            odds = race.get("winnerOdds")
            if odds:
                winner_odds.append(odds)
        
        if winner_odds:
            calculated_avg = sum(winner_odds) / len(winner_odds)
            recorded_avg = statistics.get("averageWinnerOdds", 0)
            
            if abs(calculated_avg - recorded_avg) > 0.1:
                self.errors.append(
                    f"Average winner odds calculation wrong: Calculated {calculated_avg:.2f}, recorded {recorded_avg}"
                )
        
        # Check favorite wins calculation
        calculated_fav_wins = 0
        for race in race_results:
            winner = race.get("winner")
            if winner and winner <= 3:  # Top 3 horses considered favorites
                calculated_fav_wins += 1
        
        recorded_fav_wins = statistics.get("favoriteWins", 0)
        if calculated_fav_wins != recorded_fav_wins:
            self.errors.append(
                f"Favorite wins calculation wrong: Calculated {calculated_fav_wins}, recorded {recorded_fav_wins}"
            )
        
        # Validate coverage percentage (should be reasonable for betting strategy)
        coverage_pct = statistics.get("coveragePercentage", 0)
        if coverage_pct < 0.1 or coverage_pct > 10:
            self.warnings.append(f"Coverage percentage {coverage_pct}% seems unrealistic")
        
        # Check bet size reasonableness
        avg_bet_size = statistics.get("averageBetSize", 0)
        if avg_bet_size < 10 or avg_bet_size > 10000:
            self.warnings.append(f"Average bet size {avg_bet_size} kr seems unrealistic")


def analyze_v64_file(filepath: str) -> Dict[str, Any]:
    """Analyze a V64 JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        analyzer = V64Analyzer()
        return analyzer.analyze_json(data)
    
    except FileNotFoundError:
        return {"error": f"File not found: {filepath}"}
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON: {e}"}
    except Exception as e:
        return {"error": f"Analysis error: {e}"}


def generate_report(analysis_result: Dict[str, Any], filename: str = "") -> str:
    """Generate a human-readable analysis report"""
    
    if "error" in analysis_result:
        return f"ERROR: {analysis_result['error']}"
    
    summary = analysis_result.get("summary", {})
    errors = analysis_result.get("errors", [])
    warnings = analysis_result.get("warnings", [])
    info = analysis_result.get("info", [])
    
    report = []
    report.append("="*80)
    report.append("V64 BETTING JSON COMPREHENSIVE ANALYSIS REPORT")
    report.append("="*80)
    
    if filename:
        report.append(f"File: {filename}")
        report.append("")
    
    # Summary
    report.append(f"OVERALL STATUS: {summary.get('overall_status', 'UNKNOWN')}")
    report.append(f"Total Errors: {summary.get('total_errors', 0)}")
    report.append(f"Total Warnings: {summary.get('total_warnings', 0)}")
    report.append(f"Total Info Items: {summary.get('total_info', 0)}")
    report.append("")
    
    # Errors (Critical Issues)
    if errors:
        report.append("CRITICAL ERRORS:")
        report.append("-"*40)
        for i, error in enumerate(errors, 1):
            report.append(f"{i:2d}. {error}")
        report.append("")
    
    # Warnings (Potential Issues)
    if warnings:
        report.append("WARNINGS:")
        report.append("-"*40)
        for i, warning in enumerate(warnings, 1):
            report.append(f"{i:2d}. {warning}")
        report.append("")
    
    # Info (General Information)
    if info:
        report.append("INFORMATIONAL:")
        report.append("-"*40)
        for i, info_item in enumerate(info, 1):
            report.append(f"{i:2d}. {info_item}")
        report.append("")
    
    if not errors and not warnings:
        report.append("✅ ALL CHECKS PASSED - Data appears to be mathematically consistent")
        report.append("   and follows proper V64 business logic!")
    elif not errors:
        report.append("✅ No critical errors found, but some warnings noted above.")
    else:
        report.append("❌ Critical errors found that need attention.")
    
    report.append("="*80)
    
    return "\n".join(report)


if __name__ == "__main__":
    import sys
    
    # Test with the generated V64 file
    test_file = "/Users/fredrikevjenekli/Rikstoto Innsikt/rikstoto-ai-wrapper/v64_test_1_correct.json"
    
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
    
    result = analyze_v64_file(test_file)
    report = generate_report(result, test_file)
    print(report)