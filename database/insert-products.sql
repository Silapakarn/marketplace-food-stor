-- Insert the 7 food items with THB currency and image URLs
INSERT INTO products (name, color, price, currency_id, has_pair_discount, image_url) VALUES
('Red Set', 'red', 50.00, (SELECT id FROM currencies WHERE code = 'THB'), true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
('Green Set', 'green', 40.00, (SELECT id FROM currencies WHERE code = 'THB'), true, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'),
('Blue Set', 'blue', 30.00, (SELECT id FROM currencies WHERE code = 'THB'), true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'),
('Yellow Set', 'yellow', 50.00, (SELECT id FROM currencies WHERE code = 'THB'), true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'),
('Pink Set', 'pink', 80.00, (SELECT id FROM currencies WHERE code = 'THB'), true, 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400'),
('Purple Set', 'purple', 90.00, (SELECT id FROM currencies WHERE code = 'THB'), true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'),
('Orange Set', 'orange', 120.00, (SELECT id FROM currencies WHERE code = 'THB'), true, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400');
