
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

async function checkLectures() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    const [results] = await sequelize.query(
      SELECT 
        id, 
        title, 
        duration_minutes, 
        order_index, 
        is_published,
        CASE WHEN video_url IS NOT NULL THEN 'Has Video' ELSE 'No Video' END as video_status,
        created_at
      FROM lectures 
      WHERE chapter_id = 2 
      ORDER BY order_index
    );
    
    console.log('\\n Lectures in Chapter ID=2:');
    console.log(''.repeat(50));
    
    results.forEach((lecture, index) => {
      const status = lecture.is_published ? ' Published' : ' Draft';
      console.log(${index + 1}. );
      console.log(    |  | min);
      console.log(   Order:  | ID: );
      console.log('');
    });
    
    console.log(' Statistics:');
    console.log(- Total lectures: );
    console.log(- Published: );
    console.log(- Drafts: );
    console.log(- With video: );
    console.log(- Total duration:  minutes);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkLectures();

