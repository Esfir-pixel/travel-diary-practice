
// BOOKSTORE (оставляем как было, чтобы не сломать старый проект)
export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  year_written: number | null;
  description: string | null;
  cover_url: string | null;
  price: number;
  rent_price_2w: number | null;
  rent_price_1m: number | null;
  rent_price_3m: number | null;
  stock: number;
  status: 'available' | 'hidden' | 'archived';
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: number;
  user_id: string;
  book_id: number;
  type: 'purchase' | 'rent';
  rental_period: '2w' | '1m' | '3m' | null;
  price_paid: number;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'expired' | 'returned' | 'completed';
  reminder_sent: boolean;
  created_at: string;
};

export type TransactionWithBook = Transaction & { books: Book };

=
// TRAVEL DIARY (новые типы)

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  cost: number | null;
  safety_rating: number | null;
  start_date: string | null;
  end_date: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type TripPhoto = {
  id: number;
  trip_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

// Расширенные типы для UI (join с profiles / trip_photos)
export type TripWithProfile = Trip & {
  profiles: Pick<Profile, 'id' | 'email' | 'full_name'> | null;
};

export type TripWithDetails = TripWithProfile & {
  trip_photos: TripPhoto[];
};
