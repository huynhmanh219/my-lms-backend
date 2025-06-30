-- Sample Lectures Data for Chapter ID = 2
-- Make sure Chapter ID = 2 exists and belongs to Subject ID = 7

-- First, check if chapter exists
SELECT 
    c.id as chapter_id,
    c.title as chapter_title,
    c.subject_id,
    s.subject_name,
    s.subject_code
FROM chapters c
JOIN subjects s ON c.subject_id = s.id
WHERE c.id = 2;

-- Get current max order_index in chapter 2
SELECT MAX(order_index) as max_order FROM lectures WHERE chapter_id = 2;

-- Insert sample lecture data
INSERT INTO lectures (chapter_id, title, content, video_url, duration_minutes, order_index, is_published, created_at, updated_at) VALUES

-- Bài 1: Published with video
(2, 'Bài 1: Giới thiệu về lập trình web', 
'Trong bài học này, chúng ta sẽ tìm hiểu về các khái niệm cơ bản của lập trình web, bao gồm HTML, CSS và JavaScript. Đây là nền tảng quan trọng để bạn có thể phát triển các ứng dụng web hiện đại.',
'https://example.com/videos/lecture1.mp4', 45, 1, true, NOW(), NOW()),

-- Bài 2: Published with video
(2, 'Bài 2: HTML cơ bản và cấu trúc trang web',
'Học cách tạo cấu trúc cơ bản của một trang web sử dụng HTML. Chúng ta sẽ tìm hiểu về các thẻ HTML quan trọng, thuộc tính và cách tổ chức nội dung một cách có ý nghĩa.',
'https://example.com/videos/lecture2.mp4', 60, 2, true, NOW(), NOW()),

-- Bài 3: Published with video
(2, 'Bài 3: CSS - Styling và định dạng giao diện',
'Tìm hiểu cách sử dụng CSS để tạo style cho trang web. Bao gồm các selector, properties, layout và responsive design để trang web hiển thị đẹp trên mọi thiết bị.',
'https://example.com/videos/lecture3.mp4', 75, 3, true, NOW(), NOW()),

-- Bài 4: Draft with video
(2, 'Bài 4: JavaScript cơ bản và tương tác',
'Khám phá JavaScript - ngôn ngữ lập trình để tạo tương tác cho trang web. Học về biến, hàm, sự kiện và cách thao tác với DOM để tạo các tính năng động.',
'https://example.com/videos/lecture4.mp4', 90, 4, false, NOW(), NOW()),

-- Bài 5: Published with video
(2, 'Bài 5: Form và validation trong web',
'Học cách tạo và xử lý form trong HTML. Bao gồm các loại input, validation phía client và server, cũng như cách tạo trải nghiệm người dùng tốt với form.',
'https://example.com/videos/lecture5.mp4', 50, 5, true, NOW(), NOW()),

-- Bài 6: Draft without video
(2, 'Bài 6: Responsive Design và Mobile First',
'Tìm hiểu về thiết kế responsive để trang web hoạt động tốt trên mọi thiết bị. Học về media queries, flexible layouts và mobile-first approach.',
NULL, 40, 6, false, NOW(), NOW()),

-- Bài 7: Published with video
(2, 'Bài 7: Introduction to Web APIs',
'Giới thiệu về Web APIs và cách sử dụng fetch API để lấy dữ liệu từ server. Học về REST API, JSON và cách xử lý dữ liệu bất đồng bộ.',
'https://example.com/videos/lecture7.mp4', 65, 7, true, NOW(), NOW()),

-- Bài 8: Draft project
(2, 'Bài 8: Project thực hành - Tạo website cá nhân',
'Áp dụng tất cả kiến thức đã học để tạo một website cá nhân hoàn chỉnh. Bao gồm trang chủ, giới thiệu, portfolio và liên hệ với responsive design.',
'https://example.com/videos/lecture8.mp4', 120, 8, false, NOW(), NOW()),

-- Bài 9: Published advanced topic
(2, 'Bài 9: Git và GitHub cho developer',
'Học cách sử dụng Git để quản lý source code và GitHub để chia sẻ dự án. Bao gồm các lệnh Git cơ bản, branching, merging và collaboration.',
'https://example.com/videos/lecture9.mp4', 80, 9, true, NOW(), NOW()),

-- Bài 10: Draft bonus content
(2, 'Bài 10: Deployment và hosting website',
'Tìm hiểu cách deploy website lên internet sử dụng các dịch vụ hosting miễn phí và trả phí. Bao gồm Netlify, Vercel, GitHub Pages và domain configuration.',
NULL, 55, 10, false, NOW(), NOW());

-- Verify inserted data
SELECT 
    l.id,
    l.title,
    l.duration_minutes,
    l.order_index,
    l.is_published,
    CASE 
        WHEN l.video_url IS NOT NULL THEN 'Has Video'
        ELSE 'No Video'
    END as video_status,
    l.created_at
FROM lectures l
WHERE l.chapter_id = 2
ORDER BY l.order_index;

-- Summary statistics
SELECT 
    COUNT(*) as total_lectures,
    SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published_count,
    SUM(CASE WHEN is_published = false THEN 1 ELSE 0 END) as draft_count,
    SUM(CASE WHEN video_url IS NOT NULL THEN 1 ELSE 0 END) as with_video_count,
    SUM(duration_minutes) as total_duration_minutes,
    ROUND(SUM(duration_minutes) / 60.0, 1) as total_duration_hours
FROM lectures
WHERE chapter_id = 2; 