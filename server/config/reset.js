import { pool } from './database.js'
import 'dotenv/config';


const reset = async () => {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS invalid_option_pairs;
      DROP TABLE IF EXISTS custom_items;
      DROP TABLE IF EXISTS options;
      DROP TABLE IF EXISTS features;

      CREATE TABLE features (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE options (
        id SERIAL PRIMARY KEY,
        feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        price_delta NUMERIC NOT NULL DEFAULT 0,
        icon_url TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE invalid_option_pairs (
        id SERIAL PRIMARY KEY,
        option_a INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
        option_b INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
        CHECK (option_a <> option_b)
      );

      CREATE TABLE custom_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        base_price NUMERIC NOT NULL DEFAULT 0,
        selected_option_ids INTEGER[] NOT NULL DEFAULT '{}',
        total_price NUMERIC NOT NULL DEFAULT 0,
        preview_url TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)

    const { rows: feats } = await pool.query(`
      INSERT INTO features (name) VALUES
        ('Exterior Color'), ('Wheels'), ('Trim')
      RETURNING id, name;
    `)

    const idByName = Object.fromEntries(feats.map(f => [f.name, f.id]))

    await pool.query(`
      INSERT INTO options (feature_id, label, price_delta, icon_url) VALUES
        (${idByName['Exterior Color']}, 'Red', 0, 'https://tack-and-turnout.co.uk/wp-content/uploads/2017/03/Square-500x500-red.png'),
        (${idByName['Exterior Color']}, 'Blue', 0, 'https://tack-and-turnout.co.uk/wp-content/uploads/2017/03/Square-500x500-blue.png'),
        (${idByName['Exterior Color']}, 'Matte Black', 300, 'https://lowcostvinyl.com/cdn/shop/products/matte_black_sheet_pic_grande.jpg?v=1483816160'),
        (${idByName['Wheels']}, '18-inch', 0, 'https://suncoastwheels.com/cdn/shop/products/LX19-18080-5450-35C-1.jpg?v=1749762188'),
        (${idByName['Wheels']}, '20-inch', 500, 'https://m.media-amazon.com/images/I/51LDAgHCSvL.jpg'),
        (${idByName['Trim']}, 'Chrome', 200, 'https://online.hexis.co.uk/streamProductImage.aspx?&width=500&height=500&paddingColour=ffffff&ref=HX30SCH03B&ver=2'),
        (${idByName['Trim']}, 'Chrome Rose Gold', 200, 'https://online.hexis.co.uk/streamProductImage.aspx?&width=500&height=500&paddingColour=ffffff&ref=HX30SCH12B&ver=2');
    `)

    await pool.query(`
      INSERT INTO invalid_option_pairs (option_a, option_b)
      SELECT o1.id, o2.id
      FROM options o1, options o2
      WHERE o1.label = 'Chrome Rose Gold' AND o2.label = 'Chrome' AND o1.id < o2.id;
    `)

    console.log('✅ DB inserted')
  } catch (e) {
    console.error('❌ reset error', e)
  } finally {
    await pool.end()
  }
}

reset()
