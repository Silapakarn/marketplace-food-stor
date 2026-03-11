-- Seed data for Food Store Calculator

-- Insert products
INSERT INTO products (name, color, price, has_pair_discount) VALUES
    ('Red Set', 'red', 50.00, FALSE),
    ('Green Set', 'green', 40.00, TRUE),
    ('Blue Set', 'blue', 30.00, FALSE),
    ('Yellow Set', 'yellow', 50.00, FALSE),
    ('Pink Set', 'pink', 80.00, TRUE),
    ('Purple Set', 'purple', 90.00, FALSE),
    ('Orange Set', 'orange', 120.00, TRUE)
ON CONFLICT (color) DO NOTHING;
