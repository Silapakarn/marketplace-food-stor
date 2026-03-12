-- First, get the THB currency ID
-- Update all products to use THB currency and add image URLs
UPDATE products SET 
  currency_id = (SELECT id FROM currencies WHERE code = 'THB'),
  image_url = CASE 
    WHEN name = 'Red Set' THEN 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
    WHEN name = 'Green Set' THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'
    WHEN name = 'Blue Set' THEN 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    WHEN name = 'Yellow Set' THEN 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
    WHEN name = 'Pink Set' THEN 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400'
    WHEN name = 'Purple Set' THEN 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    WHEN name = 'Orange Set' THEN 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
    ELSE NULL
  END
WHERE currency_id IS NULL;
