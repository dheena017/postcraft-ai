export interface SampleTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  badge: string;
  csvContent: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'home-decor',
    title: 'Home Decor & Living',
    category: 'Interior Design',
    icon: '🪴',
    badge: '5 Pins',
    csvContent: `Prompt,Title,Description,Board,Link,Schedule_Time
"Cozy Scandinavian living room with neutral linen sofa, olive tree in ceramic pot, warm wood coffee table, sunlit morning aesthetic","10 Cozy Living Room Aesthetic Ideas 2026","Get inspired by minimalist Scandinavian interior styling. Save for your dream home makeover! #homedecor #scandinavian #interiordesign","Home Decor Ideas","https://example.com/cozy-living-rooms","2026-11-12 10:00:00"
"Japandi minimalist zen bedroom with low platform wooden bed, beige linen duvet, bonsai tree, soft diffused paper lantern light","Minimalist Japandi Bedroom Inspo","Transform your sleeping space into a tranquil Japanese-Scandinavian retreat. #japandi #bedroomdecor #zenhome","Home Decor Ideas","https://example.com/japandi-bedroom","2026-11-12 13:00:00"
"Modern bohemian kitchen remodel with sage green shaker cabinets, brass cup handles, white quartz countertops and open shelves","Dream Sage Green Kitchen Decor Inspiration","Discover modern boho kitchen renovations that boost elegance and home value. #kitchenremodel #sagegreen #bohohome","Kitchen Inspiration","https://example.com/kitchen-decor","2026-11-12 16:00:00"
"Luxury modern bathroom with freestanding soaking tub, Calacatta gold marble walls, eucalyptus bundle, natural morning sunlight","Spa-Like Master Bathroom Sanctuary","Elevate your self-care routine with these spa-inspired bathroom fixtures and styling tips. #bathroominspo #spabath #modernhome","Home Decor Ideas","https://example.com/spa-bath","2026-11-12 19:00:00"
"Cozy bay window reading nook with plush floor cushions, stack of hardcover books, chunky knit wool throw, raining outside window","Dream Reading Nook Decor Ideas","Create the ultimate cozy corner for rainy day book reading. #readingnook #cozyhome #booktok","Home Decor Ideas","https://example.com/reading-nook","2026-11-12 22:00:00"`,
  },
  {
    id: 'food-drinks',
    title: 'Aesthetic Cafe & Food',
    category: 'Food & Recipes',
    icon: '☕',
    badge: '5 Pins',
    csvContent: `Prompt,Title,Description,Board,Link,Schedule_Time
"Minimalist matcha iced latte in ribbed glass with bamboo straw, soft bokeh kitchen background, aesthetic morning sunlight","Iced Matcha Latte Aesthetic Recipe","How to make the creamiest barista-quality iced matcha at home in 5 minutes. Tap for the full recipe! #matcha #coffeebar #aestheticdrink","Aesthetic Recipes","https://example.com/matcha-recipe","2026-11-12 09:00:00"
"Golden artisanal sourdough loaf with crispy blistered crust and rustic flour scoring pattern on wooden cutting board","Beginner No-Knead Sourdough Bread Guide","The foolproof guide to baking open-crumb artisanal sourdough at home. Save this pin! #sourdough #breadbaking #artisanfood","Aesthetic Recipes","https://example.com/sourdough-guide","2026-11-12 12:00:00"
"Aesthetic acai smoothie bowl topped with fresh sliced strawberries, blueberries, chia seeds, coconut flakes and edible purple flowers","Vibrant Anti-Oxidant Acai Breakfast Bowl","Fuel your morning with this delicious, nutrient-packed superfood smoothie bowl recipe. #smoothiebowl #healthybreakfast #cleaneating","Aesthetic Recipes","https://example.com/acai-bowl","2026-11-12 15:00:00"
"Warm freshly baked cinnamon rolls with melting cream cheese icing glaze in ceramic baking dish, cozy morning aesthetic","Gooey Homemade Cinnamon Rolls with Cream Cheese Frosting","The fluffiest, melt-in-your-mouth cinnamon buns you will ever bake. #cinnamonrolls #bakingrecipes #dessertinspo","Aesthetic Recipes","https://example.com/cinnamon-rolls","2026-11-12 18:00:00"
"Creamy iced Spanish latte with condensed milk layers and espresso drizzle in tall faceted glassware, afternoon golden light","5-Star Iced Spanish Latte Recipe","Sweet, velvety espresso drink that rivals your favorite specialty coffee shop. #coffeelover #latteart #icedcoffee","Aesthetic Recipes","https://example.com/spanish-latte","2026-11-12 21:00:00"`,
  },
  {
    id: 'fashion-style',
    title: 'Fashion & Outfits',
    category: 'Style & Wardrobe',
    icon: '👗',
    badge: '5 Pins',
    csvContent: `Prompt,Title,Description,Board,Link,Schedule_Time
"Autumn cozy capsule wardrobe flat lay, cashmere camel coat, cream knitted sweater, dark wash denim jeans, leather boots","15 Must-Have Fall Capsule Wardrobe Pieces","Effortless chic autumn outfits you can style on repeat all season long. Save this pin! #capsulewardrobe #fallfashion #outfitinspo","Fashion & Style","https://example.com/capsule-wardrobe","2026-11-12 10:00:00"
"Quiet luxury old money aesthetic street style outfit, oversized tailored blazer, pleated trousers, structured leather handbag in Paris","Old Money Aesthetic Outfit Inspo 2026","Master timeless quiet luxury fashion with these simple neutral outfit combinations. #oldmoneyaesthetic #parisianstyle #quietluxury","Fashion & Style","https://example.com/quiet-luxury","2026-11-12 13:30:00"
"Summer coastal grandmother aesthetic outfit, relaxed linen button-down shirt, white linen pants, woven straw tote bag and sunglasses","Effortless Summer Linen Outfit Ideas","Breezy, comfortable, and chic resortwear styling for warm sunny days. #coastalstyle #linenclothing #summerfashion","Fashion & Style","https://example.com/summer-linen","2026-11-12 17:00:00"
"Minimalist sneaker aesthetic flat lay with retro white trainers, ribbed athletic crew socks, aesthetic canvas tote bag, gold jewelry","Clean Girl Aesthetic Everyday Outfit Essentials","Upgrade your off-duty casual style with these effortless wardrobe staples. #cleangirl #athleisure #streetstyle","Fashion & Style","https://example.com/clean-girl-style","2026-11-12 20:00:00"
"Monochrome evening chic outfit, black slip dress with tailored oversized wool coat, delicate gold layered necklaces and slingback heels","Timeless Minimalist Evening Date Night Look","Sleek and sophisticated evening wear that never goes out of style. #datenightoutfit #minimalistfashion #classicstyle","Fashion & Style","https://example.com/evening-chic","2026-11-12 22:30:00"`,
  },
  {
    id: 'quotes-mindset',
    title: 'Mindset & Affirmations',
    category: 'Inspiration',
    icon: '✨',
    badge: '5 Pins',
    csvContent: `Prompt,Title,Description,Board,Link,Schedule_Time
"Minimalist modern poster aesthetic with warm neutral background, clean typography layout, soft shadows, botanical branch accent","Daily Affirmation: Focus on Growth & Peace","Pin this reminder to cultivate calm confidence and focus on your daily goals. #affirmations #mindset #growthmindset","Daily Motivation","https://example.com/affirmations","2026-11-12 08:30:00"
"Sun-drenched journal desk flat lay with ceramic coffee mug, fountain pen, open leather journal, fresh eucalyptus sprig","5-Minute Morning Journaling Prompts for Clarity","Start each day with intention, gratitude, and clear mental focus. #journaling #morningroutine #selfcare","Daily Motivation","https://example.com/morning-journal","2026-11-12 11:30:00"
"Aesthetic pastel stationery desk setup with leather notebook, gold pen, dried eucalyptus vase, MacBook Pro, warm beige aesthetic","Ultimate Work From Home Aesthetic Desk Setup","Transform your desk into a cozy and productive sanctuary. Full workspace checklist here! #wfhdesk #deskgoals #productivity","Daily Motivation","https://example.com/desk-setup","2026-11-12 14:30:00"
"Moody candlelit evening meditation space with soft textured wool cushions, brass incense burner, delicate smoke curl","Evening Wind-Down Routine for Deep Restful Sleep","Simple calming habits to unplug from screens and restore your peace of mind. #mindfulness #eveningroutine #sleepwellness","Daily Motivation","https://example.com/evening-routine","2026-11-12 18:30:00"
"Inspiring minimalist visionary aesthetic moodboard with neutral fashion swatches, architectural polaroids, clean typography","2026 Vision Board & Goal Setting Guide","How to design an aesthetic digital and physical vision board that actually inspires action. #visionboard #goals2026 #manifestation","Daily Motivation","https://example.com/vision-board","2026-11-12 21:30:00"`,
  },
];

