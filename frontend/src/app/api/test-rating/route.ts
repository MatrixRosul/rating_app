import { calculateRatingChange } from '../utils/rating';

export async function GET() {
  const tests = [];
  
  // Test 1: КМС vs КМС (обидва стартують з 1600)
  const test1 = calculateRatingChange(
    1600, 1600,  // ratings
    5, 3,        // scores
    5,           // maxScore
    0, 0,        // games
    1.0,         // matchWeight (deprecated)
    undefined    // stage
  );
  tests.push({
    name: "TEST 1: КМС vs КМС (1600 vs 1600, перша гра)",
    ratings: "1600 vs 1600",
    score: "5-3 (max 5)",
    games: "0 vs 0",
    stage: "None",
    player1Change: test1.player1Change,
    player2Change: test1.player2Change,
    sum: test1.player1Change + test1.player2Change
  });
  
  // Test 2: КМС vs не-КМС (1600 vs 1300, перша гра)
  const test2 = calculateRatingChange(
    1600, 1300,
    5, 3,
    5,
    0, 0,
    1.0,
    undefined
  );
  tests.push({
    name: "TEST 2: КМС vs не-КМС (1600 vs 1300)",
    ratings: "1600 vs 1300",
    score: "5-3 (max 5)",
    games: "0 vs 0",
    stage: "None",
    player1Change: test2.player1Change,
    player2Change: test2.player2Change,
    sum: test2.player1Change + test2.player2Change
  });
  
  // Test 3: Фінал турніру
  const test3 = calculateRatingChange(
    1700, 1650,
    5, 4,
    5,
    50, 45,
    1.0,
    'final'
  );
  tests.push({
    name: "TEST 3: Фінал турніру (1700 vs 1650)",
    ratings: "1700 vs 1650",
    score: "5-4 (max 5)",
    games: "50 vs 45",
    stage: "final",
    player1Change: test3.player1Change,
    player2Change: test3.player2Change,
    sum: test3.player1Change + test3.player2Change
  });
  
  // Test 4: Underdog wins
  const test4 = calculateRatingChange(
    1200, 1500,
    5, 2,
    5,
    30, 35,
    1.0,
    'quarterfinal'
  );
  tests.push({
    name: "TEST 4: Аутсайдер перемагає (1200 vs 1500)",
    ratings: "1200 vs 1500",
    score: "5-2 (max 5)",
    games: "30 vs 35",
    stage: "quarterfinal",
    player1Change: test4.player1Change,
    player2Change: test4.player2Change,
    sum: test4.player1Change + test4.player2Change
  });
  
  // Test 5: Елітний матч
  const test5 = calculateRatingChange(
    1900, 1850,
    5, 4,
    5,
    100, 95,
    1.0,
    'semifinal'
  );
  tests.push({
    name: "TEST 5: Елітний матч (1900 vs 1850)",
    ratings: "1900 vs 1850",
    score: "5-4 (max 5)",
    games: "100 vs 95",
    stage: "semifinal",
    player1Change: test5.player1Change,
    player2Change: test5.player2Change,
    sum: test5.player1Change + test5.player2Change
  });
  
  // Format output
  let output = "============================================================\n";
  output += "FRONTEND RATING ALGORITHM TEST\n";
  output += "============================================================\n\n";
  
  tests.forEach(test => {
    output += `${test.name}:\n`;
    output += `  Ratings: ${test.ratings}\n`;
    output += `  Score: ${test.score}\n`;
    output += `  Games: ${test.games}\n`;
    output += `  Stage: ${test.stage}\n`;
    output += `  → Player 1 change: ${test.player1Change >= 0 ? '+' : ''}${test.player1Change}\n`;
    output += `  → Player 2 change: ${test.player2Change >= 0 ? '+' : ''}${test.player2Change}\n`;
    output += `  → Sum: ${test.sum >= 0 ? '+' : ''}${test.sum}\n\n`;
  });
  
  output += "============================================================\n";
  output += "COMPARE WITH BACKEND RESULTS\n";
  output += "============================================================\n";
  
  return new Response(output, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
