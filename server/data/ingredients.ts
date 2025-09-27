// Large ingredient dataset (sample expandable).
// In production you might load from a DB or external API.
export const INGREDIENTS: string[] = [
  'apple','apricot','artichoke','arugula','asparagus','avocado','banana','basil','bay leaf','beans','beef broth','black beans','black pepper','blueberry','bok choy','bread crumbs','broccoli','brown rice','brussels sprouts','butter','cabbage','canola oil','capers','carrot','cauliflower','celery','chia seeds','chicken breast','chicken thighs','chickpeas','cilantro','cinnamon','cocoa powder','coconut milk','coconut oil','corn','corn starch','cottage cheese','cranberry','cream cheese','cucumber','cumin','currants','curry powder','dates','dill','egg','eggplant','fennel','flax seeds','garlic','ginger','goat cheese','green beans','green onion','ground beef','ground turkey','honey','jalapeno','kale','kidney beans','lemon','lentils','lettuce','lime','maple syrup','mayonnaise','milk','mint','miso','mozzarella','mushroom','mustard','nutmeg','oats','olive oil','onion','orange','paprika','parmesan','parsley','peach','peanut butter','peanuts','pear','peas','pesto','pine nuts','pinto beans','pistachios','plantain','pork loin','potato','pumpkin','quinoa','radish','raisins','raspberry','red bell pepper','red cabbage','red onion','rice','rice vinegar','rosemary','sage','salmon','sesame oil','sesame seeds','shrimp','soy sauce','spinach','squash','strawberry','sunflower seeds','sweet potato','thyme','tortilla','tofu','tomato','turmeric','tuna','vanilla extract','walnuts','watermelon','yogurt','zucchini'
];

export function searchIngredients(q: string, limit = 50): string[] {
  if (!q) return INGREDIENTS.slice(0, limit);
  const needle = q.toLowerCase();
  return INGREDIENTS.filter(i => i.includes(needle)).slice(0, limit);
}
