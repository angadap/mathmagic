// src/constants/bazaarData.js — Real-Life Maths Adventures (class-wise)
// 4 class groups × 7 adventures × 8 questions each = rich question pool

// ─── Class group helper ───────────────────────────────────────────────
// class_num: 10=Nursery, 11=Jr KG, 12=Sr KG, 1-5 = Class 1-5
export function getClassGroup(class_num) {
  const n = parseInt(class_num || 1);
  if (n === 10 || n === 11) return 1; // Nursery, Jr KG
  if (n === 12 || n === 1)  return 2; // Sr KG, Class 1
  if (n === 2  || n === 3)  return 3; // Class 2, Class 3
  return 4;                           // Class 4, Class 5
}

export const CLASS_GROUP_LABELS = {
  1: { label: 'Nursery – Jr KG', emoji: '🌱', desc: 'Counting & comparing' },
  2: { label: 'Sr KG – Class 1', emoji: '🌟', desc: 'Simple adding & coins' },
  3: { label: 'Class 2 – 3',     emoji: '🚀', desc: 'Multiply, change & budget' },
  4: { label: 'Class 4 – 5',     emoji: '🏆', desc: 'Percentages, best value & big sums' },
};

// ─── Adventures ────────────────────────────────────────────────────────
export const BAZAAR_ADVENTURES = [
  { id:'shopping', name:"Mummy's Shopping",  emoji:'🛒', color:'#f97316', coverEmoji:'🧺', tagline:'Budget shopping with a list!',       situation:'You are at the sabzi mandi with Mummy\'s list and money in your pocket.', skills:['Addition','Subtraction','Change','Budgeting'], isPaid:false },
  { id:'birthday', name:'Birthday Party',     emoji:'🎂', color:'#ec4899', coverEmoji:'🎉', tagline:'Plan a party for your friends!',       situation:'Your birthday is coming! Plan snacks and decorations within budget.',       skills:['Multiplication','Division','Estimation','Budget'], isPaid:false },
  { id:'canteen',  name:'School Canteen',     emoji:'🍱', color:'#22c55e', coverEmoji:'🍜', tagline:'Lunch time — make it count!',          situation:'It\'s lunch break. The canteen has lots of yummy options. Choose wisely!',  skills:['Addition','Money','Decision Making'], isPaid:false },
  { id:'travel',   name:'City Bus Trip',      emoji:'🚌', color:'#3b82f6', coverEmoji:'🗺️', tagline:'Navigate the city by bus!',           situation:'You need to reach Nana ji\'s house. Buses run on fixed routes and fares.',  skills:['Addition','Distance','Time','Money'], isPaid:false },
  { id:'mela',     name:'Dussehra Mela',      emoji:'🎡', color:'#a855f7', coverEmoji:'🎪', tagline:'Rides, food, games — enjoy the mela!', situation:'The mela is full of rides, food stalls, and games!',                       skills:['Addition','Subtraction','Planning','Money'], isPaid:false },
  { id:'cricket',  name:'Cricket Team Snacks',emoji:'🏏', color:'#06b6d4', coverEmoji:'🧃', tagline:'Feed the team after the match!',       situation:'Your cricket team just won a match. Time for celebration snacks!',          skills:['Division','Multiplication','Sharing'], isPaid:false },
  { id:'recharge', name:'Mobile Recharge',    emoji:'📱', color:'#fbbf24', coverEmoji:'📶', tagline:'Which plan gives more for less?',      situation:'Bhaiya needs to recharge his phone. Compare plans and find the best value!',skills:['Comparison','Division','Value for Money'], isPaid:false },
  { id:'electricity', name:'Electricity Bill',emoji:'💡', color:'#f59e0b', coverEmoji:'⚡', tagline:'Save electricity, save money!',        situation:'Papa wants to reduce the electricity bill. Help him track usage!',         skills:['Multiplication','Addition','Units','Estimation'], isPaid:true  },
];

// ═══════════════════════════════════════════════════════════════════════
//  QUESTION POOLS — class_group 1 to 4 per adventure
//  Each question: { story, question, hint, answer, options[], explain, optionLabels[], displayAnswer }
// ═══════════════════════════════════════════════════════════════════════

export const ADVENTURE_QUESTIONS = {

  // ──────────────────────────────────────────────────────────────────
  //  🛒 MUMMY'S SHOPPING
  // ──────────────────────────────────────────────────────────────────
  shopping: {
    1: [ // Nursery–Jr KG: counting, which costs more, can I buy
      { story:'Mummy has 5 apples 🍎 and buys 3 more.', question:'How many apples are there now?', hint:'Count: 5 and 3 more', answer:8, options:[6,7,8,9], explain:'5 + 3 = 8 apples!' },
      { story:'A banana costs ₹2. A mango costs ₹5.', question:'Which one costs MORE?', hint:'₹5 is bigger than ₹2', answer:'Mango', options:['Banana','Mango'], explain:'₹5 > ₹2, so Mango costs more!', optionLabels:['Banana 🍌','Mango 🥭'], displayAnswer:'Mango' },
      { story:'You have ₹10 🪙. A toy costs ₹7.', question:'Can you buy the toy?', hint:'₹10 is more than ₹7', answer:'Yes', options:['Yes','No'], explain:'₹10 > ₹7, so YES you can buy it!', optionLabels:['Yes ✅','No ❌'], displayAnswer:'Yes' },
      { story:'Mummy puts 4 tomatoes 🍅 and 4 potatoes 🥔 in the bag.', question:'How many vegetables in total?', hint:'4 and 4', answer:8, options:[6,7,8,9], explain:'4 + 4 = 8 vegetables!' },
      { story:'There are 10 oranges. Mummy takes 3.', question:'How many oranges are left?', hint:'10 take away 3', answer:7, options:[6,7,8,9], explain:'10 - 3 = 7 oranges left!' },
      { story:'Each banana costs ₹1. Mummy buys 5 bananas.', question:'How much does Mummy pay?', hint:'₹1 five times', answer:5, options:[3,4,5,6], explain:'1 + 1 + 1 + 1 + 1 = ₹5!' },
      { story:'You see 3 red apples 🍎 and 5 green apples 🍏.', question:'How many apples altogether?', hint:'3 and 5', answer:8, options:[7,8,9,10], explain:'3 + 5 = 8 apples!' },
      { story:'A lemon costs ₹3. Do you have enough with ₹5?', question:'Do you have enough money?', hint:'Is ₹5 more than ₹3?', answer:'Yes', options:['Yes','No'], explain:'₹5 > ₹3, so yes you do!', optionLabels:['Yes ✅','No ❌'], displayAnswer:'Yes' },
    ],
    2: [ // Sr KG–Class 1: simple totals within 50, coin identification
      { story:'Mummy buys 2 kg apples at ₹10/kg and 1 packet biscuits for ₹8.', question:'How much does Mummy spend?', hint:'2×10 + 8', answer:28, options:[24,26,28,30], explain:'2×10=20, +8=₹28!' },
      { story:'You have ₹20. A pencil costs ₹5 and an eraser costs ₹3.', question:'How much do both cost?', hint:'5 + 3', answer:8, options:[6,7,8,9], explain:'5 + 3 = ₹8. You can buy both!' },
      { story:'Mummy gives the shopkeeper ₹50 and buys things for ₹35.', question:'How much change does Mummy get?', hint:'50 - 35', answer:15, options:[10,12,15,20], explain:'50 - 35 = ₹15 change!' },
      { story:'3 bananas cost ₹9. How much does 1 banana cost?', question:'Cost of 1 banana?', hint:'9 ÷ 3', answer:3, options:[2,3,4,5], explain:'9 ÷ 3 = ₹3 each!' },
      { story:'You have ₹10 and spend ₹7 on chips.', question:'How much is left?', hint:'10 - 7', answer:3, options:[2,3,4,5], explain:'10 - 7 = ₹3 left!' },
      { story:'Mummy buys 4 eggs at ₹5 each.', question:'How much for all 4 eggs?', hint:'4 × 5', answer:20, options:[15,18,20,22], explain:'4 × 5 = ₹20!' },
      { story:'A mango costs ₹15. Mummy pays with ₹20.', question:'What change does Mummy get?', hint:'20 - 15', answer:5, options:[3,4,5,6], explain:'20 - 15 = ₹5 change!' },
      { story:'You need ₹25 for bread. You have ₹20.', question:'How much more do you need?', hint:'25 - 20', answer:5, options:[3,4,5,6], explain:'25 - 20 = ₹5 more needed!' },
    ],
    3: [ // Class 2–3: multiplication, larger amounts, change
      { story:'2 kg Atta ₹35/kg, 1 kg Sugar ₹45, 1 litre Oil ₹130. You have ₹500.', question:'What is the total bill?', hint:'2×35 + 45 + 130', answer:245, options:[230,240,245,260], explain:'70 + 45 + 130 = ₹245!' },
      { story:'You buy items costing ₹85, ₹120, and ₹45. You give ₹300.', question:'How much change do you get?', hint:'85+120+45=250. Change = 300-250', answer:50, options:[40,50,60,70], explain:'250 total, 300-250=₹50 change!' },
      { story:'3 kg Tomato ₹40/kg, 2 kg Potato ₹30/kg, 1 kg Onion ₹50.', question:'What is the total cost?', hint:'3×40 + 2×30 + 50', answer:230, options:[210,220,230,250], explain:'120+60+50=₹230!' },
      { story:'Mummy\'s budget is ₹600. She has spent ₹385 so far.', question:'How much is left to spend?', hint:'600 - 385', answer:215, options:[185,200,215,225], explain:'600 - 385 = ₹215 left!' },
      { story:'Apples ₹120/kg. You buy 2 kg.', question:'How much do you pay?', hint:'120 × 2', answer:240, options:[220,230,240,250], explain:'120 × 2 = ₹240!' },
      { story:'4 biscuit packets ₹10 each, 2 chips ₹20 each.', question:'Total cost?', hint:'4×10 + 2×20', answer:80, options:[60,70,80,90], explain:'40 + 40 = ₹80!' },
      { story:'5 kg Rice ₹60/kg. You only have ₹250.', question:'How much MORE money do you need?', hint:'5×60=300. Shortage=300-250', answer:50, options:[40,50,60,70], explain:'300-250=₹50 short!' },
      { story:'Items cost ₹45, ₹85 and ₹70. Round each to nearest 10 and estimate.', question:'Estimated total?', hint:'50+90+70', answer:210, options:[190,200,210,220], explain:'50+90+70=₹210 estimate!' },
    ],
    4: [ // Class 4–5: percentages, best value, fractions
      { story:'A 5 kg bag of rice costs ₹280. A 2 kg bag costs ₹120.', question:'Which is better value? Cost per kg of 5 kg bag?', hint:'280 ÷ 5', answer:56, options:[52,54,56,58], explain:'280÷5=₹56/kg vs 120÷2=₹60/kg → 5 kg bag is better!', displayAnswer:'₹56/kg', optionLabels:['₹52/kg','₹54/kg','₹56/kg','₹58/kg'] },
      { story:'Mummy has ₹1000 budget. She spends 35% on vegetables and 25% on dairy.', question:'How much does she spend on vegetables?', hint:'35% of 1000 = 35×10', answer:350, options:[300,325,350,375], explain:'35% of ₹1000 = ₹350!' },
      { story:'Discount of 20% on groceries worth ₹650.', question:'How much do you pay after discount?', hint:'20% of 650=130. Pay=650-130', answer:520, options:[500,510,520,530], explain:'650-130=₹520!' },
      { story:'You buy 3.5 kg of apples at ₹120/kg.', question:'Total cost?', hint:'120×3 + 120×0.5', answer:420, options:[400,410,420,430], explain:'360+60=₹420!' },
      { story:'Weekly grocery bill: Mon ₹245, Wed ₹180, Sat ₹320. Monthly = 4 weeks.', question:'Estimated monthly grocery expense?', hint:'(245+180+320)×4', answer:2980, options:[2800,2900,2980,3100], explain:'745×4=₹2980/month!' },
      { story:'₹500 note for ₹324 purchase. Shopkeeper gives 1×₹50, 1×₹20, 3×₹2.', question:'Is the change correct?', hint:'50+20+6=76. 500-324=?', answer:176, options:[76,126,176,226], explain:'500-324=₹176. Change given=₹76. Shopkeeper is wrong!', displayAnswer:'₹176 correct', optionLabels:['₹76 (given)','₹126','₹176 (correct)','₹226'] },
      { story:'Buy 2 items: first ₹199 (10% off), second ₹299 (no discount).', question:'Total amount to pay?', hint:'199-19.9≈179. 179+299', answer:478, options:[458,468,478,488], explain:'10% of 199=~20. 179+299=₹478!' },
      { story:'Family buys ₹1200 of groceries. Pays in 3 equal installments.', question:'Each installment amount?', hint:'1200 ÷ 3', answer:400, options:[350,375,400,425], explain:'1200÷3=₹400 per installment!' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  //  🎂 BIRTHDAY PARTY
  // ──────────────────────────────────────────────────────────────────
  birthday: {
    1: [
      { story:'You want 3 balloons 🎈. Your friend wants 2 balloons.', question:'How many balloons altogether?', hint:'3 and 2', answer:5, options:[4,5,6,7], explain:'3 + 2 = 5 balloons!' },
      { story:'There are 6 pieces of cake. 4 friends each get 1 piece.', question:'How many pieces are left?', hint:'6 take away 4', answer:2, options:[1,2,3,4], explain:'6 - 4 = 2 pieces left!' },
      { story:'Each lollipop costs ₹2. You want to buy 3.', question:'How much will you pay?', hint:'₹2 three times', answer:6, options:[4,5,6,7], explain:'2 + 2 + 2 = ₹6!' },
      { story:'5 friends are coming to your party. You already have 3 chairs.', question:'How many MORE chairs do you need?', hint:'5 take away 3', answer:2, options:[1,2,3,4], explain:'5 - 3 = 2 more chairs needed!' },
      { story:'You blow out 7 candles 🕯️ on your cake but 2 relight!', question:'How many candles are out?', hint:'7 take away 2', answer:5, options:[4,5,6,7], explain:'7 - 2 = 5 candles out!' },
      { story:'Mummy puts 4 red cups and 4 blue cups on the table.', question:'How many cups in total?', hint:'4 and 4', answer:8, options:[6,7,8,9], explain:'4 + 4 = 8 cups!' },
      { story:'You have ₹10. A party hat costs ₹3.', question:'Can you buy 3 party hats?', hint:'3 × ₹3 = ₹9', answer:'Yes', options:['Yes','No'], explain:'3×3=₹9. ₹10>₹9, so Yes!', optionLabels:['Yes ✅','No ❌'], displayAnswer:'Yes' },
      { story:'2 chocolates are in each goody bag. There are 4 bags.', question:'How many chocolates in total?', hint:'2 four times', answer:8, options:[6,7,8,9], explain:'2 × 4 = 8 chocolates!' },
    ],
    2: [
      { story:'Cake costs ₹120. Balloons cost ₹30. Budget is ₹200.', question:'Total spent on cake and balloons?', hint:'120 + 30', answer:150, options:[140,145,150,160], explain:'120+30=₹150, ₹50 left!' },
      { story:'You need 10 return gifts at ₹15 each.', question:'Total cost of return gifts?', hint:'10 × 15', answer:150, options:[130,140,150,160], explain:'10 × 15 = ₹150!' },
      { story:'6 friends come. Each gets 2 cupcakes. How many cupcakes do you need?', question:'Total cupcakes needed?', hint:'6 × 2', answer:12, options:[10,11,12,13], explain:'6 × 2 = 12 cupcakes!' },
      { story:'Mummy bakes 20 cookies. 8 friends each get 2. How many left?', question:'Cookies remaining?', hint:'8×2=16. 20-16', answer:4, options:[2,3,4,5], explain:'20-16=4 cookies left!' },
      { story:'Party budget ₹300. Spent ₹125 on food and ₹80 on decoration.', question:'How much money is left?', hint:'300-125-80', answer:95, options:[85,90,95,100], explain:'300-205=₹95 left!' },
      { story:'5 pizzas cut into 8 slices each. 10 children each eat 3 slices.', question:'Total slices eaten?', hint:'10 × 3', answer:30, options:[25,28,30,35], explain:'10 × 3 = 30 slices eaten!' },
      { story:'Chips packet ₹20. You need 5 packets.', question:'Total cost?', hint:'5 × 20', answer:100, options:[90,95,100,105], explain:'5 × 20 = ₹100!' },
      { story:'You have ₹50. Cake slice ₹18, cold drink ₹12.', question:'How much change after buying both?', hint:'18+12=30. 50-30', answer:20, options:[15,18,20,22], explain:'50-30=₹20 change!' },
    ],
    3: [
      { story:'Pizza ₹250. Need for 10 kids (2 slices each, 8 slices per pizza).', question:'How many pizzas do you need?', hint:'10×2=20 slices. 20÷8=2.5 → round up', answer:3, options:[2,3,4,5], explain:'20 slices ÷ 8 per pizza = 2.5 → need 3 pizzas!' },
      { story:'Party budget ₹800. Food ₹450, decoration ₹175.', question:'Left for games and prizes?', hint:'800-450-175', answer:175, options:[150,165,175,200], explain:'800-625=₹175 left!' },
      { story:'10 goody bags: 3 chocolates (₹5 each) + 1 pencil (₹8) each.', question:'Total cost for all goody bags?', hint:'Per bag: 3×5+8=23. Total: 10×23', answer:230, options:[200,220,230,250], explain:'23×10=₹230!' },
      { story:'Cake ₹350 for 10 pieces. What is cost per piece?', question:'Cost per slice?', hint:'350 ÷ 10', answer:35, options:[30,35,40,45], explain:'350÷10=₹35 per slice!' },
      { story:'3 large cold drinks ₹80 each, 7 small ₹40 each.', question:'Total drinks bill?', hint:'3×80 + 7×40', answer:520, options:[480,500,520,560], explain:'240+280=₹520!' },
      { story:'5 friends each chip in ₹60. Party cost ₹280.', question:'How much is left over?', hint:'5×60=300. Left=300-280', answer:20, options:[10,15,20,25], explain:'300-280=₹20 left!' },
      { story:'Mummy spends ₹620 on party. Papa gave ₹400, Mummy gave ₹300.', question:'How much money is left after party?', hint:'400+300=700. 700-620', answer:80, options:[60,70,80,90], explain:'700-620=₹80 left!' },
      { story:'12 balloons in a pack ₹36. You need 48 balloons.', question:'How many packs and total cost?', hint:'48÷12=4 packs. 4×36', answer:144, options:[120,132,144,156], explain:'4 packs × ₹36 = ₹144!' },
    ],
    4: [
      { story:'Party for 25 people. Food ₹180/person. 15% discount on bulk order.', question:'Final food bill after discount?', hint:'25×180=4500. 15% of 4500=675. 4500-675', answer:3825, options:[3600,3700,3825,4000], explain:'4500-675=₹3825!' },
      { story:'Caterer charges ₹150/head for 20 people + 18% GST.', question:'Total catering bill with GST?', hint:'20×150=3000. 18% of 3000=540. 3000+540', answer:3540, options:[3200,3400,3540,3600], explain:'3000+540=₹3540!' },
      { story:'Cake costs ₹1200. Split between 4 families. Each family pays ¼.', question:'Each family\'s share?', hint:'1200 ÷ 4', answer:300, options:[250,275,300,325], explain:'1200÷4=₹300 each!' },
      { story:'Return gifts: 8 boys get ₹85 gift, 7 girls get ₹95 gift.', question:'Total gift expense?', hint:'8×85 + 7×95', answer:1345, options:[1250,1300,1345,1400], explain:'680+665=₹1345!' },
      { story:'Last year party cost ₹2400. This year cost ₹2880.', question:'Percentage increase in cost?', hint:'Increase=480. 480/2400×100', answer:20, options:[15,18,20,25], explain:'480/2400=0.2=20% increase!', displayAnswer:'20%', optionLabels:['15%','18%','20%','25%'] },
      { story:'You have ₹5000 for a party. Venue ₹1800, food ₹2200, decoration ₹800.', question:'How much is left for extras?', hint:'1800+2200+800=4800. 5000-4800', answer:200, options:[100,150,200,250], explain:'5000-4800=₹200 left!' },
      { story:'DJ charges ₹3600 for 4 hours. Discount of ₹600 if you book early.', question:'Cost per hour after discount?', hint:'3600-600=3000. 3000÷4', answer:750, options:[700,725,750,800], explain:'3000÷4=₹750/hour!' },
      { story:'Collected ₹250 each from 16 classmates for teacher\'s birthday gift.', question:'Total collection?', hint:'16 × 250', answer:4000, options:[3500,3750,4000,4500], explain:'16×250=₹4000!' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  //  🍱 SCHOOL CANTEEN
  // ──────────────────────────────────────────────────────────────────
  canteen: {
    1: [
      { story:'A samosa costs ₹5. You have ₹10 🪙.', question:'Can you buy 2 samosas?', hint:'2 × ₹5 = ₹10', answer:'Yes', options:['Yes','No'], explain:'2×5=₹10. You have exactly ₹10, so Yes!', optionLabels:['Yes ✅','No ❌'], displayAnswer:'Yes' },
      { story:'You have 3 biscuits 🍪. Your friend gives you 2 more.', question:'How many biscuits do you have now?', hint:'3 and 2 more', answer:5, options:[4,5,6,7], explain:'3 + 2 = 5 biscuits!' },
      { story:'Juice costs ₹5. Water costs ₹2. Which is cheaper?', question:'Which drink costs LESS?', hint:'₹2 is smaller than ₹5', answer:'Water', options:['Juice','Water'], explain:'₹2 < ₹5, so Water is cheaper!', optionLabels:['Juice 🧃','Water 💧'], displayAnswer:'Water' },
      { story:'You eat 4 grapes 🍇 and then 3 more.', question:'How many grapes did you eat?', hint:'4 and 3', answer:7, options:[6,7,8,9], explain:'4 + 3 = 7 grapes!' },
      { story:'Canteen has 8 idlis. 5 are sold.', question:'How many idlis are left?', hint:'8 take away 5', answer:3, options:[2,3,4,5], explain:'8 - 5 = 3 idlis left!' },
      { story:'A chocolate costs ₹3. Do you have enough with ₹2?', question:'Can you buy the chocolate?', hint:'Is ₹2 enough for ₹3?', answer:'No', options:['Yes','No'], explain:'₹2 < ₹3, so No!', optionLabels:['Yes ✅','No ❌'], displayAnswer:'No' },
      { story:'There are 5 tables in the canteen with 4 chairs each.', question:'How many chairs in total?', hint:'5 groups of 4', answer:20, options:[16,18,20,22], explain:'5 × 4 = 20 chairs!' },
      { story:'You have ₹10. Spend ₹4 on chips.', question:'How much is left?', hint:'10 - 4', answer:6, options:[5,6,7,8], explain:'10 - 4 = ₹6 left!' },
    ],
    2: [
      { story:'Samosa ₹12, juice ₹20. You have ₹50.', question:'How much for samosa and juice together?', hint:'12 + 20', answer:32, options:[28,30,32,35], explain:'12+20=₹32. ₹18 left!' },
      { story:'Idli costs ₹15 for 2 pieces. You want 6 idlis.', question:'Cost for 6 idlis?', hint:'6÷2=3 sets. 3×15', answer:45, options:[30,40,45,50], explain:'3 sets × ₹15 = ₹45!' },
      { story:'You have ₹50. Buy paratha ₹18 and lassi ₹22.', question:'How much change?', hint:'18+22=40. 50-40', answer:10, options:[5,8,10,15], explain:'50-40=₹10 change!' },
      { story:'Canteen sells 3 drinks: Juice ₹25, Lassi ₹20, Water ₹5.', question:'How much cheaper is water than juice?', hint:'25 - 5', answer:20, options:[15,18,20,22], explain:'25-5=₹20 cheaper!' },
      { story:'Vada pav ₹15, chai ₹10, 2 biscuits ₹5 each. You have ₹40.', question:'Total cost of all items?', hint:'15+10+2×5', answer:35, options:[30,33,35,40], explain:'15+10+10=₹35!' },
      { story:'You save ₹5 each day from pocket money. Lunch costs ₹35.', question:'How many days to save for lunch?', hint:'35 ÷ 5', answer:7, options:[5,6,7,8], explain:'35÷5=7 days!' },
      { story:'5 friends share a ₹130 thali. Each pays ₹30.', question:'How much money is left over?', hint:'5×30=150. 150-130', answer:20, options:[10,15,20,25], explain:'150-130=₹20 left!' },
      { story:'Canteen sells 12 packets in morning and 9 in lunch.', question:'Total packets sold?', hint:'12 + 9', answer:21, options:[19,20,21,22], explain:'12+9=21 packets!' },
    ],
    3: [
      { story:'Biryani ₹60 on Tuesday with 10% off. What is Tuesday price?', question:'Price with 10% discount?', hint:'10% of 60=6. 60-6', answer:54, options:[50,52,54,56], explain:'60-6=₹54 on Tuesday!' },
      { story:'Monday: 45 meals sold. Tuesday: 38. Wednesday: 52.', question:'Total meals sold in 3 days?', hint:'45+38+52', answer:135, options:[125,130,135,140], explain:'45+38+52=135 meals!' },
      { story:'Canteen earns ₹8 profit per meal. Sold 25 meals today.', question:'Total profit today?', hint:'25 × 8', answer:200, options:[175,190,200,215], explain:'25×8=₹200 profit!' },
      { story:'Full meal ₹55. Half portion ₹30. You order 2 full and 1 half.', question:'Total bill?', hint:'2×55 + 30', answer:140, options:[120,130,140,150], explain:'110+30=₹140!' },
      { story:'Canteen buys 50 eggs at ₹6 each. Uses 35 today.', question:'Cost of eggs used today?', hint:'35 × 6', answer:210, options:[190,200,210,220], explain:'35×6=₹210!' },
      { story:'Lunch combo: any main (₹45) + drink (₹15) = ₹55 combo. How much saved?', question:'Saving with combo?', hint:'45+15=60. 60-55', answer:5, options:[3,4,5,6], explain:'60-55=₹5 saved with combo!' },
      { story:'Canteen collects ₹3,450 in a week (5 days). Average per day?', question:'Average daily collection?', hint:'3450 ÷ 5', answer:690, options:[650,670,690,710], explain:'3450÷5=₹690/day!' },
      { story:'Ice cream ₹25. Buy 2 get 1 free. You buy 6.', question:'How much do you pay for 6 ice creams?', hint:'Buy 2 get 1 free → pay for 4 to get 6. 4×25', answer:100, options:[90,100,110,120], explain:'Buy 4, get 2 free. 4×25=₹100!' },
    ],
    4: [
      { story:'Canteen profit margin is 40% on cost. A meal costs ₹35 to make.', question:'What is the selling price?', hint:'Profit=40% of 35=14. Price=35+14', answer:49, options:[45,47,49,51], explain:'35+14=₹49 selling price!' },
      { story:'Monthly canteen revenue ₹1,80,000. Expenses ₹1,26,000.', question:'Monthly profit?', hint:'1,80,000 - 1,26,000', answer:54000, options:[48000,51000,54000,57000], explain:'1,80,000-1,26,000=₹54,000 profit!', displayAnswer:'₹54,000', optionLabels:['₹48,000','₹51,000','₹54,000','₹57,000'] },
      { story:'GST on food is 5%. Meal costs ₹80 before GST.', question:'Price with GST?', hint:'5% of 80=4. 80+4', answer:84, options:[82,83,84,85], explain:'80+4=₹84 with GST!' },
      { story:'Canteen serves 120 students. 60% have veg, rest non-veg. Veg meal ₹45, non-veg ₹65.', question:'Total canteen bill for all students?', hint:'72 veg: 72×45. 48 non-veg: 48×65', answer:6360, options:[6000,6200,6360,6500], explain:'3240+3120=₹6360!', displayAnswer:'₹6,360', optionLabels:['₹6,000','₹6,200','₹6,360','₹6,500'] },
      { story:'Canteen raised meal price by 12% from ₹50.', question:'New price after 12% increase?', hint:'12% of 50=6. 50+6', answer:56, options:[54,55,56,57], explain:'50+6=₹56 new price!' },
      { story:'Student uses ₹1500 canteen card. Spends ₹85/day for 12 days.', question:'Balance remaining?', hint:'12×85=1020. 1500-1020', answer:480, options:[420,450,480,510], explain:'1500-1020=₹480 left!' },
      { story:'Canteen collects ₹850 in ₹10 and ₹20 notes equally split in count.', question:'If equal number of ₹10 and ₹20 notes, how many of each?', hint:'Let n=count. 10n+20n=850. 30n=850→ n≈28', answer:28, options:[24,26,28,30], explain:'30n=850 → n≈28 of each note!' },
      { story:'3 friends share lunch: A pays ₹120, B pays ₹90, C pays ₹150. Split equally.', question:'How much should each person actually pay?', hint:'(120+90+150) ÷ 3', answer:120, options:[110,115,120,125], explain:'360÷3=₹120 each. A=even, B owes ₹30, C gets ₹30 back!' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  //  🚌 CITY BUS TRIP
  // ──────────────────────────────────────────────────────────────────
  travel: {
    1: [
      { story:'The bus has 5 red seats and 5 blue seats.', question:'How many seats in total?', hint:'5 and 5', answer:10, options:[8,9,10,11], explain:'5 + 5 = 10 seats!' },
      { story:'You travel 3 stops to school. Coming back is also 3 stops.', question:'Total stops in a day?', hint:'3 going + 3 coming back', answer:6, options:[4,5,6,7], explain:'3 + 3 = 6 stops!' },
      { story:'Bus ticket costs ₹5. Papa gives you ₹10.', question:'How much change do you get?', hint:'10 - 5', answer:5, options:[3,4,5,6], explain:'10 - 5 = ₹5 change!' },
      { story:'There are 4 people at the bus stop. 2 more arrive.', question:'How many people are waiting?', hint:'4 and 2 more', answer:6, options:[5,6,7,8], explain:'4 + 2 = 6 people!' },
      { story:'Bus number 7 comes at 8 o\'clock. Bus number 8 comes 2 hours later.', question:'When does bus number 8 come?', hint:'8 o\'clock + 2 hours', answer:10, options:[9,10,11,12], explain:'8 + 2 = 10 o\'clock!', displayAnswer:'10 o\'clock', optionLabels:['9 o\'clock','10 o\'clock','11 o\'clock','12 o\'clock'] },
      { story:'You board the bus with 6 people. At the next stop 3 people get off.', question:'How many people are left on the bus?', hint:'6 take away 3', answer:3, options:[2,3,4,5], explain:'6 - 3 = 3 people!' },
      { story:'Auto has 3 wheels. How many wheels on 2 autos?', question:'Total wheels?', hint:'3 × 2', answer:6, options:[4,5,6,7], explain:'3 × 2 = 6 wheels!' },
      { story:'Bus fare is ₹3. You travel 2 days.', question:'Total fare for 2 days (one way)?', hint:'3 × 2', answer:6, options:[4,5,6,7], explain:'3 × 2 = ₹6!' },
    ],
    2: [
      { story:'Bus ticket ₹12. You travel 5 days a week (one way only).', question:'Weekly bus fare?', hint:'12 × 5', answer:60, options:[50,55,60,65], explain:'12 × 5 = ₹60 per week!' },
      { story:'Train to Nana ji: ₹45 per person. Family of 4.', question:'Total train cost?', hint:'4 × 45', answer:180, options:[160,170,180,190], explain:'4 × 45 = ₹180!' },
      { story:'You have ₹100. Bus to mall ₹18 one way. Do you have enough for return?', question:'Return bus fare?', hint:'2 × 18', answer:36, options:[30,34,36,40], explain:'2×18=₹36. ₹36 < ₹100, Yes!' },
      { story:'Metro card ₹100. Each ride ₹20. How many rides?', question:'Number of rides?', hint:'100 ÷ 20', answer:5, options:[4,5,6,7], explain:'100÷20=5 rides!' },
      { story:'Bus arrives 8:15 AM. Journey 30 minutes. What time do you reach?', question:'Arrival time?', hint:'8:15 + 30 min', answer:'8:45 AM', options:['8:30 AM','8:40 AM','8:45 AM','9:00 AM'], explain:'8:15 + 30 min = 8:45 AM!', displayAnswer:'8:45 AM', optionLabels:['8:30 AM','8:40 AM','8:45 AM','9:00 AM'] },
      { story:'Rickshaw costs ₹15 for first km, ₹8 for each extra km. You travel 3 km.', question:'Total fare?', hint:'15 + 2×8', answer:31, options:[27,29,31,33], explain:'15+16=₹31!' },
      { story:'School trip: 30 students, bus costs ₹900 total.', question:'Cost per student?', hint:'900 ÷ 30', answer:30, options:[25,28,30,32], explain:'900÷30=₹30 per student!' },
      { story:'Journey of 40 km. Bus travels 20 km/hour. How long?', question:'Journey time?', hint:'40 ÷ 20 = 2 hours', answer:2, options:[1,1.5,2,2.5], explain:'40÷20=2 hours!', displayAnswer:'2 hours', optionLabels:['1 hour','1.5 hours','2 hours','2.5 hours'] },
    ],
    3: [
      { story:'Auto fare: ₹15 first 2 km, then ₹8/km. You travel 5 km.', question:'Total auto fare?', hint:'15 + 3×8', answer:39, options:[35,37,39,41], explain:'15+24=₹39!' },
      { story:'School trip 24 students × ₹250 each.', question:'Total collection?', hint:'24 × 250', answer:6000, options:[5500,5750,6000,6500], explain:'24×250=₹6000!' },
      { story:'Metro card: ₹200. Each ride ₹25. How many rides?', question:'Number of rides?', hint:'200 ÷ 25', answer:8, options:[6,7,8,9], explain:'200÷25=8 rides!' },
      { story:'Bus journey 45 km at 45 km/h. What time does it take?', question:'Journey time?', hint:'45÷45=1', answer:1, options:[0.5,1,1.5,2], explain:'45÷45=1 hour!', displayAnswer:'1 hour', optionLabels:['30 mins','1 hour','1.5 hours','2 hours'] },
      { story:'Daily commute costs ₹36 (return). Monthly (25 working days)?', question:'Monthly commute cost?', hint:'36 × 25', answer:900, options:[800,850,900,950], explain:'36×25=₹900/month!' },
      { story:'Train: Class AC ₹450, Sleeper ₹180. Family: 2 AC + 3 Sleeper.', question:'Total train fare?', hint:'2×450 + 3×180', answer:1440, options:[1200,1350,1440,1500], explain:'900+540=₹1440!' },
      { story:'Bus collects ₹12 from each of 45 passengers.', question:'Total fare collected?', hint:'45 × 12', answer:540, options:[500,520,540,560], explain:'45×12=₹540!' },
      { story:'Distance = 60 km. Car uses 1 litre per 15 km. Petrol ₹100/litre.', question:'Petrol cost for the trip?', hint:'60÷15=4 litres. 4×100', answer:400, options:[350,375,400,425], explain:'4×100=₹400 petrol!' },
    ],
    4: [
      { story:'Train ticket ₹450 + 5% GST. Booking fee ₹30.', question:'Total amount paid?', hint:'5% of 450=22.5. 450+22.5+30', answer:503, options:[495,500,503,510], explain:'472.5+30=₹502.5≈₹503!', displayAnswer:'₹502.50', optionLabels:['₹495','₹500','₹502.50','₹510'] },
      { story:'Cab charges ₹12/km + ₹50 base fare. Journey 18 km. 10% tip.', question:'Total amount including tip?', hint:'12×18+50=266. +10%', answer:293, options:[280,286,293,300], explain:'266+26.6≈₹293!' },
      { story:'Monthly pass ₹1200. Daily ticket ₹55, 22 working days/month.', question:'How much saved with monthly pass?', hint:'22×55=1210. Saving=1210-1200', answer:10, options:[5,8,10,15], explain:'1210-1200=₹10 saved!' },
      { story:'Family trip 320 km. Car: ₹6/km. Train: ₹180/person for 5 people.', question:'Which is cheaper and by how much?', hint:'Car: 320×6=1920. Train: 5×180=900', answer:900, options:[800,850,900,1000], explain:'Train ₹900 vs Car ₹1920. Train saves ₹1020!', displayAnswer:'Train ₹900', optionLabels:['Train ₹800','Train ₹850','Train ₹900','Train ₹1000'] },
      { story:'Petrol ₹105/litre. Car gives 14 km/litre. Trip of 210 km.', question:'Total petrol cost?', hint:'210÷14=15 litres. 15×105', answer:1575, options:[1400,1500,1575,1650], explain:'15×105=₹1575!' },
      { story:'Bus company profit ₹3,60,000/year on 12 buses.', question:'Profit per bus per month?', hint:'360000÷12=30000. 30000÷12', answer:2500, options:[2000,2250,2500,2750], explain:'30000÷12=₹2500/bus/month!' },
      { story:'Auto driver earns ₹850/day. Works 26 days. Monthly expenses ₹8500.', question:'Monthly savings?', hint:'26×850=22100. 22100-8500', answer:13600, options:[12000,13000,13600,14000], explain:'22100-8500=₹13,600!', displayAnswer:'₹13,600', optionLabels:['₹12,000','₹13,000','₹13,600','₹14,000'] },
      { story:'Flight ticket: adult ₹4500, child (under 12) 75% of adult price. 2 adults + 1 child.', question:'Total ticket cost?', hint:'2×4500 + 0.75×4500', answer:12375, options:[11000,12000,12375,13000], explain:'9000+3375=₹12,375!', displayAnswer:'₹12,375', optionLabels:['₹11,000','₹12,000','₹12,375','₹13,000'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  //  🎡 DUSSEHRA MELA
  // ──────────────────────────────────────────────────────────────────
  mela: {
    1: [
      { story:'You have 10 tokens 🎟️. You use 3 for a ride.', question:'How many tokens are left?', hint:'10 take away 3', answer:7, options:[6,7,8,9], explain:'10 - 3 = 7 tokens!' },
      { story:'Cotton candy costs ₹5. You buy 2.', question:'How much do you spend?', hint:'₹5 twice', answer:10, options:[8,9,10,11], explain:'5 + 5 = ₹10!' },
      { story:'3 friends go on a ride together. Each ticket costs ₹4.', question:'Total ticket cost?', hint:'3 × ₹4', answer:12, options:[10,11,12,13], explain:'3 × 4 = ₹12!' },
      { story:'You play a game and win 4 prizes 🎁. You give 2 to your sister.', question:'How many prizes do you keep?', hint:'4 take away 2', answer:2, options:[1,2,3,4], explain:'4 - 2 = 2 prizes!' },
      { story:'Mela opens at 5 PM and closes at 9 PM.', question:'How many hours is the mela open?', hint:'9 - 5', answer:4, options:[3,4,5,6], explain:'9 - 5 = 4 hours!' },
      { story:'Balloon game: 5 balloons to pop. You pop 3.', question:'How many balloons are left?', hint:'5 take away 3', answer:2, options:[1,2,3,4], explain:'5 - 3 = 2 balloons left!' },
      { story:'Papa buys 3 bhel puris at ₹10 each.', question:'How much does Papa pay?', hint:'3 × ₹10', answer:30, options:[25,28,30,33], explain:'3 × 10 = ₹30!' },
      { story:'You have ₹20 and spend ₹15 on snacks.', question:'How much money is left?', hint:'20 - 15', answer:5, options:[3,4,5,6], explain:'20 - 15 = ₹5 left!' },
    ],
    2: [
      { story:'Giant Wheel ₹40, Merry-go-round ₹30, Shooting game ₹25. You have ₹200.', question:'If you do all 3, how much is left?', hint:'40+30+25=95. 200-95', answer:105, options:[90,100,105,110], explain:'200-95=₹105 left!' },
      { story:'Entry ticket ₹50/child, ₹80/adult. Family: 2 adults + 2 children.', question:'Total entry cost?', hint:'2×80 + 2×50', answer:260, options:[240,250,260,280], explain:'160+100=₹260!' },
      { story:'Bhel puri ₹30, Pani puri ₹25. You buy both.', question:'Food cost?', hint:'30 + 25', answer:55, options:[45,50,55,60], explain:'30+25=₹55!' },
      { story:'A game booth: 3 rings for ₹30. You want 9 rings.', question:'Total cost?', hint:'9÷3=3 sets. 3×30', answer:90, options:[80,85,90,95], explain:'3×30=₹90!' },
      { story:'You spent ₹65 food, ₹80 rides, ₹40 games. Started with ₹200.', question:'Pocket money left?', hint:'65+80+40=185. 200-185', answer:15, options:[5,10,15,20], explain:'200-185=₹15 left!' },
      { story:'Cotton candy ₹20. Buy for yourself and 3 friends.', question:'Total cotton candy cost?', hint:'4 × 20', answer:80, options:[60,70,80,90], explain:'4×20=₹80!' },
      { story:'Ride tokens: 4 for ₹80. How much is 1 token?', question:'Cost of 1 token?', hint:'80 ÷ 4', answer:20, options:[15,18,20,22], explain:'80÷4=₹20 per token!' },
      { story:'You win a prize worth ₹80. Friend wins ₹120.', question:'Combined prize value?', hint:'80 + 120', answer:200, options:[180,190,200,210], explain:'80+120=₹200!' },
    ],
    3: [
      { story:'Mela for 3 hours. Rides (₹45/hour), food (₹60 total), games (₹35 total).', question:'Total spending if you ride for all 3 hours?', hint:'3×45 + 60 + 35', answer:230, options:[210,220,230,240], explain:'135+60+35=₹230!' },
      { story:'Raffle tickets: 5 for ₹100. You buy 20 tickets.', question:'Total cost?', hint:'20÷5=4 sets. 4×100', answer:400, options:[350,375,400,425], explain:'4×100=₹400!' },
      { story:'Stall sells 180 samosas in 3 hours. Same rate each hour.', question:'How many samosas per hour?', hint:'180 ÷ 3', answer:60, options:[50,55,60,65], explain:'180÷3=60 samosas/hour!' },
      { story:'Giant Wheel capacity: 12 people per ride. Mela runs 80 rides.', question:'Maximum people served?', hint:'12 × 80', answer:960, options:[840,900,960,1020], explain:'12×80=960 people!' },
      { story:'Mela budget ₹500. Food 40%, rides 35%, games 25%.', question:'Amount for rides?', hint:'35% of 500', answer:175, options:[150,165,175,190], explain:'35%×500=₹175 for rides!' },
      { story:'Special Dussehra discount: 25% off all rides. Ride was ₹60.', question:'Discounted price?', hint:'25% of 60=15. 60-15', answer:45, options:[40,42,45,48], explain:'60-15=₹45!' },
      { story:'Stall earns ₹24 per customer. Serves 85 customers.', question:'Total earnings?', hint:'85 × 24', answer:2040, options:[1920,1980,2040,2100], explain:'85×24=₹2040!' },
      { story:'Evening show tickets: balcony ₹150, ground ₹80. 120 balcony + 200 ground sold.', question:'Total ticket revenue?', hint:'120×150 + 200×80', answer:34000, options:[30000,32000,34000,36000], explain:'18000+16000=₹34,000!', displayAnswer:'₹34,000', optionLabels:['₹30,000','₹32,000','₹34,000','₹36,000'] },
    ],
    4: [
      { story:'Mela ground rent ₹25,000. Stall income ₹48,000. Expenses ₹15,000.', question:'Net profit of mela organiser?', hint:'48000-25000-15000', answer:8000, options:[6000,7000,8000,9000], explain:'48000-40000=₹8,000 profit!', displayAnswer:'₹8,000', optionLabels:['₹6,000','₹7,000','₹8,000','₹9,000'] },
      { story:'Food stall revenue ₹12,600 over 3 days. Day 2 was 40% of total.', question:'Day 2 revenue?', hint:'40% of 12600', answer:5040, options:[4800,4900,5040,5200], explain:'0.4×12600=₹5,040!', displayAnswer:'₹5,040', optionLabels:['₹4,800','₹4,900','₹5,040','₹5,200'] },
      { story:'Ride costs ₹80. Student discount 12.5%. How much do students pay?', question:'Student price?', hint:'12.5% of 80=10. 80-10', answer:70, options:[65,68,70,72], explain:'80-10=₹70 for students!' },
      { story:'Mela sold 2400 tickets. Adults 60%, children 40%. Adult ₹100, child ₹60.', question:'Total ticket collection?', hint:'1440×100 + 960×60', answer:201600, options:[190000,196000,201600,210000], explain:'144000+57600=₹2,01,600!', displayAnswer:'₹2,01,600', optionLabels:['₹1,90,000','₹1,96,000','₹2,01,600','₹2,10,000'] },
      { story:'Stall bought 500 kg of food at ₹80/kg, wasted 10%, sold rest at ₹150/kg.', question:'Profit from food stall?', hint:'Cost=40000. Sold=450×150=67500. Profit=67500-40000', answer:27500, options:[24000,25500,27500,29000], explain:'67500-40000=₹27,500 profit!', displayAnswer:'₹27,500', optionLabels:['₹24,000','₹25,500','₹27,500','₹29,000'] },
      { story:'Annual mela income grew from ₹8 lakh to ₹10 lakh.', question:'Percentage growth?', hint:'Increase=2 lakh. 2/8×100', answer:25, options:[20,22,25,28], explain:'2/8×100=25% growth!', displayAnswer:'25%', optionLabels:['20%','22%','25%','28%'] },
      { story:'Handicraft stall: 60 items at ₹250 each. 15% sold at 20% discount, rest at full price.', question:'Total revenue?', hint:'9 items at 200 + 51 at 250', answer:14550, options:[13500,14000,14550,15000], explain:'1800+12750=₹14,550!', displayAnswer:'₹14,550', optionLabels:['₹13,500','₹14,000','₹14,550','₹15,000'] },
      { story:'Mela running cost ₹4500/hour for 8 hours, plus ₹12000 fixed cost.', question:'Total mela cost?', hint:'8×4500 + 12000', answer:48000, options:[44000,46000,48000,50000], explain:'36000+12000=₹48,000!', displayAnswer:'₹48,000', optionLabels:['₹44,000','₹46,000','₹48,000','₹50,000'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  //  🏏 CRICKET TEAM SNACKS
  // ──────────────────────────────────────────────────────────────────
  cricket: {
    1: [
      { story:'Your cricket team has 6 players. The other team has 5 players.', question:'How many players altogether?', hint:'6 and 5', answer:11, options:[10,11,12,13], explain:'6 + 5 = 11 players!' },
      { story:'You score 3 runs 🏏 and your friend scores 4 runs.', question:'Total runs?', hint:'3 and 4', answer:7, options:[6,7,8,9], explain:'3 + 4 = 7 runs!' },
      { story:'Each player gets 2 biscuits 🍪. There are 5 players.', question:'Total biscuits needed?', hint:'5 × 2', answer:10, options:[8,9,10,11], explain:'5 × 2 = 10 biscuits!' },
      { story:'Team needs 10 runs to win. They score 7 more.', question:'Runs still needed?', hint:'10 take away 7', answer:3, options:[2,3,4,5], explain:'10 - 7 = 3 runs needed!' },
      { story:'6 juice boxes for 6 players. 2 players don\'t want one.', question:'How many juice boxes are used?', hint:'6 take away 2', answer:4, options:[3,4,5,6], explain:'6 - 2 = 4 juice boxes used!' },
      { story:'Cricket ball costs ₹20. Team needs 3 balls.', question:'Total cost?', hint:'3 × ₹20', answer:60, options:[50,55,60,65], explain:'3 × 20 = ₹60!' },
      { story:'In 3 overs, you scored 4, 6, and 2 runs.', question:'Total runs in 3 overs?', hint:'4 + 6 + 2', answer:12, options:[10,11,12,13], explain:'4 + 6 + 2 = 12 runs!' },
      { story:'Team brought 8 oranges 🍊. They ate 5 at half time.', question:'Oranges left for after the match?', hint:'8 take away 5', answer:3, options:[2,3,4,5], explain:'8 - 5 = 3 oranges left!' },
    ],
    2: [
      { story:'11 players each contribute ₹20 for snacks.', question:'Total money collected?', hint:'11 × 20', answer:220, options:[200,210,220,230], explain:'11 × 20 = ₹220!' },
      { story:'2 packets chips ₹20 each, 11 cold drinks ₹15 each.', question:'Total snack cost?', hint:'2×20 + 11×15', answer:205, options:[185,195,205,215], explain:'40+165=₹205!' },
      { story:'Team collected ₹220. Snacks cost ₹165.', question:'Leftover shared equally among 11 players. Each player gets?', hint:'220-165=55. 55÷11', answer:5, options:[4,5,6,7], explain:'55÷11=₹5 each!' },
      { story:'Match target: 85 runs. Team scored 63.', question:'Runs needed?', hint:'85 - 63', answer:22, options:[18,20,22,25], explain:'85-63=22 runs needed!' },
      { story:'5 overs: 8, 12, 6, 15, 9 runs.', question:'Total score?', hint:'8+12+6+15+9', answer:50, options:[45,48,50,52], explain:'Sum of all = 50 runs!' },
      { story:'Cricket bat ₹350. Team buys 2 bats.', question:'Total cost?', hint:'2 × 350', answer:700, options:[600,650,700,750], explain:'2×350=₹700!' },
      { story:'11 players drink 2 bottles water ₹15 each during match.', question:'Total water cost?', hint:'11×2=22 bottles. 22×15', answer:330, options:[300,315,330,345], explain:'22×15=₹330!' },
      { story:'Winning team gets ₹500 prize. Split equally among 11.', question:'Each player gets approximately?', hint:'500 ÷ 11 ≈ ?', answer:45, options:[40,42,45,48], explain:'500÷11≈₹45 each!' },
    ],
    3: [
      { story:'3 balls ₹120 each, 2 bats ₹350 each.', question:'Total equipment cost?', hint:'3×120 + 2×350', answer:1060, options:[960,1000,1060,1100], explain:'360+700=₹1060!' },
      { story:'Tournament: 8 teams × ₹500 entry fee.', question:'Total entry collection?', hint:'8 × 500', answer:4000, options:[3500,3750,4000,4500], explain:'8×500=₹4000!' },
      { story:'Team average: 7.5 runs/over for 20 overs.', question:'Total score?', hint:'7.5 × 20', answer:150, options:[140,145,150,155], explain:'7.5×20=150 runs!' },
      { story:'Match played over 2 days. Day 1: 180 runs. Day 2 target 220.', question:'How many more runs needed on Day 2?', hint:'220 - 180', answer:40, options:[30,35,40,45], explain:'220-180=40 more runs!' },
      { story:'11 players equally share ₹1650 prize money.', question:'Each player gets?', hint:'1650 ÷ 11', answer:150, options:[130,140,150,160], explain:'1650÷11=₹150 each!' },
      { story:'Snacks budget ₹750. Chips 40%, drinks 35%, fruits 25%.', question:'Amount spent on drinks?', hint:'35% of 750', answer:263, options:[245,255,263,275], explain:'35%×750=₹262.5≈₹263!' },
      { story:'Ground rent ₹2400 for 4 hours. Each team pays half.', question:'Each team\'s share per hour?', hint:'2400÷2=1200. 1200÷4', answer:300, options:[250,275,300,325], explain:'1200÷4=₹300/hour/team!' },
      { story:'Player A scored 45, B scored 38, C scored 29 in an innings.', question:'Combined score of all 3?', hint:'45+38+29', answer:112, options:[104,108,112,116], explain:'45+38+29=112 runs!' },
    ],
    4: [
      { story:'Sponsorship: ₹50,000. Expenses: ground ₹15,000, equipment ₹8,000, food ₹7,000.', question:'Net surplus for prize money?', hint:'50000-(15000+8000+7000)', answer:20000, options:[18000,19000,20000,21000], explain:'50000-30000=₹20,000!', displayAnswer:'₹20,000', optionLabels:['₹18,000','₹19,000','₹20,000','₹21,000'] },
      { story:'Batsman scores average 45 runs in 12 innings. Total runs scored?', question:'Total runs?', hint:'45 × 12', answer:540, options:[500,520,540,560], explain:'45×12=540 runs!' },
      { story:'Run rate needed: 8.5/over. 8 overs left. Currently 92 runs.', question:'Target total?', hint:'8×8.5=68. 92+68', answer:160, options:[150,155,160,165], explain:'92+68=160 runs target!' },
      { story:'Tournament prize: Winner ₹25,000, Runner-up ₹15,000, 3rd ₹8,000. 3rd place team of 15 players.', question:'Each player\'s share for 3rd place?', hint:'8000 ÷ 15', answer:533, options:[500,520,533,550], explain:'8000÷15≈₹533 each!', displayAnswer:'≈₹533', optionLabels:['₹500','₹520','≈₹533','₹550'] },
      { story:'Cricket ball cost increased 20% to ₹144. What was the original price?', question:'Original price?', hint:'Original × 1.2 = 144. Original = 144÷1.2', answer:120, options:[110,115,120,125], explain:'144÷1.2=₹120 original!' },
      { story:'Stadium capacity 8000. Match 1: 75% full. Match 2: 90% full.', question:'Combined attendance?', hint:'8000×0.75 + 8000×0.90', answer:13200, options:[12000,12600,13200,14000], explain:'6000+7200=13,200 total!', displayAnswer:'13,200', optionLabels:['12,000','12,600','13,200','14,000'] },
      { story:'Kit cost: bat ₹1800, pads ₹1200, gloves ₹600, helmet ₹900. 25% team discount.', question:'Total cost after discount?', hint:'Total=4500. 25% of 4500=1125. 4500-1125', answer:3375, options:[3000,3250,3375,3500], explain:'4500-1125=₹3,375!', displayAnswer:'₹3,375', optionLabels:['₹3,000','₹3,250','₹3,375','₹3,500'] },
      { story:'Bowler takes wicket every 18 balls on average. In 25 overs (150 balls), how many wickets expected?', question:'Expected wickets?', hint:'150 ÷ 18', answer:8, options:[7,8,9,10], explain:'150÷18≈8 wickets!' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  //  📱 MOBILE RECHARGE
  // ──────────────────────────────────────────────────────────────────
  recharge: {
    1: [
      { story:'Bhaiya has 5 contacts 📱. He adds 3 more.', question:'How many contacts now?', hint:'5 and 3 more', answer:8, options:[7,8,9,10], explain:'5 + 3 = 8 contacts!' },
      { story:'Phone battery is at 3 bars. It needs 5 bars to be full.', question:'How many more bars needed?', hint:'5 take away 3', answer:2, options:[1,2,3,4], explain:'5 - 3 = 2 more bars!' },
      { story:'Recharge coupon costs ₹10. You have ₹15.', question:'How much money is left after buying?', hint:'15 - 10', answer:5, options:[3,4,5,6], explain:'15 - 10 = ₹5 left!' },
      { story:'Didi gets 4 messages in the morning and 3 in the evening.', question:'Total messages?', hint:'4 and 3', answer:7, options:[5,6,7,8], explain:'4 + 3 = 7 messages!' },
      { story:'Plan has 3 days left. After 3 more days it will expire.', question:'When does it expire from today?', hint:'3 + 3', answer:6, options:[5,6,7,8], explain:'3 + 3 = 6 days from today!', displayAnswer:'In 6 days', optionLabels:['In 5 days','In 6 days','In 7 days','In 8 days'] },
      { story:'2 phones need recharging. Each recharge costs ₹10.', question:'Total cost?', hint:'2 × ₹10', answer:20, options:[15,18,20,22], explain:'2 × 10 = ₹20!' },
      { story:'Phone rings 5 times. Bhaiya picks up on the 3rd ring.', question:'How many times did it ring before he picked up?', hint:'3 - 1 = ? (before picking up)', answer:2, options:[1,2,3,4], explain:'Rings 1, 2 before the 3rd (when picked up) = 2 rings!' },
      { story:'You have ₹20. A game app costs ₹8.', question:'Can you buy 2 app games?', hint:'2 × ₹8 = ₹16', answer:'Yes', options:['Yes','No'], explain:'2×8=₹16. ₹20>₹16, so Yes!', optionLabels:['Yes ✅','No ❌'], displayAnswer:'Yes' },
    ],
    2: [
      { story:'Plan A: ₹49 for 7 days. Plan B: ₹149 for 28 days.', question:'Which plan is cheaper per day? Cost/day for Plan A?', hint:'49 ÷ 7', answer:7, options:[5,6,7,8], explain:'₹49÷7=₹7/day. Plan B=₹149÷28≈₹5.3/day. Plan B better!', displayAnswer:'₹7/day', optionLabels:['₹5/day','₹6/day','₹7/day','₹8/day'] },
      { story:'Balance: ₹80. Call costs ₹1/minute. Bhaiya talks 45 minutes.', question:'Balance after call?', hint:'80 - 45', answer:35, options:[25,30,35,40], explain:'80-45=₹35 left!' },
      { story:'Plan gives 300 MB per day. You use 200 MB. How much is left?', question:'Unused data today?', hint:'300 - 200', answer:100, options:[80,90,100,110], explain:'300-200=100 MB left!', displayAnswer:'100 MB', optionLabels:['80 MB','90 MB','100 MB','110 MB'] },
      { story:'Monthly recharge ₹199. How much for 3 months?', question:'3-month cost?', hint:'199 × 3', answer:597, options:[557,577,597,617], explain:'199×3=₹597!' },
      { story:'Phone has ₹50 balance. SMS costs ₹1 each. You send 32 SMS.', question:'Balance left?', hint:'50 - 32', answer:18, options:[14,16,18,20], explain:'50-32=₹18 left!' },
      { story:'Recharge ₹200. Each call minute ₹2. You talk 60 minutes.', question:'Balance after calls?', hint:'60×2=120. 200-120', answer:80, options:[60,70,80,90], explain:'200-120=₹80 left!' },
      { story:'2 phones. Phone 1: ₹149 plan. Phone 2: ₹99 plan.', question:'Total monthly recharge cost?', hint:'149 + 99', answer:248, options:[228,238,248,258], explain:'149+99=₹248!' },
      { story:'Daily data 1.5 GB. You used 0.8 GB by afternoon.', question:'Data left for evening?', hint:'1.5 - 0.8', answer:0.7, options:[0.5,0.6,0.7,0.8], explain:'1.5-0.8=0.7 GB left!', displayAnswer:'0.7 GB', optionLabels:['0.5 GB','0.6 GB','0.7 GB','0.8 GB'] },
    ],
    3: [
      { story:'Plan A: ₹199 for 1 GB/day 28 days. Plan B: ₹249 for 2 GB/day 28 days.', question:'Extra data per day in Plan B?', hint:'2 - 1', answer:1, options:[0.5,1,1.5,2], explain:'Plan B gives 1 GB more per day!', displayAnswer:'1 GB', optionLabels:['0.5 GB','1 GB','1.5 GB','2 GB'] },
      { story:'Annual plan ₹3999 vs monthly ₹399. Saving per year?', question:'Annual saving?', hint:'399×12=4788. 4788-3999', answer:789, options:[700,750,789,800], explain:'4788-3999=₹789 saved!' },
      { story:'5 family members. Each needs ₹199/month recharge.', question:'Monthly family recharge cost?', hint:'5 × 199', answer:995, options:[895,945,995,1045], explain:'5×199=₹995!' },
      { story:'Balance ₹500. Per minute ₹0.50. Talk for 200 minutes.', question:'Balance remaining?', hint:'200×0.5=100. 500-100', answer:400, options:[350,375,400,425], explain:'500-100=₹400 left!' },
      { story:'Plan A: 2 GB for ₹200. Plan B: 5 GB for ₹400. Cost per GB?', question:'Cost per GB in Plan B?', hint:'400 ÷ 5', answer:80, options:[70,75,80,85], explain:'400÷5=₹80/GB. Plan A=₹100/GB. Plan B better!', displayAnswer:'₹80/GB', optionLabels:['₹70/GB','₹75/GB','₹80/GB','₹85/GB'] },
      { story:'Recharge every 28 days. Plan ₹249. Recharges in a year (365 days)?', question:'Approximate recharges per year?', hint:'365 ÷ 28 ≈ ?', answer:13, options:[11,12,13,14], explain:'365÷28≈13 recharges/year!' },
      { story:'Family plan: ₹999/month for 4 connections vs individual ₹299 each.', question:'Monthly saving with family plan?', hint:'4×299=1196. 1196-999', answer:197, options:[177,187,197,207], explain:'1196-999=₹197 saved!' },
      { story:'International call ₹5/minute. Bhaiya calls for 12 minutes.', question:'Call cost?', hint:'12 × 5', answer:60, options:[50,55,60,65], explain:'12×5=₹60!' },
    ],
    4: [
      { story:'Company gives 5 GB + 500 min calls + 100 SMS for ₹399. Used: 3.2 GB, 380 min, 75 SMS. Unused value at same rate?', question:'Approx value of unused data? (Data is ₹200 of plan)', hint:'Unused=1.8 GB. 1.8/5×200', answer:72, options:[64,68,72,76], explain:'1.8/5×200=₹72 unused data value!' },
      { story:'Telecom company has 20 lakh subscribers. Average revenue ₹250/subscriber/month.', question:'Annual revenue?', hint:'20,00,000 × 250 × 12', answer:600, options:[500,550,600,650], explain:'20L×250×12=₹600 crore!', displayAnswer:'₹600 crore', optionLabels:['₹500 crore','₹550 crore','₹600 crore','₹650 crore'] },
      { story:'Old plan ₹299 for 1.5 GB/day. New plan ₹349 for 2.5 GB/day. Extra cost per extra GB per day?', question:'Cost for extra 1 GB/day?', hint:'Extra cost=50. Extra data=1. But compare: 349/2.5 vs 299/1.5', answer:50, options:[40,45,50,55], explain:'₹50 more for 1 extra GB/day. New plan better value at ₹139.6/GB vs ₹199.3/GB!' },
      { story:'Broadband: ₹800/month for 100 Mbps vs ₹1200/month for 200 Mbps.', question:'Cost per Mbps for cheaper plan?', hint:'800 ÷ 100', answer:8, options:[6,7,8,9], explain:'800÷100=₹8/Mbps. Other=₹6/Mbps → costlier plan is better value!', displayAnswer:'₹8/Mbps', optionLabels:['₹6/Mbps','₹7/Mbps','₹8/Mbps','₹9/Mbps'] },
      { story:'Data rollover: unused data from today rolls to tomorrow. Mon: 1 GB unused. Tue: used 1.8 GB. Daily limit 1.5 GB.', question:'Data deficit on Tuesday?', hint:'Available=1.5+1=2.5. Used=1.8. Left=?', answer:0.7, options:[0.5,0.6,0.7,0.8], explain:'2.5-1.8=0.7 GB left after rollover!', displayAnswer:'0.7 GB left', optionLabels:['0.5 GB left','0.6 GB left','0.7 GB left','0.8 GB left'] },
      { story:'Plan costs ₹399/28 days. What is the daily cost? (Round to nearest paisa)', question:'Daily cost?', hint:'399 ÷ 28', answer:14.25, options:[13.00,13.75,14.25,14.50], explain:'399÷28=₹14.25/day!', displayAnswer:'₹14.25', optionLabels:['₹13.00','₹13.75','₹14.25','₹14.50'] },
      { story:'Papa\'s phone bill: calls ₹320, data ₹199, SMS ₹15. 18% GST on total.', question:'Final bill with GST?', hint:'Total=534. 18% of 534=96.12. 534+96', answer:630, options:[600,615,630,645], explain:'534+96≈₹630!' },
      { story:'Bhaiya uses 2.3 GB/day on avg. Plan gives 1.5 GB/day. Extra data ₹25/GB.', question:'Extra daily data cost?', hint:'Extra=2.3-1.5=0.8 GB. 0.8×25', answer:20, options:[15,18,20,22], explain:'0.8×25=₹20 extra/day!' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  //  💡 ELECTRICITY BILL (paid/locked)
  // ──────────────────────────────────────────────────────────────────
  electricity: {
    1: [
      { story:'There are 3 fans and 2 lights in your house.', question:'How many electrical items total?', hint:'3 and 2', answer:5, options:[4,5,6,7], explain:'3 + 2 = 5 items!' },
      { story:'You turn off 2 lights when leaving a room with 4 lights on.', question:'How many lights still on?', hint:'4 take away 2', answer:2, options:[1,2,3,4], explain:'4 - 2 = 2 lights still on!' },
      { story:'Electricity bill is ₹200 this month and ₹150 last month.', question:'Which month was more expensive?', hint:'₹200 > ₹150', answer:'This month', options:['Last month','This month'], explain:'₹200 > ₹150, this month costs more!', optionLabels:['Last month','This month'], displayAnswer:'This month' },
      { story:'Papa replaces 4 old bulbs with new ones.', question:'If he had 6 old bulbs, how many old ones are left?', hint:'6 take away 4', answer:2, options:[1,2,3,4], explain:'6 - 4 = 2 old bulbs left!' },
      { story:'Fan runs for 3 hours in the morning and 2 hours in the evening.', question:'Total hours the fan runs?', hint:'3 + 2', answer:5, options:[4,5,6,7], explain:'3 + 2 = 5 hours total!' },
      { story:'You save electricity by switching off 1 fan. 5 fans were on.', question:'Fans still running?', hint:'5 take away 1', answer:4, options:[3,4,5,6], explain:'5 - 1 = 4 fans running!' },
      { story:'Bill this month: ₹180. Papa saves ₹30 next month.', question:'Next month\'s bill?', hint:'180 - 30', answer:150, options:[140,145,150,155], explain:'180 - 30 = ₹150!' },
      { story:'2 bedrooms, each with 2 fans. Total fans?', question:'Total fans in bedrooms?', hint:'2 × 2', answer:4, options:[3,4,5,6], explain:'2 × 2 = 4 fans!' },
    ],
    2: [
      { story:'Bill last month ₹450. This month ₹360. How much did you save?', question:'Money saved?', hint:'450 - 360', answer:90, options:[70,80,90,100], explain:'450-360=₹90 saved!' },
      { story:'Bulb uses 60 watts. Runs 5 hours/day. Total watts used per day?', question:'Daily watts used?', hint:'60 × 5', answer:300, options:[240,270,300,330], explain:'60×5=300 Wh per day!' },
      { story:'1 unit = 1000 Wh. TV uses 500 Wh per day. Units used in 2 days?', question:'Units used?', hint:'500×2=1000 Wh = 1 unit', answer:1, options:[0.5,1,1.5,2], explain:'1000 Wh = 1 unit in 2 days!', displayAnswer:'1 unit', optionLabels:['0.5 units','1 unit','1.5 units','2 units'] },
      { story:'₹6 per unit. You use 5 units this month.', question:'Electricity cost?', hint:'5 × 6', answer:30, options:[25,28,30,32], explain:'5×6=₹30!' },
      { story:'4 rooms, each with 1 light (40W). All on for 3 hours.', question:'Total watts used?', hint:'4×40×3', answer:480, options:[400,440,480,520], explain:'4×40=160W. 160×3=480 Wh!' },
      { story:'Monthly bill ₹340 for 4 weeks. Weekly cost?', question:'Cost per week?', hint:'340 ÷ 4', answer:85, options:[75,80,85,90], explain:'340÷4=₹85 per week!' },
      { story:'Papa says switch off when not in use. Save ₹15/month. Yearly saving?', question:'Annual saving?', hint:'15 × 12', answer:180, options:[160,170,180,190], explain:'15×12=₹180 per year!' },
      { story:'Old bulb 100W. LED bulb 10W. Same brightness. How much less power?', question:'Power saved per bulb?', hint:'100 - 10', answer:90, options:[80,85,90,95], explain:'100-10=90W saved per bulb!', displayAnswer:'90W', optionLabels:['80W','85W','90W','95W'] },
    ],
    3: [
      { story:'Bulb 60W, 5 hrs/day. Cost ₹6/unit. Daily cost?', question:'Daily electricity cost of bulb?', hint:'60×5=300Wh=0.3 units. 0.3×6', answer:1.8, options:[1.2,1.5,1.8,2.1], explain:'0.3×6=₹1.80/day!', displayAnswer:'₹1.80', optionLabels:['₹1.20','₹1.50','₹1.80','₹2.10'] },
      { story:'Fan 75W, 8 hrs/day. Units per day?', question:'Units used by fan per day?', hint:'75×8=600Wh. 600÷1000', answer:0.6, options:[0.4,0.5,0.6,0.7], explain:'600÷1000=0.6 units/day!', displayAnswer:'0.6 units', optionLabels:['0.4 units','0.5 units','0.6 units','0.7 units'] },
      { story:'AC 1500W, runs 6 hrs/day for 30 days. Cost ₹6/unit.', question:'Monthly AC bill?', hint:'1500×6×30÷1000×6', answer:1620, options:[1440,1530,1620,1710], explain:'1500×6=9000Wh/day=9 units. 9×30=270 units. 270×6=₹1620!', displayAnswer:'₹1,620', optionLabels:['₹1,440','₹1,530','₹1,620','₹1,710'] },
      { story:'Monthly bill ₹850. 25% is for AC. How much for AC?', question:'AC portion of bill?', hint:'25% of 850', answer:212.5, options:[200,207,212.5,220], explain:'25%×850=₹212.50!', displayAnswer:'₹212.50', optionLabels:['₹200','₹207','₹212.50','₹220'] },
      { story:'Replace 5 bulbs (100W each) with LEDs (10W each). 6 hrs/day. Monthly saving (₹6/unit, 30 days)?', question:'Monthly saving from 5 bulbs?', hint:'Saving per bulb=90W. Total=450W. 450×6×30÷1000×6', answer:48.6, options:[43,46,48.6,52], explain:'450W saved × 6hrs × 30days = 81kWh × ₹6 = ₹486 → per 5 bulbs = ₹486... Actually: 0.45kW×6h×30d=81units. 81×₹6=₹486 total saving!', displayAnswer:'₹486', optionLabels:['₹400','₹450','₹486','₹520'] },
      { story:'Geyser 2000W. Use 30 min/day. Monthly cost (₹6/unit, 30 days)?', question:'Monthly geyser cost?', hint:'2000×0.5hr=1000Wh/day=1unit. 30×6', answer:180, options:[150,165,180,195], explain:'1 unit/day × 30 days × ₹6 = ₹180!' },
      { story:'Bill slab: 0-100 units ₹3, 101-300 units ₹5. You use 180 units.', question:'Total bill?', hint:'100×3 + 80×5', answer:700, options:[600,650,700,750], explain:'300 + 400 = ₹700!' },
      { story:'Solar panel generates 4 units/day. Home uses 6 units/day. Grid rate ₹7/unit.', question:'Daily saving from solar?', hint:'4 units saved. 4×7', answer:28, options:[24,26,28,30], explain:'4×₹7=₹28 saved/day!' },
    ],
    4: [
      { story:'Monthly bill ₹2400. Solar panel installed, cuts bill by 65%.', question:'New monthly bill?', hint:'65% of 2400=1560. 2400-1560', answer:840, options:[780,810,840,870], explain:'2400-1560=₹840 new bill!' },
      { story:'Solar panel costs ₹1,20,000. Saves ₹1800/month.', question:'Payback period in months?', hint:'120000 ÷ 1800', answer:67, options:[60,63,67,70], explain:'120000÷1800≈67 months (5.5 yrs)!' },
      { story:'Washing machine: 500W, 45 min/day, 26 days/month. Monthly cost at ₹7/unit?', question:'Monthly washing machine cost?', hint:'500×0.75×26÷1000×7', answer:68.25, options:[60,65,68.25,72], explain:'0.5kW×0.75h×26d=9.75 units×₹7=₹68.25!', displayAnswer:'₹68.25', optionLabels:['₹60','₹65','₹68.25','₹72'] },
      { story:'Bill: 0-100 units ₹3/unit, 101-200 ₹5/unit, 201+ ₹7/unit. Usage 280 units.', question:'Total bill?', hint:'100×3 + 100×5 + 80×7', answer:1360, options:[1200,1280,1360,1440], explain:'300+500+560=₹1360!' },
      { story:'Factory uses 15,000 units/month at ₹8/unit. New machine cuts usage by 18%.', question:'Annual saving?', hint:'15000×0.18=2700 units/month saved. 2700×8×12', answer:259200, options:[240000,250000,259200,270000], explain:'2700×8×12=₹2,59,200/year!', displayAnswer:'₹2,59,200', optionLabels:['₹2,40,000','₹2,50,000','₹2,59,200','₹2,70,000'] },
      { story:'EV charges at 3.3 kW for 4 hours. Home rate ₹7/unit. Cost per charge?', question:'Charging cost?', hint:'3.3×4=13.2 units. 13.2×7', answer:92.4, options:[84,88,92.4,96], explain:'13.2×7=₹92.40!', displayAnswer:'₹92.40', optionLabels:['₹84','₹88','₹92.40','₹96'] },
      { story:'5-star AC uses 1.5 units/hr. 3-star uses 2.1 units/hr. 8 hrs/day, 90 days, ₹6/unit.', question:'Annual saving with 5-star vs 3-star?', hint:'Diff=0.6 units/hr. 0.6×8×90×6', answer:2592, options:[2200,2400,2592,2800], explain:'0.6×8×90×6=₹2,592 saved!', displayAnswer:'₹2,592', optionLabels:['₹2,200','₹2,400','₹2,592','₹2,800'] },
      { story:'Peak rate ₹9/unit (6 PM–10 PM), off-peak ₹4/unit. Shift 3 units from peak to off-peak.', question:'Daily saving?', hint:'3×(9-4)', answer:15, options:[12,13,15,18], explain:'3×5=₹15 saved daily!' },
    ],
  },
};

// ─── Get questions for a specific adventure + class ───────────────────
export function getAdventureQuestions(adventureId, classNum, count = 8) {
  const group = getClassGroup(classNum);
  const pool = (ADVENTURE_QUESTIONS[adventureId] || {})[group] || [];
  if (!pool.length) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(q => ({
    ...q,
    options: q.optionLabels || q.options.map(String),
    correct_answer: q.displayAnswer || String(q.answer),
    scenario: q.story,
    question: q.question,
    hint: q.hint,
    explain: q.explain,
  }));
}

// ─── Speed Blitz — mixed questions for the child's class group ────────
export function getSpeedBlitzQuestions(classNum, count = 15) {
  const group = getClassGroup(classNum);
  const all = [];
  Object.entries(ADVENTURE_QUESTIONS).forEach(([adventureId, groups]) => {
    const pool = groups[group] || [];
    pool.forEach(q => all.push({ ...q, adventureId }));
  });
  return all.sort(() => Math.random() - 0.5).slice(0, count).map(q => ({
    ...q,
    options: q.optionLabels || q.options.map(String),
    correct_answer: q.displayAnswer || String(q.answer),
    scenario: q.story,
    question: q.question,
    hint: q.hint,
  }));
}

// ─── Daily Scenarios (class-appropriate) ─────────────────────────────
export const DAILY_SCENARIOS = [
  { title:"Dadi's Grocery List 🧺",  emoji:'🧺', desc:'Help Dadi with the shopping!',              adventure:'shopping',    bonus:2, color:'#f97316' },
  { title:'Tiffin Challenge 🍱',      emoji:'🍱', desc:'Plan school lunch within budget',            adventure:'canteen',     bonus:2, color:'#22c55e' },
  { title:'Auto vs Bus 🚌',           emoji:'🚌', desc:'Which is cheaper? Calculate & decide!',      adventure:'travel',      bonus:2, color:'#3b82f6' },
  { title:'School Trip Budget 🎒',    emoji:'🎒', desc:'Plan a class trip for everyone',              adventure:'travel',      bonus:2, color:'#a855f7' },
  { title:'Friday Pizza Party 🍕',    emoji:'🍕', desc:'Split the bill equally among friends',        adventure:'birthday',    bonus:2, color:'#ec4899' },
  { title:'Mela Madness 🎡',          emoji:'🎡', desc:'Make your pocket money last all evening!',    adventure:'mela',        bonus:2, color:'#fbbf24' },
  { title:'Cricket Finals 🏏',        emoji:'🏏', desc:'Score targets and team snack budget',         adventure:'cricket',     bonus:2, color:'#06b6d4' },
  { title:'Best Recharge Deal 📱',    emoji:'📱', desc:'Find the best value mobile plan for Bhaiya', adventure:'recharge',    bonus:3, color:'#f59e0b' },
  { title:'Savings Challenge 🐷',     emoji:'🐷', desc:'How many days to save for something special?',adventure:'shopping',    bonus:2, color:'#34d399' },
  { title:'Rainy Day Snacks ☔',       emoji:'☔', desc:'Prices changed! Recalculate everything',       adventure:'canteen',     bonus:2, color:'#64748b' },
  { title:'Birthday Gift Hunt 🎁',    emoji:'🎁', desc:'Buy the perfect gift within budget',           adventure:'birthday',    bonus:2, color:'#ec4899' },
  { title:'Sunday Bazaar 🛒',         emoji:'🛒', desc:'Weekly groceries — best deals only!',          adventure:'shopping',    bonus:2, color:'#f97316' },
];

export function getTodayDailyScenario() {
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_SCENARIOS[doy % DAILY_SCENARIOS.length];
}

// ─── Achievements ─────────────────────────────────────────────────────
export const BAZAAR_ACHIEVEMENTS = [
  { id:'first_solve',    emoji:'⚡',  name:'First Solve!',     desc:'Solve your first real-life problem',        color:'#22c55e', condition:s=>s.totalCorrect>=1 },
  { id:'five_correct',   emoji:'✋',  name:'High Five!',        desc:'5 correct answers total',                   color:'#06b6d4', condition:s=>s.totalCorrect>=5 },
  { id:'perfect',        emoji:'💯',  name:'Flawless!',         desc:'Perfect score in any adventure',            color:'#fbbf24', condition:s=>s.perfectRounds>=1 },
  { id:'streak3',        emoji:'🔥',  name:'On Fire!',          desc:'3 correct in a row',                        color:'#f97316', condition:s=>s.bestStreak>=3 },
  { id:'streak5',        emoji:'⚡',  name:'Lightning!',        desc:'5 correct in a row',                        color:'#ef4444', condition:s=>s.bestStreak>=5 },
  { id:'shopper',        emoji:'🛒',  name:'Smart Shopper',     desc:'Complete the Shopping adventure',           color:'#f97316', condition:s=>(s.adventuresPlayed||[]).includes('shopping') },
  { id:'party_planner',  emoji:'🎂',  name:'Party Planner',     desc:'Complete the Birthday adventure',           color:'#ec4899', condition:s=>(s.adventuresPlayed||[]).includes('birthday') },
  { id:'canteen_pro',    emoji:'🍱',  name:'Canteen Pro',       desc:'Complete the Canteen adventure',            color:'#22c55e', condition:s=>(s.adventuresPlayed||[]).includes('canteen') },
  { id:'navigator',      emoji:'🚌',  name:'City Navigator',    desc:'Complete the Travel adventure',             color:'#3b82f6', condition:s=>(s.adventuresPlayed||[]).includes('travel') },
  { id:'mela_master',    emoji:'🎡',  name:'Mela Master',       desc:'Complete the Mela adventure',               color:'#a855f7', condition:s=>(s.adventuresPlayed||[]).includes('mela') },
  { id:'cricket_champ',  emoji:'🏏',  name:'Cricket Champ',     desc:'Complete the Cricket adventure',            color:'#06b6d4', condition:s=>(s.adventuresPlayed||[]).includes('cricket') },
  { id:'tech_savvy',     emoji:'📱',  name:'Tech Savvy',        desc:'Complete the Recharge adventure',           color:'#fbbf24', condition:s=>(s.adventuresPlayed||[]).includes('recharge') },
  { id:'explorer',       emoji:'🗺️', name:'Life Explorer',     desc:'Play 3 different adventures',               color:'#f97316', condition:s=>(s.adventuresPlayed||[]).length>=3 },
  { id:'daily_3',        emoji:'📅',  name:'3-Day Habit',       desc:'Complete daily scenario 3 days in a row',   color:'#a855f7', condition:s=>s.dailyStreak>=3 },
  { id:'daily_7',        emoji:'🗓️', name:'Week Warrior!',     desc:'7-day daily scenario streak',               color:'#ec4899', condition:s=>s.dailyStreak>=7 },
  { id:'coins_100',      emoji:'🪙',  name:'Century!',          desc:'Earn 100 total coins',                      color:'#fbbf24', condition:s=>s.totalCoins>=100 },
  { id:'coins_500',      emoji:'💰',  name:'Half Grand!',       desc:'Earn 500 coins',                            color:'#f97316', condition:s=>s.totalCoins>=500 },
  { id:'speed_first',    emoji:'⚡',  name:'Speed Starter',     desc:'Complete a Speed Blitz',                    color:'#ef4444', condition:s=>s.speedRounds>=1 },
  { id:'speed_10',       emoji:'🚀',  name:'Speed Demon',       desc:'Get 10 correct in Speed Blitz',             color:'#f97316', condition:s=>s.speedBestScore>=10 },
  { id:'all_adventures', emoji:'🏆',  name:'Life Champion',     desc:'Complete all 7 free adventures',            color:'#fbbf24', condition:s=>(s.adventuresPlayed||[]).length>=7 },
];

// ─── localStorage helpers ─────────────────────────────────────────────
export function getBazaarStats(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_stats_${childId}`)||'null') || { totalCorrect:0,perfectRounds:0,bestStreak:0,totalCoins:0,adventuresPlayed:[],speedRounds:0,speedBestScore:0,dailyStreak:0 }; }
  catch { return { totalCorrect:0,perfectRounds:0,bestStreak:0,totalCoins:0,adventuresPlayed:[],speedRounds:0,speedBestScore:0,dailyStreak:0 }; }
}
export function updateBazaarStats(childId, delta) {
  const s = getBazaarStats(childId);
  Object.keys(delta).forEach(k => {
    if (k === 'adventuresPlayed') { if (!s.adventuresPlayed) s.adventuresPlayed=[]; if (!s.adventuresPlayed.includes(delta[k])) s.adventuresPlayed.push(delta[k]); }
    else s[k] = (s[k]||0) + (delta[k]||0);
  });
  localStorage.setItem(`bz_stats_${childId}`, JSON.stringify(s));
  return s;
}
export function setStatMax(childId, key, val) {
  const s = getBazaarStats(childId);
  if ((s[key]||0) < val) { s[key]=val; localStorage.setItem(`bz_stats_${childId}`, JSON.stringify(s)); }
}
export function getEarnedAchievements(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_ach_${childId}`)||'[]'); } catch { return []; }
}
export function checkAndAwardAchievements(childId) {
  const stats = getBazaarStats(childId);
  stats.totalCoins = getBazaarTotalCoins(childId);
  const earned = getEarnedAchievements(childId);
  const newlyEarned = BAZAAR_ACHIEVEMENTS.filter(a => !earned.includes(a.id) && a.condition(stats));
  if (newlyEarned.length) localStorage.setItem(`bz_ach_${childId}`, JSON.stringify([...earned, ...newlyEarned.map(a=>a.id)]));
  return newlyEarned;
}
export function getBazaarTotalCoins(childId) { return parseInt(localStorage.getItem(`bz_coins_${childId}`)||'0'); }
export function addBazaarCoins(childId, n) { const c=getBazaarTotalCoins(childId)+n; localStorage.setItem(`bz_coins_${childId}`,String(c)); return c; }
export function isDailyChallengeCompletedToday(childId) { return localStorage.getItem(`bz_daily_${childId}_${new Date().toISOString().slice(0,10)}`)===  '1'; }
export function markDailyChallengeComplete(childId) {
  const today=new Date().toISOString().slice(0,10);
  localStorage.setItem(`bz_daily_${childId}_${today}`,'1');
  const prev=new Date(); prev.setDate(prev.getDate()-1);
  const prevDone=localStorage.getItem(`bz_daily_${childId}_${prev.toISOString().slice(0,10)}`)===  '1';
  const cur=parseInt(localStorage.getItem(`bz_dstreak_${childId}`)||'0');
  localStorage.setItem(`bz_dstreak_${childId}`,String(prevDone?cur+1:1));
}
export function getDailyStreak(childId) { return parseInt(localStorage.getItem(`bz_dstreak_${childId}`)||'0'); }
export function getWeeklyLeague(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_wk_${childId}_${getWeekKey()}`)||'null')||{coins:0,sessions:0}; } catch { return {coins:0,sessions:0}; }
}
export function updateWeeklyLeague(childId, coins) {
  const key=`bz_wk_${childId}_${getWeekKey()}`; const wk=getWeeklyLeague(childId); wk.coins+=coins; wk.sessions+=1;
  localStorage.setItem(key,JSON.stringify(wk)); return wk;
}
export function getWeekKey() {
  const d=new Date(),jan1=new Date(d.getFullYear(),0,1);
  return `${d.getFullYear()}_w${Math.ceil((((d-jan1)/86400000)+jan1.getDay()+1)/7)}`;
}

// ─── Stub compatibility exports ───────────────────────────────────────
export const BAZAAR_MARKETS=[];
export const BAZAAR_PASSPORT=[];
export const BAZAAR_FESTIVALS=[];
export const BAZAAR_AVATAR_ITEMS={hat:[],outfit:[],accessory:[],shop_sign:[]};
export const BAZAAR_CUSTOMER_EMOJIS=['🧒','👦','👧','🧑','👩','👨','👴','👵'];
export const BAZAAR_REACTIONS_CORRECT=['शाबाश! 🎉','Wah! Sahi! ✅','Perfect! 👏','Excellent! 🌟','Kya baat hai! 🔥','Bilkul sahi! 💯'];
export const BAZAAR_REACTIONS_WRONG=['Arre nahi...😅','Phir se socho! 🤔','Sochke dekho 💭','Dhyan se! 👀'];
export async function fetchBazaarQuestions(adventureId) { return []; }
export function getBazaarReputation() { return {stars:3.0}; }
export function updateBazaarReputation() { return {stars:3.0}; }
export function getTodayDailyChallenge() { return getTodayDailyScenario(); }
export function generateChallengeId() { return Math.random().toString(36).substr(2,6).toUpperCase(); }
export function saveChallengeResult() {}
export function getChallengeResult() { return null; }
export function getBazaarOutfit() { return {hat:'none',outfit:'basic',accessory:'none',shop_sign:'basic'}; }
export function setBazaarOutfit() {}
export function getBazaarPurchased() { return []; }
export function addBazaarPurchase() {}
export function isItemOwned() { return true; }

// ═══════════════════════════════════════════════════════════════════════
//  QUESTION GENERATOR — Parametric questions with randomized numbers
//  These produce DIFFERENT numbers every play → mathematically infinite
// ═══════════════════════════════════════════════════════════════════════

// ── Random helpers ─────────────────────────────────────────────────────
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndStep(min, max, step) { return min + rnd(0, Math.floor((max - min) / step)) * step; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Template engine ────────────────────────────────────────────────────
// Each generator returns a fresh question object with randomized values.
// answer is always computed from the random values — never hardcoded.

export const QUESTION_GENERATORS = {

  // ──────────────────────────────────────────────────────────────────
  //  🛒 SHOPPING generators
  // ──────────────────────────────────────────────────────────────────
  shopping: [
    // G1: Simple counting / comparison
    () => {
      const a = rnd(2, 6), b = rnd(2, 6);
      const items = pick(['apples 🍎','bananas 🍌','oranges 🍊','mangoes 🥭']);
      return { story:`Mummy has ${a} ${items} and buys ${b} more.`, question:`How many ${items} are there now?`, hint:`${a} + ${b}`, answer: a+b, options: shuffle4([a+b, a+b-1, a+b+1, a+b+2]), explain:`${a} + ${b} = ${a+b}!`, group:1 };
    },
    () => {
      const p1 = rndStep(2,8,1), p2 = rndStep(10,20,5);
      const i1 = pick(['banana 🍌','lemon 🍋','guava']), i2 = pick(['mango 🥭','apple 🍎','papaya']);
      return { story:`A ${i1} costs ₹${p1}. A ${i2} costs ₹${p2}.`, question:`Which one costs MORE?`, hint:`₹${p2} is bigger`, answer: i2, options: [i1, i2], explain:`₹${p2} > ₹${p1}, so ${i2} costs more!`, group:1, isText:true };
    },
    () => {
      const have = rndStep(5,20,5), cost = rnd(3, have-1);
      return { story:`You have ₹${have}. A toy costs ₹${cost}.`, question:`Can you buy the toy?`, hint:`₹${have} > ₹${cost}?`, answer:'Yes ✅', options:['Yes ✅','No ❌'], explain:`₹${have} > ₹${cost}, so Yes!`, group:1, isText:true };
    },
    // G2: Simple totals, change
    () => {
      const qty = rnd(2,5), rate = rndStep(10,30,5), extra = rndStep(5,20,5);
      const item = pick(['apples','tomatoes','potatoes','bananas']);
      return { story:`Mummy buys ${qty} kg ${item} at ₹${rate}/kg and a packet of biscuits for ₹${extra}.`, question:`Total amount?`, hint:`${qty}×${rate} + ${extra}`, answer: qty*rate+extra, options: shuffle4([qty*rate+extra, qty*rate+extra-5, qty*rate+extra+5, qty*rate+extra+10]), explain:`${qty}×${rate}=${qty*rate}, +${extra}=₹${qty*rate+extra}!`, group:2 };
    },
    () => {
      const total = rndStep(20,80,5), paid = rndStep(total+5, total+50, 5);
      const item = pick(['groceries','vegetables','fruits','snacks']);
      return { story:`You buy ${item} for ₹${total} and give the shopkeeper ₹${paid}.`, question:`How much change do you get?`, hint:`${paid} - ${total}`, answer: paid-total, options: shuffle4([paid-total, paid-total-5, paid-total+5, paid-total+10]), explain:`${paid} - ${total} = ₹${paid-total}!`, group:2 };
    },
    () => {
      const qty = rnd(2,6), rate = rndStep(5,20,5);
      const item = pick(['eggs','oranges','bananas','lemons']);
      return { story:`Mummy buys ${qty} ${item} at ₹${rate} each.`, question:`How much for all ${qty} ${item}?`, hint:`${qty} × ${rate}`, answer: qty*rate, options: shuffle4([qty*rate, qty*rate-rate, qty*rate+rate, qty*rate+2*rate]), explain:`${qty} × ${rate} = ₹${qty*rate}!`, group:2 };
    },
    // G3: Multi-item bills, percentages
    () => {
      const q1=rnd(1,4), r1=rndStep(30,60,5), q2=rnd(1,3), r2=rndStep(20,45,5), r3=rndStep(40,120,10);
      const i1=pick(['Atta','Rice','Wheat']), i2=pick(['Sugar','Salt','Daal']), i3=pick(['Oil','Ghee','Butter']);
      const total = q1*r1+q2*r2+r3;
      return { story:`${q1} kg ${i1} ₹${r1}/kg, ${q2} kg ${i2} ₹${r2}/kg, 1 bottle ${i3} ₹${r3}.`, question:`Total bill?`, hint:`${q1}×${r1} + ${q2}×${r2} + ${r3}`, answer: total, options: shuffle4([total, total-10, total+10, total+20]), explain:`${q1*r1}+${q2*r2}+${r3}=₹${total}!`, group:3 };
    },
    () => {
      const budget = rndStep(400,800,100), spent = rndStep(200, budget-50, 50);
      return { story:`Mummy's budget is ₹${budget}. She has spent ₹${spent} so far.`, question:`How much budget is left?`, hint:`${budget} - ${spent}`, answer: budget-spent, options: shuffle4([budget-spent, budget-spent-25, budget-spent+25, budget-spent+50]), explain:`${budget} - ${spent} = ₹${budget-spent}!`, group:3 };
    },
    () => {
      const orig = rndStep(200,600,50), disc = pick([10,15,20,25]);
      const saving = Math.round(orig*disc/100);
      const pay = orig - saving;
      return { story:`Mummy gets ${disc}% discount on groceries worth ₹${orig}.`, question:`How much does she pay after discount?`, hint:`${disc}% of ${orig}=${saving}. Pay=${orig}-${saving}`, answer: pay, options: shuffle4([pay, pay-10, pay+10, pay+25]), explain:`${orig}-${saving}=₹${pay}!`, group:3 };
    },
    // G4: Best value, GST, fractions
    () => {
      const r1=rndStep(50,80,2), w1=pick([2,5,10]), r2=rndStep(55,90,2), w2=pick([1,2,3]);
      const ppk1=Math.round(r1/w1), ppk2=Math.round(r2/w2);
      const cheaper = ppk1<ppk2 ? `${w1}kg bag` : `${w2}kg bag`;
      return { story:`${w1} kg bag ₹${r1} vs ${w2} kg bag ₹${r2}.`, question:`Cost per kg of the ${w1} kg bag?`, hint:`${r1} ÷ ${w1}`, answer: ppk1, options: shuffle4([ppk1, ppk1+2, ppk1-2, ppk1+5]), explain:`${r1}÷${w1}=₹${ppk1}/kg. ${cheaper} is better value!`, group:4, displayAnswer:`₹${ppk1}/kg`, optionLabels:[`₹${ppk1-2}/kg`,`₹${ppk1}/kg`,`₹${ppk1+2}/kg`,`₹${ppk1+5}/kg`] };
    },
    () => {
      const base = rndStep(300,900,100), pct = pick([5,12,18]);
      const tax = Math.round(base*pct/100);
      return { story:`Bill is ₹${base} before ${pct}% GST.`, question:`Amount with GST?`, hint:`${pct}% of ${base}=${tax}. Add to ${base}`, answer: base+tax, options: shuffle4([base+tax, base+tax-10, base+tax+10, base]), explain:`${base}+${tax}=₹${base+tax} with ${pct}% GST!`, group:4 };
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  //  🍱 CANTEEN generators
  // ──────────────────────────────────────────────────────────────────
  canteen: [
    // G1
    () => {
      const have = rndStep(5,15,5), cost = rnd(3, have-1);
      const item = pick(['samosa','vada','idli','banana']);
      return { story:`A ${item} costs ₹${cost}. You have ₹${have}.`, question:`Can you buy 2 ${item}s?`, hint:`2 × ${cost} = ${2*cost}`, answer: 2*cost<=have?'Yes ✅':'No ❌', options:['Yes ✅','No ❌'], explain:`2×${cost}=₹${2*cost}. ${2*cost<=have?'₹'+have+'>₹'+2*cost+', Yes!':'₹'+2*cost+'>₹'+have+', No!'}`, group:1, isText:true };
    },
    () => {
      const a = rnd(2,5), b = rnd(2,5);
      const item = pick(['biscuits 🍪','grapes 🍇','pieces of cake','chocolates']);
      return { story:`You have ${a} ${item}. Your friend gives you ${b} more.`, question:`How many ${item} now?`, hint:`${a} + ${b}`, answer: a+b, options: shuffle4([a+b,a+b-1,a+b+1,a+b+2]), explain:`${a} + ${b} = ${a+b}!`, group:1 };
    },
    // G2
    () => {
      const p1 = rndStep(10,25,5), p2 = rndStep(15,30,5), have = rndStep(50,100,10);
      const i1 = pick(['samosa','paratha','dosa','idli']), i2 = pick(['juice','lassi','tea','buttermilk']);
      return { story:`${i1} ₹${p1}, ${i2} ₹${p2}. You have ₹${have}.`, question:`Total cost of ${i1} and ${i2}?`, hint:`${p1} + ${p2}`, answer: p1+p2, options: shuffle4([p1+p2,p1+p2-3,p1+p2+3,p1+p2+7]), explain:`${p1}+${p2}=₹${p1+p2}. Change=₹${have-(p1+p2)}!`, group:2 };
    },
    () => {
      const pricePer2 = rndStep(10,25,5), want = pick([4,6,8,10]);
      const item = pick(['idlis','vadas','dhoklas','rolls']);
      const total = Math.round(pricePer2 * want / 2);
      return { story:`${item} cost ₹${pricePer2} for 2 pieces. You want ${want} ${item}.`, question:`Cost for ${want} ${item}?`, hint:`${want}÷2=${want/2} sets. ${want/2}×${pricePer2}`, answer: total, options: shuffle4([total,total-pricePer2,total+pricePer2,total+5]), explain:`${want/2} sets × ₹${pricePer2} = ₹${total}!`, group:2 };
    },
    () => {
      const cost = rndStep(30,55,5), have = rndStep(cost+5, cost+50, 5);
      const item = pick(['lunch box','thali','combo meal','special']);
      return { story:`${item} costs ₹${cost}. You pay with ₹${have}.`, question:`Change received?`, hint:`${have} - ${cost}`, answer: have-cost, options: shuffle4([have-cost,have-cost-5,have-cost+5,have-cost+10]), explain:`${have}-${cost}=₹${have-cost} change!`, group:2 };
    },
    // G3
    () => {
      const disc = pick([10,15,20,25]), orig = rndStep(40,100,10);
      const saving = Math.round(orig*disc/100), price = orig-saving;
      const day = pick(['Tuesday','Wednesday','Thursday','Friday']);
      const item = pick(['biryani','thali','special','combo']);
      return { story:`${item} ₹${orig} on ${day} with ${disc}% off.`, question:`${day} price?`, hint:`${disc}% of ${orig}=${saving}. ${orig}-${saving}`, answer: price, options: shuffle4([price,price-5,price+5,orig]), explain:`${orig}-${saving}=₹${price} on ${day}!`, group:3 };
    },
    () => {
      const meals = rnd(15,60), profit = rndStep(5,15,1);
      return { story:`Canteen earns ₹${profit} profit per meal. Sold ${meals} meals today.`, question:`Total profit today?`, hint:`${meals} × ${profit}`, answer: meals*profit, options: shuffle4([meals*profit,meals*profit-profit*2,meals*profit+profit*2,meals*profit+profit*5]), explain:`${meals}×${profit}=₹${meals*profit}!`, group:3 };
    },
    () => {
      const n = pick([3,4,5,6,8,10]), pricePerN = rndStep(20,50,5), want = n * rnd(2,4);
      const item = pick(['ice creams','laddoos','modaks','pedas']);
      return { story:`Buy ${n} get 1 free offer on ${item} at ₹${pricePerN} for ${n}. You want ${want}.`, question:`How much do you pay for ${want} ${item}?`, hint:`Sets of ${n}: you pay ${want/n} sets`, answer: Math.ceil(want/n)*pricePerN, options: shuffle4([Math.ceil(want/n)*pricePerN, want/n*pricePerN, Math.ceil(want/n)*pricePerN+pricePerN, want*Math.round(pricePerN/n)]), explain:`${want/n} paid sets × ₹${pricePerN}=₹${Math.ceil(want/n)*pricePerN}!`, group:3 };
    },
    // G4
    () => {
      const cost = rndStep(30,60,5), margin = pick([30,40,50,60]);
      const profit = Math.round(cost*margin/100), price = cost+profit;
      return { story:`A meal costs ₹${cost} to make. Canteen adds ${margin}% profit.`, question:`Selling price?`, hint:`${margin}% of ${cost}=${profit}. ${cost}+${profit}`, answer: price, options: shuffle4([price,price-5,price+5,price+10]), explain:`${cost}+${profit}=₹${price} selling price!`, group:4 };
    },
    () => {
      const base = rndStep(60,120,10), gst = pick([5,12,18]);
      const tax = Math.round(base*gst/100);
      return { story:`Canteen meal ₹${base} before ${gst}% GST.`, question:`Price with GST?`, hint:`${gst}% of ${base}=${tax}. ${base}+${tax}`, answer: base+tax, options: shuffle4([base+tax,base+tax-3,base+tax+3,base]), explain:`${base}+${tax}=₹${base+tax} with GST!`, group:4 };
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  //  🚌 TRAVEL generators
  // ──────────────────────────────────────────────────────────────────
  travel: [
    // G1
    () => {
      const a = rnd(2,5), b = rnd(2,5);
      return { story:`You travel ${a} stops to school. Coming back is ${b} stops.`, question:`Total stops in a day?`, hint:`${a} + ${b}`, answer: a+b, options: shuffle4([a+b,a+b-1,a+b+1,a+b+2]), explain:`${a} + ${b} = ${a+b} stops!`, group:1 };
    },
    () => {
      const fare=rndStep(3,10,1), paid=rndStep(fare+2,20,1);
      return { story:`Bus ticket costs ₹${fare}. Papa gives you ₹${paid}.`, question:`How much change?`, hint:`${paid} - ${fare}`, answer: paid-fare, options: shuffle4([paid-fare,paid-fare-1,paid-fare+1,paid-fare+2]), explain:`${paid} - ${fare} = ₹${paid-fare}!`, group:1 };
    },
    // G2
    () => {
      const fare=rndStep(8,20,2), days=rnd(4,7);
      return { story:`Bus ticket ₹${fare}. You travel ${days} days a week (one way).`, question:`Weekly fare?`, hint:`${fare} × ${days}`, answer: fare*days, options: shuffle4([fare*days,fare*days-fare,fare*days+fare,fare*(days+1)]), explain:`${fare} × ${days} = ₹${fare*days}!`, group:2 };
    },
    () => {
      const fare=rndStep(30,80,10), people=rnd(2,6);
      const dest = pick(["Nana ji's house","the market","the railway station","school"]);
      return { story:`Train to ${dest}: ₹${fare} per person. ${people} people travelling.`, question:`Total train cost?`, hint:`${people} × ${fare}`, answer: fare*people, options: shuffle4([fare*people,fare*(people-1),fare*(people+1),fare*people+fare]), explain:`${people} × ${fare} = ₹${fare*people}!`, group:2 };
    },
    () => {
      const total=rndStep(60,200,20), students=pick([10,15,20,25,30]);
      return { story:`School trip bus costs ₹${total} total. ${students} students going.`, question:`Cost per student?`, hint:`${total} ÷ ${students}`, answer: Math.round(total/students), options: shuffle4([Math.round(total/students),Math.round(total/students)-2,Math.round(total/students)+2,Math.round(total/students)+5]), explain:`${total}÷${students}=₹${Math.round(total/students)}/student!`, group:2 };
    },
    // G3
    () => {
      const base=rndStep(10,20,5), baseKm=2, extra=rndStep(5,12,1), totalKm=rnd(4,8);
      const total = base + (totalKm-baseKm)*extra;
      return { story:`Auto fare: ₹${base} first ${baseKm} km, then ₹${extra}/km. You travel ${totalKm} km.`, question:`Total auto fare?`, hint:`${base} + ${totalKm-baseKm}×${extra}`, answer: total, options: shuffle4([total,total-extra,total+extra,total+2*extra]), explain:`${base}+${(totalKm-baseKm)*extra}=₹${total}!`, group:3 };
    },
    () => {
      const daily=rndStep(20,60,4), days=pick([22,24,25,26]);
      return { story:`Daily commute costs ₹${daily} (return). ${days} working days per month.`, question:`Monthly commute cost?`, hint:`${daily} × ${days}`, answer: daily*days, options: shuffle4([daily*days,daily*days-daily,daily*days+daily,daily*(days+2)]), explain:`${daily}×${days}=₹${daily*days}/month!`, group:3 };
    },
    () => {
      const kmPerL=pick([12,14,15,16,18]), dist=rndStep(60,240,30), petrol=rndStep(90,110,5);
      const litres = Math.round(dist/kmPerL);
      return { story:`Car gives ${kmPerL} km/litre. Trip of ${dist} km. Petrol ₹${petrol}/litre.`, question:`Petrol cost?`, hint:`${dist}÷${kmPerL}=${litres} litres. ${litres}×${petrol}`, answer: litres*petrol, options: shuffle4([litres*petrol,litres*petrol-50,(litres+1)*petrol,(litres-1)*petrol]), explain:`${litres} litres × ₹${petrol}=₹${litres*petrol}!`, group:3 };
    },
    // G4
    () => {
      const fare=rndStep(300,800,50), gst=pick([5,12]);
      const tax=Math.round(fare*gst/100), fee=rndStep(20,50,10);
      return { story:`Train ticket ₹${fare} + ${gst}% GST + ₹${fee} booking fee.`, question:`Total amount paid?`, hint:`${gst}% of ${fare}=${tax}. ${fare}+${tax}+${fee}`, answer: fare+tax+fee, options: shuffle4([fare+tax+fee,fare+tax,fare+fee,fare+tax+fee+10]), explain:`${fare}+${tax}+${fee}=₹${fare+tax+fee}!`, group:4 };
    },
    () => {
      const adults=rnd(2,4), pct=pick([60,65,70,75]), adultFare=rndStep(2000,6000,500);
      const childFare=Math.round(adultFare*pct/100), children=rnd(1,3);
      return { story:`Flight: adult ₹${adultFare}, child ${pct}% of adult. ${adults} adults + ${children} child(ren).`, question:`Total ticket cost?`, hint:`${adults}×${adultFare} + ${children}×${childFare}`, answer: adults*adultFare+children*childFare, options: shuffle4([adults*adultFare+children*childFare,adults*adultFare,adults*adultFare+children*adultFare,adults*adultFare+children*childFare+500]), explain:`${adults*adultFare}+${children*childFare}=₹${adults*adultFare+children*childFare}!`, group:4 };
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  //  🎡 MELA generators
  // ──────────────────────────────────────────────────────────────────
  mela: [
    // G1
    () => {
      const have=rnd(6,15), use=rnd(2,have-1);
      return { story:`You have ${have} tokens 🎟️. You use ${use} for a ride.`, question:`Tokens left?`, hint:`${have} - ${use}`, answer: have-use, options: shuffle4([have-use,have-use-1,have-use+1,have-use+2]), explain:`${have} - ${use} = ${have-use} tokens!`, group:1 };
    },
    () => {
      const cost=rndStep(5,15,5), n=rnd(2,4);
      const item=pick(['cotton candy 🍭','bhel puri','juice','pani puri']);
      return { story:`${item} costs ₹${cost}. You buy ${n}.`, question:`Total cost?`, hint:`${n} × ₹${cost}`, answer: n*cost, options: shuffle4([n*cost,(n-1)*cost,(n+1)*cost,n*cost+5]), explain:`${n} × ${cost} = ₹${n*cost}!`, group:1 };
    },
    // G2
    () => {
      const r1=rndStep(25,50,5), r2=rndStep(20,40,5), r3=rndStep(15,35,5), have=rndStep(150,300,50);
      const spent=r1+r2+r3;
      return { story:`Giant Wheel ₹${r1}, Merry-go-round ₹${r2}, Shooting game ₹${r3}. You have ₹${have}.`, question:`Money left after all 3?`, hint:`${r1}+${r2}+${r3}=${spent}. ${have}-${spent}`, answer: have-spent, options: shuffle4([have-spent,have-spent-5,have-spent+5,have-spent+10]), explain:`${have}-${spent}=₹${have-spent} left!`, group:2 };
    },
    () => {
      const adult=rndStep(60,100,10), child=rndStep(30,60,10), adults=rnd(1,3), children=rnd(1,3);
      return { story:`Entry: ₹${adult}/adult, ₹${child}/child. ${adults} adult(s) + ${children} child(ren).`, question:`Total entry cost?`, hint:`${adults}×${adult} + ${children}×${child}`, answer: adults*adult+children*child, options: shuffle4([adults*adult+children*child,adults*adult,children*child,adults*adult+children*child+child]), explain:`${adults*adult}+${children*child}=₹${adults*adult+children*child}!`, group:2 };
    },
    // G3
    () => {
      const total=rndStep(300,800,100), food=pick([30,35,40,45]), rides=pick([30,35,40]), games=100-food-rides;
      const foodAmt=Math.round(total*food/100), ridesAmt=Math.round(total*rides/100);
      return { story:`Mela budget ₹${total}. Food ${food}%, rides ${rides}%, games ${games}%.`, question:`Amount for rides?`, hint:`${rides}% of ${total}`, answer: ridesAmt, options: shuffle4([ridesAmt,foodAmt,Math.round(total*games/100),ridesAmt+25]), explain:`${rides}%×${total}=₹${ridesAmt} for rides!`, group:3 };
    },
    () => {
      const orig=rndStep(40,100,10), disc=pick([20,25,30]);
      const saving=Math.round(orig*disc/100), price=orig-saving;
      return { story:`Special ${disc}% discount on all rides. Ride was ₹${orig}.`, question:`Discounted price?`, hint:`${disc}% of ${orig}=${saving}. ${orig}-${saving}`, answer: price, options: shuffle4([price,price-5,price+5,orig]), explain:`${orig}-${saving}=₹${price}!`, group:3 };
    },
    // G4
    () => {
      const rent=rndStep(15000,30000,5000), income=rndStep(40000,70000,5000), exp=rndStep(10000,20000,5000);
      const profit=income-rent-exp;
      return { story:`Ground rent ₹${rent.toLocaleString('en-IN')}. Income ₹${income.toLocaleString('en-IN')}. Expenses ₹${exp.toLocaleString('en-IN')}.`, question:`Net profit?`, hint:`${income}-${rent}-${exp}`, answer: profit, options: shuffle4([profit,profit-5000,profit+5000,profit+10000]), explain:`${income}-${rent}-${exp}=₹${profit.toLocaleString('en-IN')}!`, group:4, displayAnswer:`₹${profit.toLocaleString('en-IN')}`, optionLabels:[`₹${(profit-5000).toLocaleString('en-IN')}`,`₹${profit.toLocaleString('en-IN')}`,`₹${(profit+5000).toLocaleString('en-IN')}`,`₹${(profit+10000).toLocaleString('en-IN')}`] };
    },
    () => {
      const orig=rndStep(60,150,10), disc=pick([10,12.5,15,20]);
      const saving=Math.round(orig*disc/100), price=orig-saving;
      return { story:`Ride costs ₹${orig}. Student discount ${disc}%.`, question:`Student price?`, hint:`${disc}% of ${orig}=${saving}. ${orig}-${saving}`, answer: price, options: shuffle4([price,price-5,price+5,orig]), explain:`${orig}-${saving}=₹${price} for students!`, group:4 };
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  //  🏏 CRICKET generators
  // ──────────────────────────────────────────────────────────────────
  cricket: [
    // G1
    () => {
      const a=rnd(2,6), b=rnd(2,6);
      return { story:`You score ${a} runs 🏏 and your friend scores ${b} runs.`, question:`Total runs?`, hint:`${a} + ${b}`, answer: a+b, options: shuffle4([a+b,a+b-1,a+b+1,a+b+2]), explain:`${a} + ${b} = ${a+b} runs!`, group:1 };
    },
    () => {
      const players=pick([5,6,8,10,11]), biscuits=pick([2,3,4]);
      return { story:`Each player gets ${biscuits} biscuits 🍪. There are ${players} players.`, question:`Total biscuits needed?`, hint:`${players} × ${biscuits}`, answer: players*biscuits, options: shuffle4([players*biscuits,players*biscuits-biscuits,players*biscuits+biscuits,players*(biscuits+1)]), explain:`${players} × ${biscuits} = ${players*biscuits} biscuits!`, group:1 };
    },
    // G2
    () => {
      const players=pick([9,10,11,12]), contrib=rndStep(15,50,5);
      return { story:`${players} players each contribute ₹${contrib} for snacks.`, question:`Total collected?`, hint:`${players} × ${contrib}`, answer: players*contrib, options: shuffle4([players*contrib,(players-1)*contrib,(players+1)*contrib,players*contrib+contrib]), explain:`${players} × ${contrib} = ₹${players*contrib}!`, group:2 };
    },
    () => {
      const target=rndStep(60,150,5), scored=rndStep(30,target-5,5);
      return { story:`Match target: ${target} runs. Team has scored ${scored} runs.`, question:`Runs still needed?`, hint:`${target} - ${scored}`, answer: target-scored, options: shuffle4([target-scored,target-scored-5,target-scored+5,target-scored+10]), explain:`${target}-${scored}=${target-scored} more runs!`, group:2 };
    },
    () => {
      const overs=rnd(3,6), scores=Array.from({length:overs},()=>rnd(4,18));
      const total=scores.reduce((a,b)=>a+b,0);
      return { story:`${overs} overs scored: ${scores.join(', ')} runs.`, question:`Total score?`, hint:`Add all: ${scores.join('+')}`, answer: total, options: shuffle4([total,total-2,total+2,total+5]), explain:`${scores.join('+')}=${total} runs!`, group:2 };
    },
    // G3
    () => {
      const balls=rnd(2,5), batRate=rndStep(80,180,20), bats=rnd(1,3), batRate2=rndStep(250,500,50);
      const total=balls*batRate+bats*batRate2;
      return { story:`${balls} balls ₹${batRate} each, ${bats} bat(s) ₹${batRate2} each.`, question:`Total equipment cost?`, hint:`${balls}×${batRate} + ${bats}×${batRate2}`, answer: total, options: shuffle4([total,total-100,total+100,total+200]), explain:`${balls*batRate}+${bats*batRate2}=₹${total}!`, group:3 };
    },
    () => {
      const players=pick([9,10,11,12]), prize=rndStep(500,2500,250);
      return { story:`${players} players equally share ₹${prize} prize money.`, question:`Each player gets?`, hint:`${prize} ÷ ${players}`, answer: Math.round(prize/players), options: shuffle4([Math.round(prize/players),Math.round(prize/players)-10,Math.round(prize/players)+10,Math.round(prize/players)+25]), explain:`${prize}÷${players}=₹${Math.round(prize/players)} each!`, group:3 };
    },
    // G4
    () => {
      const sponsorship=rndStep(30000,80000,5000), ground=rndStep(8000,20000,2000), equip=rndStep(5000,15000,1000), food=rndStep(3000,10000,1000);
      const surplus=sponsorship-ground-equip-food;
      return { story:`Sponsorship ₹${sponsorship.toLocaleString('en-IN')}. Ground ₹${ground.toLocaleString('en-IN')}, equipment ₹${equip.toLocaleString('en-IN')}, food ₹${food.toLocaleString('en-IN')}.`, question:`Net surplus for prizes?`, hint:`${sponsorship}-(${ground}+${equip}+${food})`, answer: surplus, options: shuffle4([surplus,surplus-2000,surplus+2000,surplus+5000]), explain:`${sponsorship}-(${ground+equip+food})=₹${surplus}!`, group:4, displayAnswer:`₹${surplus.toLocaleString('en-IN')}`, optionLabels:[`₹${(surplus-2000).toLocaleString('en-IN')}`,`₹${surplus.toLocaleString('en-IN')}`,`₹${(surplus+2000).toLocaleString('en-IN')}`,`₹${(surplus+5000).toLocaleString('en-IN')}`] };
    },
    () => {
      const players=pick([11,12,13,14,15]), avg=rndStep(30,70,5), innings=rnd(8,20);
      return { story:`Batsman scores average ${avg} runs in ${innings} innings.`, question:`Total runs scored?`, hint:`${avg} × ${innings}`, answer: avg*innings, options: shuffle4([avg*innings,avg*(innings-1),avg*(innings+1),avg*innings+avg]), explain:`${avg}×${innings}=${avg*innings} runs!`, group:4 };
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  //  📱 RECHARGE generators
  // ──────────────────────────────────────────────────────────────────
  recharge: [
    // G1
    () => {
      const a=rnd(3,8), b=rnd(2,5);
      return { story:`Bhaiya has ${a} contacts 📱. He adds ${b} more.`, question:`How many contacts now?`, hint:`${a} + ${b}`, answer: a+b, options: shuffle4([a+b,a+b-1,a+b+1,a+b+2]), explain:`${a} + ${b} = ${a+b}!`, group:1 };
    },
    () => {
      const have=rndStep(10,25,5), cost=rnd(4,have-2);
      return { story:`Recharge coupon costs ₹${cost}. You have ₹${have}.`, question:`Money left after buying?`, hint:`${have} - ${cost}`, answer: have-cost, options: shuffle4([have-cost,have-cost-1,have-cost+1,have-cost+2]), explain:`${have} - ${cost} = ₹${have-cost}!`, group:1 };
    },
    // G2
    () => {
      const days=pick([7,14,28]), price=rndStep(29,99,10);
      const ppd=Math.round(price/days);
      return { story:`Plan: ₹${price} for ${days} days.`, question:`Daily cost (approx)?`, hint:`${price} ÷ ${days}`, answer: ppd, options: shuffle4([ppd,ppd-1,ppd+1,ppd+2]), explain:`${price}÷${days}≈₹${ppd}/day!`, group:2 };
    },
    () => {
      const bal=rndStep(80,200,20), mins=rndStep(20,60,10);
      return { story:`Balance ₹${bal}. Call costs ₹1/minute. Bhaiya talks ${mins} minutes.`, question:`Balance after call?`, hint:`${bal} - ${mins}`, answer: bal-mins, options: shuffle4([bal-mins,bal-mins-5,bal-mins+5,bal-mins+10]), explain:`${bal}-${mins}=₹${bal-mins} left!`, group:2 };
    },
    () => {
      const price=rndStep(99,299,50), months=rnd(2,6);
      return { story:`Monthly recharge ₹${price}. Cost for ${months} months?`, question:`Total for ${months} months?`, hint:`${price} × ${months}`, answer: price*months, options: shuffle4([price*months,(price-10)*months,(price+10)*months,price*(months+1)]), explain:`${price}×${months}=₹${price*months}!`, group:2 };
    },
    // G3
    () => {
      const gb1=pick([1,1.5,2]), price1=rndStep(149,249,50), days=28, gb2=gb1+pick([0.5,1,1.5]), price2=price1+rndStep(50,100,50);
      const ppg1=Math.round(price1/gb1), ppg2=Math.round(price2/gb2);
      const better=ppg1<ppg2?`Plan A (₹${ppg1}/GB)`:`Plan B (₹${ppg2}/GB)`;
      return { story:`Plan A: ₹${price1} for ${gb1}GB/day. Plan B: ₹${price2} for ${gb2}GB/day. Both ${days} days.`, question:`Extra data per day in Plan B?`, hint:`${gb2} - ${gb1}`, answer: gb2-gb1, options: shuffle4([gb2-gb1,gb1,gb2,0.5]), explain:`Plan B gives ${gb2-gb1}GB more/day. ${better} is better value!`, group:3, displayAnswer:`${gb2-gb1} GB`, optionLabels:[`${gb2-gb1-0.5} GB`,`${gb2-gb1} GB`,`${gb2-gb1+0.5} GB`,`${gb2} GB`] };
    },
    () => {
      const monthly=rndStep(199,399,50);
      const annual=Math.round(monthly*12*pick([0.80,0.82,0.85,0.88])/10)*10;
      const saving=monthly*12-annual;
      return { story:`Monthly plan ₹${monthly}. Annual plan ₹${annual.toLocaleString('en-IN')}.`, question:`Annual saving with yearly plan?`, hint:`${monthly}×12=${monthly*12}. ${monthly*12}-${annual}`, answer: saving, options: shuffle4([saving,saving-50,saving+50,saving+100]), explain:`${monthly*12}-${annual}=₹${saving} saved!`, group:3 };
    },
    () => {
      const connections=pick([3,4,5]), individual=rndStep(149,299,50);
      const familyPct=pick([70,75,80,82]);
      const family=Math.round(connections*individual*familyPct/100/10)*10;
      const saving=connections*individual-family;
      return { story:`Family plan ₹${family}/month for ${connections} connections vs ₹${individual} individual.`, question:`Monthly saving with family plan?`, hint:`${connections}×${individual}=${connections*individual}. ${connections*individual}-${family}`, answer: saving, options: shuffle4([saving,saving-20,saving+20,saving+50]), explain:`${connections*individual}-${family}=₹${saving} saved!`, group:3 };
    },
    // G4
    () => {
      const price=rndStep(199,499,50), days=pick([28,30,56,84]);
      const ppd=(price/days).toFixed(2);
      return { story:`Plan costs ₹${price} for ${days} days.`, question:`Exact daily cost?`, hint:`${price} ÷ ${days}`, answer: parseFloat(ppd), options: shuffle4([parseFloat(ppd),(price/(days+2)).toFixed(2),(price/(days-2)).toFixed(2),(price/30).toFixed(2)].map(Number)), explain:`${price}÷${days}=₹${ppd}/day!`, group:4, displayAnswer:`₹${ppd}`, optionLabels:[`₹${(price/(days+4)).toFixed(2)}`,`₹${ppd}`,`₹${(price/(days-4)).toFixed(2)}`,`₹${(price/30).toFixed(2)}`] };
    },
    () => {
      const calls=rndStep(200,500,50), data=rndStep(149,399,50), sms=rndStep(10,30,5), gst=18;
      const total=calls+data+sms, tax=Math.round(total*gst/100);
      return { story:`Bill: calls ₹${calls}, data ₹${data}, SMS ₹${sms}. ${gst}% GST on total.`, question:`Final bill with GST?`, hint:`Total=${total}. ${gst}% of ${total}=${tax}. ${total}+${tax}`, answer: total+tax, options: shuffle4([total+tax,total,total+tax-10,total+tax+10]), explain:`${total}+${tax}=₹${total+tax} with GST!`, group:4 };
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  //  🎂 BIRTHDAY generators
  // ──────────────────────────────────────────────────────────────────
  birthday: [
    // G1
    () => {
      const yours=rnd(2,5), friends=rnd(2,5);
      return { story:`You want ${yours} balloons 🎈. Your friend wants ${friends} balloons.`, question:`Balloons altogether?`, hint:`${yours} + ${friends}`, answer: yours+friends, options: shuffle4([yours+friends,yours+friends-1,yours+friends+1,yours+friends+2]), explain:`${yours} + ${friends} = ${yours+friends} balloons!`, group:1 };
    },
    () => {
      const total=rnd(5,12), friends=rnd(2,total-1);
      return { story:`There are ${total} pieces of cake. ${friends} friends each eat 1 piece.`, question:`Pieces left?`, hint:`${total} - ${friends}`, answer: total-friends, options: shuffle4([total-friends,total-friends-1,total-friends+1,total-friends+2]), explain:`${total} - ${friends} = ${total-friends} pieces left!`, group:1 };
    },
    // G2
    () => {
      const cakePrice=rndStep(80,200,20), balloonPrice=rndStep(20,60,10), budget=rndStep(250,400,50);
      return { story:`Cake costs ₹${cakePrice}. Balloons cost ₹${balloonPrice}. Budget is ₹${budget}.`, question:`Total spent on cake and balloons?`, hint:`${cakePrice} + ${balloonPrice}`, answer: cakePrice+balloonPrice, options: shuffle4([cakePrice+balloonPrice,cakePrice+balloonPrice-10,cakePrice+balloonPrice+10,cakePrice+balloonPrice+20]), explain:`${cakePrice}+${balloonPrice}=₹${cakePrice+balloonPrice}. ₹${budget-(cakePrice+balloonPrice)} left!`, group:2 };
    },
    () => {
      const gifts=rnd(5,15), each=rndStep(10,30,5);
      return { story:`You need ${gifts} return gifts at ₹${each} each.`, question:`Total gift cost?`, hint:`${gifts} × ${each}`, answer: gifts*each, options: shuffle4([gifts*each,(gifts-1)*each,(gifts+1)*each,gifts*each+each]), explain:`${gifts} × ${each} = ₹${gifts*each}!`, group:2 };
    },
    // G3
    () => {
      const friends=rnd(6,14), slicesEach=pick([2,3]), slicesPerPizza=pick([6,8,10]);
      const totalSlices=friends*slicesEach;
      const pizzas=Math.ceil(totalSlices/slicesPerPizza);
      return { story:`Pizza ₹250. ${friends} friends (${slicesEach} slices each, ${slicesPerPizza} slices/pizza).`, question:`How many pizzas needed?`, hint:`${friends}×${slicesEach}=${totalSlices} slices. ${totalSlices}÷${slicesPerPizza}=? → round up`, answer: pizzas, options: shuffle4([pizzas,pizzas-1,pizzas+1,pizzas+2]), explain:`${totalSlices} slices ÷ ${slicesPerPizza} per pizza = ${totalSlices/slicesPerPizza} → need ${pizzas} pizzas!`, group:3 };
    },
    () => {
      const perBag=rnd(2,4), chocPrice=rndStep(4,8,1), pencilPrice=rndStep(6,12,2), bags=rnd(8,15);
      const perBagCost=perBag*chocPrice+pencilPrice;
      return { story:`${bags} goody bags: ${perBag} chocolates ₹${chocPrice} each + 1 pencil ₹${pencilPrice} each.`, question:`Total for all goody bags?`, hint:`Per bag: ${perBag}×${chocPrice}+${pencilPrice}=${perBagCost}. Total: ${bags}×${perBagCost}`, answer: bags*perBagCost, options: shuffle4([bags*perBagCost,bags*(perBagCost-2),bags*(perBagCost+2),(bags+1)*perBagCost]), explain:`${perBagCost}×${bags}=₹${bags*perBagCost}!`, group:3 };
    },
    // G4
    () => {
      const headCount=rnd(15,35), perHead=rndStep(100,250,25), discPct=pick([10,12,15,20]);
      const base=headCount*perHead, disc=Math.round(base*discPct/100);
      return { story:`Party for ${headCount} people at ₹${perHead}/head. ${discPct}% bulk discount.`, question:`Final food bill?`, hint:`${headCount}×${perHead}=${base}. ${discPct}% off=${disc}. ${base}-${disc}`, answer: base-disc, options: shuffle4([base-disc,base,base-disc-100,base-disc+100]), explain:`${base}-${disc}=₹${base-disc}!`, group:4 };
    },
    () => {
      const last=rndStep(1500,3000,500), increase=pick([10,15,20,25]);
      const inc=Math.round(last*increase/100);
      return { story:`Last year party cost ₹${last.toLocaleString('en-IN')}. This year it increased by ${increase}%.`, question:`This year's party cost?`, hint:`${increase}% of ${last}=${inc}. ${last}+${inc}`, answer: last+inc, options: shuffle4([last+inc,last,last+inc-100,last+inc+200]), explain:`${last}+${inc}=₹${(last+inc).toLocaleString('en-IN')}!`, group:4, displayAnswer:`₹${(last+inc).toLocaleString('en-IN')}`, optionLabels:[`₹${(last+inc-200).toLocaleString('en-IN')}`,`₹${(last+inc-100).toLocaleString('en-IN')}`,`₹${(last+inc).toLocaleString('en-IN')}`,`₹${(last+inc+200).toLocaleString('en-IN')}`] };
    },
  ],
};

// ── shuffle4: shuffle answer options array ─────────────────────────
function shuffle4(arr) {
  return [...arr].sort(() => Math.random() - 0.5).map(String);
}

// ─── Seen-questions tracker per child ─────────────────────────────────
// Tracks which static question indices have been shown per adventure+group
// Resets automatically once all seen → no repeats until full cycle done

function getSeenKey(childId, adventureId, group) {
  return `bz_seen_${childId}_${adventureId}_${group}`;
}

function getSeenIndices(childId, adventureId, group) {
  try { return JSON.parse(localStorage.getItem(getSeenKey(childId, adventureId, group)) || '[]'); }
  catch { return []; }
}

function markSeen(childId, adventureId, group, indices) {
  localStorage.setItem(getSeenKey(childId, adventureId, group), JSON.stringify(indices));
}

function resetSeen(childId, adventureId, group) {
  localStorage.removeItem(getSeenKey(childId, adventureId, group));
}

// ─── ENHANCED question getter — anti-repeat + parametric mix ──────────
export function getAdventureQuestions(adventureId, classNum, count = 8) {
  const group = getClassGroup(classNum);
  const staticPool = ((ADVENTURE_QUESTIONS[adventureId] || {})[group] || []);
  const generators = (QUESTION_GENERATORS[adventureId] || []).filter(g => {
    // test which group by calling it and checking .group
    try { const q = g(); return q.group === group; } catch { return false; }
  });

  // ── Step 1: Pick static questions we haven't seen yet ──
  let seen = getSeenIndices(null, adventureId, group); // no child tracking at module level
  const unseen = staticPool.map((q, i) => i).filter(i => !seen.includes(i));

  // Reset if all seen
  if (unseen.length < count) {
    seen = [];
    resetSeen(null, adventureId, group);
  }

  const shuffledUnseen = [...unseen].sort(() => Math.random() - 0.5);
  const staticCount = Math.min(Math.ceil(count * 0.5), shuffledUnseen.length); // 50% static
  const chosenIndices = shuffledUnseen.slice(0, staticCount);
  const chosenStatic = chosenIndices.map(i => staticPool[i]);

  // ── Step 2: Fill rest with parametric (generated) questions ──
  const generatedCount = count - chosenStatic.length;
  const generated = [];
  if (generators.length > 0) {
    for (let i = 0; i < generatedCount * 3 && generated.length < generatedCount; i++) {
      try {
        const q = pick(generators)();
        if (q && q.question) generated.push(q);
      } catch(e) { /* skip bad gen */ }
    }
  }

  // ── Step 3: Mix and format ──
  const mixed = [...chosenStatic, ...generated].sort(() => Math.random() - 0.5);

  return mixed.slice(0, count).map(q => ({
    ...q,
    options: q.optionLabels || (Array.isArray(q.options) ? q.options.map(String) : shuffle4([q.answer, q.answer+1, q.answer+2, q.answer-1])),
    correct_answer: q.displayAnswer || String(q.answer),
    scenario: q.story,
    question: q.question,
    hint: q.hint,
    explain: q.explain || q.hint,
  }));
}

// ─── Child-aware version (tracks seen per child) ───────────────────────
export function getAdventureQuestionsForChild(adventureId, classNum, childId, count = 8) {
  const group = getClassGroup(classNum);
  const staticPool = ((ADVENTURE_QUESTIONS[adventureId] || {})[group] || []);
  const generators = (QUESTION_GENERATORS[adventureId] || []).filter(g => {
    try { const q = g(); return q.group === group; } catch { return false; }
  });

  // Track seen indices per child
  let seen = getSeenIndices(childId, adventureId, group);
  const allIndices = staticPool.map((_, i) => i);
  const unseen = allIndices.filter(i => !seen.includes(i));

  // Auto-reset when all seen
  if (unseen.length < Math.ceil(count * 0.5)) {
    seen = [];
    resetSeen(childId, adventureId, group);
  }

  const shuffledUnseen = [...(unseen.length ? unseen : allIndices)].sort(() => Math.random() - 0.5);
  const staticCount = Math.min(Math.ceil(count * 0.5), shuffledUnseen.length);
  const chosenIndices = shuffledUnseen.slice(0, staticCount);

  // Mark as seen
  markSeen(childId, adventureId, group, [...seen, ...chosenIndices]);

  const chosenStatic = chosenIndices.map(i => staticPool[i]);

  // Generated questions fill the other 50%
  const generatedCount = count - chosenStatic.length;
  const generated = [];
  if (generators.length > 0) {
    for (let i = 0; i < generatedCount * 4 && generated.length < generatedCount; i++) {
      try { const q = pick(generators)(); if (q?.question) generated.push(q); } catch {}
    }
  }

  return [...chosenStatic, ...generated].sort(() => Math.random() - 0.5).slice(0, count).map(q => ({
    ...q,
    options: q.optionLabels || (Array.isArray(q.options) ? q.options.map(String) : []),
    correct_answer: q.displayAnswer || String(q.answer),
    scenario: q.story,
    question: q.question,
    hint: q.hint,
    explain: q.explain || q.hint,
  }));
}

// ─── Speed Blitz — class-group parametric mix ─────────────────────────
export function getSpeedBlitzQuestions(classNum, count = 15) {
  const group = getClassGroup(classNum);
  const allGenerated = [];

  // Pull from all adventure generators
  Object.entries(QUESTION_GENERATORS).forEach(([adventureId, gens]) => {
    const groupGens = gens.filter(g => { try { return g().group === group; } catch { return false; } });
    groupGens.forEach(g => {
      try { const q = g(); if (q?.question) allGenerated.push({ ...q, adventureId }); } catch {}
    });
  });

  // Top up with static questions if generators not enough
  if (allGenerated.length < count * 2) {
    Object.entries(ADVENTURE_QUESTIONS).forEach(([adventureId, groups]) => {
      (groups[group] || []).forEach(q => allGenerated.push({ ...q, adventureId }));
    });
  }

  return allGenerated.sort(() => Math.random() - 0.5).slice(0, count).map(q => ({
    ...q,
    options: q.optionLabels || (Array.isArray(q.options) ? q.options.map(String) : []),
    correct_answer: q.displayAnswer || String(q.answer),
    scenario: q.story,
    question: q.question,
    hint: q.hint,
  }));
}