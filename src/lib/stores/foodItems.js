import { writable } from 'svelte/store';

// Initial food items data
const initialFoodItems = [
  {
    id: 1,
    name: 'Pizza',
    description: 'Italian dish with a round, flattened base of leavened wheat-based dough topped with various ingredients',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 2,
    name: 'Sushi',
    description: 'Japanese dish of prepared vinegared rice accompanied by a variety of ingredients such as seafood',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 3,
    name: 'Burger',
    description: 'Sandwich consisting of fillings—usually a patty of ground meat placed inside a sliced bun',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 4,
    name: 'Pasta',
    description: 'Italian food made from a dough of flour, water, and eggs, formed into various shapes',
    imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 5,
    name: 'Tacos',
    description: 'Traditional Mexican dish consisting of a corn or wheat tortilla folded or rolled around a filling',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 6,
    name: 'Ice Cream',
    description: 'A frozen dessert made from cream, milk, and sugar, often with fruits, nuts, or other flavorings',
    imageUrl: 'https://images.unsplash.com/photo-1629385744943-c96d2288fb5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 7,
    name: 'Chocolate',
    description: 'Sweet food product made from roasted and ground cacao seeds',
    imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 8,
    name: 'Curry',
    description: 'A dish with a sauce seasoned with spices, originally from the Indian subcontinent',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 9,
    name: 'Ramen',
    description: 'Japanese noodle soup dish with wheat noodles served in a meat or fish-based broth',
    imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  },
  {
    id: 10,
    name: 'Steak',
    description: 'A slice of meat, typically beef, cut from the fleshy part of an animal or large fish',
    imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    rating: 1200
  }
];

// Create the writable store
const foodItems = writable(initialFoodItems);

export default foodItems;