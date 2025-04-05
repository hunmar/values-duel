import { writable } from 'svelte/store';

// Initial food items data
// Function to create a placeholder image URL with appropriate colors for food type
function getFoodPlaceholder(name, fgColor = '333333', bgColor = 'f8f8f8') {
  return `https://via.placeholder.com/500x400/${bgColor}/${fgColor}?text=${encodeURIComponent(name)}`;
}

const initialFoodItems = [
  {
    id: 1,
    name: 'Pizza',
    description: 'Italian dish with a round, flattened base of leavened wheat-based dough topped with various ingredients',
    imageUrl: 'https://via.placeholder.com/500x400/ffedd5/cc0000?text=Pizza',
    fallbackUrl: getFoodPlaceholder('Pizza', 'cc0000', 'ffedd5'),
    rating: 1200
  },
  {
    id: 2,
    name: 'Sushi',
    description: 'Japanese dish of prepared vinegared rice accompanied by a variety of ingredients such as seafood',
    imageUrl: 'https://via.placeholder.com/500x400/f5f5f5/2a6099?text=Sushi',
    fallbackUrl: getFoodPlaceholder('Sushi', '2a6099', 'f5f5f5'),
    rating: 1200
  },
  {
    id: 3,
    name: 'Burger',
    description: 'Sandwich consisting of fillings—usually a patty of ground meat placed inside a sliced bun',
    imageUrl: 'https://via.placeholder.com/500x400/fff9e6/663300?text=Burger',
    fallbackUrl: getFoodPlaceholder('Burger', '663300', 'fff9e6'),
    rating: 1200
  },
  {
    id: 4,
    name: 'Pasta',
    description: 'Italian food made from a dough of flour, water, and eggs, formed into various shapes',
    imageUrl: 'https://via.placeholder.com/500x400/fff5e6/cc6600?text=Pasta',
    fallbackUrl: getFoodPlaceholder('Pasta', 'cc6600', 'fff5e6'),
    rating: 1200
  },
  {
    id: 5,
    name: 'Tacos',
    description: 'Traditional Mexican dish consisting of a corn or wheat tortilla folded or rolled around a filling',
    imageUrl: 'https://via.placeholder.com/500x400/ffe6cc/993300?text=Tacos',
    fallbackUrl: getFoodPlaceholder('Tacos', '993300', 'ffe6cc'),
    rating: 1200
  },
  {
    id: 6,
    name: 'Ice Cream',
    description: 'A frozen dessert made from cream, milk, and sugar, often with fruits, nuts, or other flavorings',
    imageUrl: 'https://via.placeholder.com/500x400/e8f5ff/2b68a7?text=Ice+Cream',
    fallbackUrl: getFoodPlaceholder('Ice Cream', '2b68a7', 'e8f5ff'),
    rating: 1200
  },
  {
    id: 7,
    name: 'Chocolate',
    description: 'Sweet food product made from roasted and ground cacao seeds',
    imageUrl: 'https://via.placeholder.com/500x400/472a18/ffd95c?text=Chocolate',
    fallbackUrl: getFoodPlaceholder('Chocolate', 'ffd95c', '472a18'),
    rating: 1200
  },
  {
    id: 8,
    name: 'Curry',
    description: 'A dish with a sauce seasoned with spices, originally from the Indian subcontinent',
    imageUrl: 'https://via.placeholder.com/500x400/fff2cc/cc6600?text=Curry',
    fallbackUrl: getFoodPlaceholder('Curry', 'cc6600', 'fff2cc'),
    rating: 1200
  },
  {
    id: 9,
    name: 'Ramen',
    description: 'Japanese noodle soup dish with wheat noodles served in a meat or fish-based broth',
    imageUrl: 'https://via.placeholder.com/500x400/f9f2ec/8c6d46?text=Ramen',
    fallbackUrl: getFoodPlaceholder('Ramen', '8c6d46', 'f9f2ec'),
    rating: 1200
  },
  {
    id: 10,
    name: 'Steak',
    description: 'A slice of meat, typically beef, cut from the fleshy part of an animal or large fish',
    imageUrl: 'https://via.placeholder.com/500x400/ffe6e6/990000?text=Steak',
    fallbackUrl: getFoodPlaceholder('Steak', '990000', 'ffe6e6'),
    rating: 1200
  }
];

// Create the writable store
const foodItems = writable(initialFoodItems);

export default foodItems;