const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const sequelize = require('../../src/config/database');
const Lecture = require('../../src/models/Lecture');
const Chapter = require('../../src/models/Chapter');
const Subject = require('../../src/models/Subject');

async function createSampleLectures() {
    try {
        console.log('🔗 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Check if chapter ID=2 exists and belongs to subject ID=7
        console.log('\n🔍 Checking chapter and subject...');
        const chapter = await Chapter.findOne({
            where: { id: 2 },
            include: [{
                model: Subject,
                as: 'subject',
                attributes: ['id', 'subject_name', 'subject_code']
            }]
        });

        if (!chapter) {
            console.error('❌ Chapter ID=2 not found!');
            return;
        }

        if (chapter.subject_id !== 7) {
            console.error(`❌ Chapter ID=2 belongs to subject ID=${chapter.subject_id}, not ID=7!`);
            console.log(`Chapter "${chapter.title}" belongs to subject: ${chapter.subject?.subject_name}`);
            return;
        }

        console.log(`✅ Found chapter: "${chapter.title}"`);
        console.log(`✅ Belongs to subject: ${chapter.subject?.subject_name} (${chapter.subject?.subject_code})`);

        // Check existing lectures in this chapter
        const existingLectures = await Lecture.findAll({
            where: { chapter_id: 2 },
            order: [['order_index', 'ASC']]
        });

        console.log(`\n📊 Found ${existingLectures.length} existing lectures in chapter`);
        
        // Get next order index
        const nextOrderIndex = existingLectures.length > 0 
            ? Math.max(...existingLectures.map(l => l.order_index)) + 1 
            : 1;

        // Sample lecture data
        const sampleLectures = [
            {
                chapter_id: 2,
                title: 'Bài 1: Giới thiệu về lập trình web',
                content: 'Trong bài học này, chúng ta sẽ tìm hiểu về các khái niệm cơ bản của lập trình web, bao gồm HTML, CSS và JavaScript. Đây là nền tảng quan trọng để bạn có thể phát triển các ứng dụng web hiện đại.',
                video_url: 'https://example.com/videos/lecture1.mp4',
                duration_minutes: 45,
                order_index: nextOrderIndex,
                is_published: true
            },
            {
                chapter_id: 2,
                title: 'Bài 2: HTML cơ bản và cấu trúc trang web',
                content: 'Học cách tạo cấu trúc cơ bản của một trang web sử dụng HTML. Chúng ta sẽ tìm hiểu về các thẻ HTML quan trọng, thuộc tính và cách tổ chức nội dung một cách có ý nghĩa.',
                video_url: 'https://example.com/videos/lecture2.mp4',
                duration_minutes: 60,
                order_index: nextOrderIndex + 1,
                is_published: true
            },
            {
                chapter_id: 2,
                title: 'Bài 3: CSS - Styling và định dạng giao diện',
                content: 'Tìm hiểu cách sử dụng CSS để tạo style cho trang web. Bao gồm các selector, properties, layout và responsive design để trang web hiển thị đẹp trên mọi thiết bị.',
                video_url: 'https://example.com/videos/lecture3.mp4',
                duration_minutes: 75,
                order_index: nextOrderIndex + 2,
                is_published: true
            },
            {
                chapter_id: 2,
                title: 'Bài 4: JavaScript cơ bản và tương tác',
                content: 'Khám phá JavaScript - ngôn ngữ lập trình để tạo tương tác cho trang web. Học về biến, hàm, sự kiện và cách thao tác với DOM để tạo các tính năng động.',
                video_url: 'https://example.com/videos/lecture4.mp4',
                duration_minutes: 90,
                order_index: nextOrderIndex + 3,
                is_published: false // Draft lecture
            },
            {
                chapter_id: 2,
                title: 'Bài 5: Form và validation trong web',
                content: 'Học cách tạo và xử lý form trong HTML. Bao gồm các loại input, validation phía client và server, cũng như cách tạo trải nghiệm người dùng tốt với form.',
                video_url: 'https://example.com/videos/lecture5.mp4',
                duration_minutes: 50,
                order_index: nextOrderIndex + 4,
                is_published: true
            },
            {
                chapter_id: 2,
                title: 'Bài 6: Responsive Design và Mobile First',
                content: 'Tìm hiểu về thiết kế responsive để trang web hoạt động tốt trên mọi thiết bị. Học về media queries, flexible layouts và mobile-first approach.',
                video_url: null, // No video yet
                duration_minutes: 40,
                order_index: nextOrderIndex + 5,
                is_published: false
            },
            {
                chapter_id: 2,
                title: 'Bài 7: Introduction to Web APIs',
                content: 'Giới thiệu về Web APIs và cách sử dụng fetch API để lấy dữ liệu từ server. Học về REST API, JSON và cách xử lý dữ liệu bất đồng bộ.',
                video_url: 'https://example.com/videos/lecture7.mp4',
                duration_minutes: 65,
                order_index: nextOrderIndex + 6,
                is_published: true
            },
            {
                chapter_id: 2,
                title: 'Bài 8: Project thực hành - Tạo website cá nhân',
                content: 'Áp dụng tất cả kiến thức đã học để tạo một website cá nhân hoàn chỉnh. Bao gồm trang chủ, giới thiệu, portfolio và liên hệ với responsive design.',
                video_url: 'https://example.com/videos/lecture8.mp4',
                duration_minutes: 120,
                order_index: nextOrderIndex + 7,
                is_published: false // Project assignment
            }
        ];

        console.log(`\n🚀 Creating ${sampleLectures.length} sample lectures...`);

        // Create lectures
        const createdLectures = await Lecture.bulkCreate(sampleLectures, {
            returning: true // Return created records
        });

        console.log('✅ Sample lectures created successfully!\n');

        // Display created lectures
        console.log('📋 Created Lectures:');
        console.log('═'.repeat(80));
        
        createdLectures.forEach((lecture, index) => {
            const status = lecture.is_published ? '✅ Published' : '📝 Draft';
            const video = lecture.video_url ? '🎥 Has Video' : '📝 No Video';
            const duration = lecture.duration_minutes ? `⏱️ ${lecture.duration_minutes}min` : '⏱️ No duration';
            
            console.log(`${index + 1}. ${lecture.title}`);
            console.log(`   📍 Order: ${lecture.order_index} | ${status} | ${video} | ${duration}`);
            console.log(`   📝 ${lecture.content.substring(0, 100)}...`);
            console.log('');
        });

        // Summary
        const publishedCount = createdLectures.filter(l => l.is_published).length;
        const draftCount = createdLectures.filter(l => !l.is_published).length;
        const videoCount = createdLectures.filter(l => l.video_url).length;
        const totalDuration = createdLectures.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

        console.log('📊 Summary:');
        console.log('═'.repeat(40));
        console.log(`📚 Total Lectures: ${createdLectures.length}`);
        console.log(`✅ Published: ${publishedCount}`);
        console.log(`📝 Drafts: ${draftCount}`);
        console.log(`🎥 With Video: ${videoCount}`);
        console.log(`⏱️ Total Duration: ${totalDuration} minutes (${Math.round(totalDuration/60*10)/10} hours)`);
        console.log(`📖 Chapter: ${chapter.title}`);
        console.log(`🎓 Subject: ${chapter.subject?.subject_name} (${chapter.subject?.subject_code})`);

        console.log('\n🎉 Sample data creation completed!');
        console.log('🔗 You can now view these lectures in your LMS application');

    } catch (error) {
        console.error('❌ Error creating sample lectures:', error);
        console.error('Details:', error.message);
    } finally {
        await sequelize.close();
    }
}

// Execute script
if (require.main === module) {
    createSampleLectures();
}

module.exports = createSampleLectures; 