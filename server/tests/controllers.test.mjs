import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking } from '../controllers/bookingController.ts';
import { approveRestaurants } from '../controllers/adminController.ts';
import { ragisterUser } from '../controllers/authController.ts';
import { Restaurant } from '../models/Restaurant.ts';
import { Booking } from '../models/Booking.ts';
import { User } from '../models/user.ts';

function response() {
  return { code: 200, body: undefined, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test('booking capacity uses existing bookings and stops before creating an overbooked reservation', async t => {
  t.mock.method(Restaurant, 'findById', async () => ({ status: 'approved', availableSlots: ['19:00'], totalSeats: 4 }));
  let query;
  t.mock.method(Booking, 'find', async q => { query = q; return [{ guests: 3 }]; });
  let created = false;
  t.mock.method(Booking, 'create', async () => { created = true; });
  const res = response();
  await createBooking({ body: { restaurantId: 'r1', date: '2099-01-01', time: '19:00', guests: 2 }, user: { _id: 'u1' } }, res);
  assert.equal(query.restaurants, 'r1');
  assert.equal(res.code, 400);
  assert.equal(created, false);
});

test('booking returns the populated reservation when capacity is available', async t => {
  t.mock.method(Restaurant, 'findById', async () => ({ status: 'approved', availableSlots: ['19:00'], totalSeats: 4 }));
  t.mock.method(Booking, 'find', async () => []);
  t.mock.method(Booking, 'create', async data => ({ populate: async field => ({ ...data, populated: field, bookingId: 'GR-1' }) }));
  const res = response();
  await createBooking({ body: { restaurantId: 'r1', date: '2099-01-01', time: '19:00', guests: 2 }, user: { _id: 'u1' } }, res);
  assert.equal(res.code, 201);
  assert.equal(res.body.populated, 'restaurants');
  assert.equal(res.body.bookingId, 'GR-1');
});

test('admin approval reads the submitted status', async t => {
  const restaurant = { status: 'pending', save: async () => {} };
  t.mock.method(Restaurant, 'findById', async () => restaurant);
  const res = response();
  await approveRestaurants({ body: { status: 'approved' }, params: { id: 'r1' } }, res);
  assert.equal(res.code, 200);
  assert.equal(restaurant.status, 'approved');
});

test('registration cannot grant admin privileges', async t => {
  t.mock.method(User, 'findOne', async () => null);
  let role;
  t.mock.method(User, 'create', async data => { role = data.role; return { ...data, _id: 'u1' }; });
  process.env.JWT_SECRECT = 'test-only-secret';
  const res = response();
  await ragisterUser({ body: { name: 'Test', email: 'test@example.com', password: 'password123', role: 'admin' } }, res);
  assert.equal(res.code, 201);
  assert.equal(role, 'user');
});
