export const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439012',
    username: 'BakeryKing',
    email: 'bakery@example.com',
    phone_number: '+1234567890',
    photo_url: 'user1.jpg',
    createdAt: '2023-05-15T10:00:00Z'
  }
];

export const mockBreads = [
  {
    _id: '507f1f77bcf86cd799439011',
    post_type: 'giveaway',
    bread_status: 'day_old',
    photo_url: 'baguette.jpg',
    quantity: 2,
    location: {
      type: 'Point',
      coordinates: [-73.97, 40.77]
    },
    user: {
      _id: '507f1f77bcf86cd799439012',
      username: 'BakeryKing',
      photo_url: 'user1.jpg'
    },
    createdAt: '2023-05-20T08:15:00Z'
  }
];