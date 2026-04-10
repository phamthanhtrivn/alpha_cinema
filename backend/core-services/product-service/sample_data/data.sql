DROP DATABASE IF EXISTS alpha_product_db;

CREATE DATABASE alpha_product_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

INSERT INTO alpha_product_db.artists (`id`, `full_name`, `bio`, `date_of_birth`, `nationality`, `avatar_url`, `type`, `created_at`)
VALUES
    (UUID(), 'Tom Hanks', 'Nam diễn viên kỳ cựu của Hollywood, nổi tiếng với Forrest Gump và Cast Away.', '1956-07-09', 'USA', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067653/tom_hanks_xc4myu.jpg', 'ACTOR', NOW()),
    (UUID(), 'Leonardo DiCaprio', 'Chủ nhân giải Oscar, nổi tiếng với Titanic, Inception và The Revenant.', '1974-11-11', 'USA', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067653/leo_dicaprio_vu8yds.webp', 'ACTOR', NOW()),
    (UUID(), 'Scarlett Johansson', 'Nữ diễn viên đóng vai Black Widow trong vũ trụ điện ảnh Marvel.', '1984-11-22', 'USA', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067659/scarlett_j_zpnjar.jpg', 'ACTOR', NOW()),
    (UUID(), 'Margot Robbie', 'Nữ diễn viên người Úc, nổi tiếng với vai Harley Quinn và phim Barbie.', '1990-07-02', 'Australia', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067653/margot_robbie_tkqptq.jpg', 'ACTOR', NOW()),
    (UUID(), 'Cillian Murphy', 'Nam diễn viên chính trong Oppenheimer và series Peaky Blinders.', '1976-05-25', 'Ireland', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067653/cillian_m_mgsezs.jpg', 'ACTOR', NOW()),
    (UUID(), 'Song Kang-ho', 'Nam diễn viên gạo cội Hàn Quốc, ngôi sao của phim Parasite.', '1967-01-17', 'South Korea', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067655/song_kh_wtdr2g.jpg', 'ACTOR', NOW()),
    (UUID(), 'Gal Gadot', 'Nữ diễn viên người Israel, được biết đến với vai Wonder Woman.', '1985-04-30', 'Israel', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067654/gal_gadot_edfhfm.jpg', 'ACTOR', NOW()),
    (UUID(), 'Ninh Dương Lan Ngọc', 'Nữ diễn viên hàng đầu Việt Nam, được mệnh danh là Ngọc nữ màn ảnh.', '1990-04-04', 'Vietnam', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067654/lan_ngoc_clfli2.jpg', 'ACTOR', NOW()),
    (UUID(), 'Trấn Thành', 'Diễn viên, đạo diễn và MC nổi tiếng nhất Việt Nam với các dự án Bố Già, Mai.', '1987-02-05', 'Vietnam', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067653/tran_thanh_uahcde.jpg', 'ACTOR', NOW()),
    (UUID(), 'Ngô Thanh Vân', 'Được biết đến với biệt danh "Đả nữ", vừa là diễn viên vừa là đạo diễn.', '1979-02-26', 'Vietnam', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1774067653/ngo_thanh_van_clgbti.jpg', 'ACTOR', NOW());

select * from artists;

# SHOW CREATE TABLE alpha_product_db.artists;

-- Chèn dữ liệu Age Type (Lưu ý: Bạn hãy chạy lệnh này trước tiên)
INSERT INTO alpha_product_db.age_types (id, name, description, created_at, updated_at) VALUES
                                                                         ('age-type-p', 'P', 'Phim được phép phổ biến đến mọi độ tuổi', NOW(), NOW()),
                                                                         ('age-type-t13', 'T13', 'Phim cấm khán giả dưới 13 tuổi', NOW(), NOW()),
                                                                         ('age-type-t16', 'T16', 'Phim cấm khán giả dưới 16 tuổi', NOW(), NOW()),
                                                                         ('age-type-t18', 'T18', 'Phim cấm khán giả dưới 18 tuổi', NOW(), NOW());

-- 10 Phim Đang Chiếu (SHOWING) và 2 Phim Sắp Chiếu (COMING_SOON)
INSERT INTO alpha_product_db.movies (id, title, duration, premiere_date, producer, description, trailer_url, thumbnail_url, age_type_id, release_year, nationality, release_status, avg_rating, created_at, updated_at) VALUES
                                                                                                                                                                                                          ('movie-01', 'Forrest Gump', 142, '1994-07-06', 'Paramount Pictures', 'Cuộc đời của một người đàn ông có IQ 75 nhưng lại trải qua những sự kiện lịch sử vĩ đại nhất nước Mỹ.', 'https://youtube.com/watch?v=bLvqoHBptjg', 'https://res.cloudinary.com/demo/image/upload/forrest_gump.jpg', 'age-type-p', 1994, 'USA', 'NOW_SHOWING', 8.8, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-02', 'Inception', 148, '2010-07-16', 'Warner Bros', 'Một kẻ cắp chuyên nghiệp thực hiện nhiệm vụ cấy ghép ý tưởng vào giấc mơ của mục tiêu.', 'https://youtube.com/watch?v=8hP9D6kZseM', 'https://res.cloudinary.com/demo/image/upload/inception.jpg', 'age-type-t13', 2010, 'USA', 'NOW_SHOWING', 8.8, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-03', 'Black Widow', 134, '2021-07-09', 'Marvel Studios', 'Quá khứ đen tối của Natasha Romanoff trước khi cô gia nhập Avengers.', 'https://youtube.com/watch?v=Fp9pNPdNwjI', 'https://res.cloudinary.com/demo/image/upload/black_widow.jpg', 'age-type-t13', 2021, 'USA', 'NOW_SHOWING', 6.7, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-04', 'Barbie', 114, '2023-07-21', 'Warner Bros', 'Búp bê Barbie bị trục xuất khỏi Barbieland vì không đủ hoàn hảo, cô quyết định phiêu lưu đến thế giới thực.', 'https://youtube.com/watch?v=pBk4NYhWNMM', 'https://res.cloudinary.com/demo/image/upload/barbie.jpg', 'age-type-p', 2023, 'USA', 'NOW_SHOWING', 7.0, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-05', 'Oppenheimer', 180, '2023-07-21', 'Universal Pictures', 'Câu chuyện về J. Robert Oppenheimer và dự án Manhattan chế tạo bom nguyên tử.', 'https://youtube.com/watch?v=uYPbbksJxIg', 'https://res.cloudinary.com/demo/image/upload/oppenheimer.jpg', 'age-type-t16', 2023, 'USA', 'NOW_SHOWING', 8.4, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-06', 'Parasite (Ký Sinh Trùng)', 132, '2019-05-30', 'CJ Entertainment', 'Bi kịch nảy sinh khi một gia đình nghèo tìm cách lọt vào làm thuê cho một gia đình thượng lưu.', 'https://youtube.com/watch?v=5xV14r1w1n0', 'https://res.cloudinary.com/demo/image/upload/parasite.jpg', 'age-type-t18', 2019, 'South Korea', 'NOW_SHOWING', 8.5, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-07', 'Wonder Woman', 141, '2017-06-02', 'DC Films', 'Công chúa chiến binh Diana rời hòn đảo quê hương để chấm dứt cuộc Thế chiến thứ nhất.', 'https://youtube.com/watch?v=1Q8fG0TtVAY', 'https://res.cloudinary.com/demo/image/upload/wonder_woman.jpg', 'age-type-t13', 2017, 'USA', 'NOW_SHOWING', 7.4, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-08', 'Cua Lại Vợ Bầu', 100, '2019-02-05', 'Galaxy Studio', 'Chuyện tình dang dở của Trọng Thoại và Nhã Linh, cùng sự xuất hiện của tình cũ Quý Khánh.', 'https://youtube.com/watch?v=123456789', 'https://res.cloudinary.com/demo/image/upload/cua_lai_vo_bau.jpg', 'age-type-t16', 2019, 'Vietnam', 'NOW_SHOWING', 6.8, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-09', 'Mai', 131, '2024-02-10', 'Trấn Thành Town', 'Cuộc đời nhiều biến cố của Mai, một phụ nữ làm nghề mát-xa và mối tình với chàng nhạc sĩ kém tuổi.', 'https://youtube.com/watch?v=123456789', 'https://res.cloudinary.com/demo/image/upload/mai.jpg', 'age-type-t18', 2024, 'Vietnam', 'NOW_SHOWING', 7.5, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-10', 'Hai Phượng', 98, '2019-02-22', 'Studio68', 'Hành trình nghẹt thở của Hai Phượng đi tìm lại đứa con gái bị bắt cóc.', 'https://youtube.com/watch?v=123456789', 'https://res.cloudinary.com/demo/image/upload/hai_phuong.jpg', 'age-type-t18', 2019, 'Vietnam', 'NOW_SHOWING', 7.1, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-11', 'Dune: Hành Tinh Cát - Phần 2', 166, '2024-03-01', 'Warner Bros', 'Paul Atreides liên minh với người Fremen để trả thù những kẻ đã hủy hoại gia đình anh.', 'https://youtube.com/watch?v=Way9Dexny3w', 'https://res.cloudinary.com/demo/image/upload/dune2.jpg', 'age-type-t13', 2024, 'USA', 'UPCOMING', 8.8, NOW(), NOW()),

                                                                                                                                                                                                          ('movie-12', 'Lật Mặt 7: Một Điều Ước', 120, '2026-04-26', 'Ly Hai Production', 'Phần tiếp theo trong series phim ăn khách nhất điện ảnh Việt Nam của đạo diễn Lý Hải.', 'https://youtube.com/watch?v=123456789', 'https://res.cloudinary.com/demo/image/upload/lat_mat_7.jpg', 'age-type-p', 2026, 'Vietnam', 'UPCOMING', 0.0, NOW(), NOW());

-- 3.1. Gắn Thể loại phim (Genres)
INSERT INTO alpha_product_db.movie_genres (movie_id, genre) VALUES
                                               ('movie-01', 'Drama'), ('movie-01', 'Romance'),
                                               ('movie-02', 'Action'), ('movie-02', 'Sci-Fi'), ('movie-02', 'Thriller'),
                                               ('movie-03', 'Action'), ('movie-03', 'Adventure'),
                                               ('movie-04', 'Comedy'), ('movie-04', 'Fantasy'),
                                               ('movie-05', 'Biography'), ('movie-05', 'Drama'), ('movie-05', 'History'),
                                               ('movie-06', 'Drama'), ('movie-06', 'Thriller'),
                                               ('movie-07', 'Action'), ('movie-07', 'Fantasy'),
                                               ('movie-08', 'Comedy'), ('movie-08', 'Romance'),
                                               ('movie-09', 'Drama'), ('movie-09', 'Romance'),
                                               ('movie-10', 'Action'), ('movie-10', 'Crime');

-- 3.2. Gắn Diễn viên vào Phim (Dùng chính ID bạn cung cấp)
INSERT INTO alpha_product_db.movie_actors (movie_id, artist_id) VALUES
                                                   ('movie-01', '30860f82-24e1-11f1-a03f-5b94d571b330'), -- Tom Hanks -> Forrest Gump
                                                   ('movie-02', '3086803f-24e1-11f1-a03f-5b94d571b330'), -- Leonardo -> Inception
                                                   ('movie-03', '30869dba-24e1-11f1-a03f-5b94d571b330'), -- Scarlett -> Black Widow
                                                   ('movie-04', '30869f20-24e1-11f1-a03f-5b94d571b330'), -- Margot Robbie -> Barbie
                                                   ('movie-05', '30869f76-24e1-11f1-a03f-5b94d571b330'), -- Cillian Murphy -> Oppenheimer
                                                   ('movie-06', '30869fd7-24e1-11f1-a03f-5b94d571b330'), -- Song Kang-ho -> Parasite
                                                   ('movie-07', '3086a052-24e1-11f1-a03f-5b94d571b330'), -- Gal Gadot -> Wonder Woman
                                                   ('movie-08', '3086a1cd-24e1-11f1-a03f-5b94d571b330'), -- Lan Ngọc -> Cua Lại Vợ Bầu
                                                   ('movie-08', '3086a22b-24e1-11f1-a03f-5b94d571b330'), -- Trấn Thành -> Cua Lại Vợ Bầu
                                                   ('movie-09', '3086a22b-24e1-11f1-a03f-5b94d571b330'), -- Trấn Thành -> Mai
                                                   ('movie-10', '3086a277-24e1-11f1-a03f-5b94d571b330'); -- Ngô Thanh Vân -> Hai Phượng

-- 3.3. Gắn Đạo diễn vào Phim (Giả định Trấn Thành đạo diễn Mai, Ngô Thanh Vân đạo diễn Hai Phượng)
INSERT INTO alpha_product_db.movie_directors (movie_id, artist_id) VALUES
                                                      ('movie-09', '3086a22b-24e1-11f1-a03f-5b94d571b330'), -- Trấn Thành
                                                      ('movie-10', '3086a277-24e1-11f1-a03f-5b94d571b330'); -- Ngô Thanh Vân

-- 3.4. Định dạng chiếu (Giả định Enum là: 2D, 3D, IMAX)
INSERT INTO alpha_product_db.movie_projections (movie_id, projection_type) VALUES
                                                              ('movie-02', '_2D'), ('movie-02', 'IMAX'),
                                                              ('movie-03', '_2D'), ('movie-03', '_3D'), ('movie-03', 'IMAX'),
                                                              ('movie-05', '_2D'), ('movie-05', 'IMAX'),
                                                              ('movie-09', '_2D'),
                                                              ('movie-11', '_2D'), ('movie-11', 'IMAX');

-- 3.5. Dịch thuật (Giả định Enum là: SUBTITLED (Phụ đề), DUBBED (Lồng tiếng))
INSERT INTO movie_translations (movie_id, translation_type) VALUES
                                                                ('movie-02', 'SUBTITLES'), ('movie-02', 'DUBBING'),
                                                                ('movie-03', 'SUBTITLES'), ('movie-03', 'DUBBING'),
                                                                ('movie-05', 'SUBTITLES'),
                                                                ('movie-09', 'SUBTITLES'); -- Phim Việt thì coi như chỉ có bản gốc

select * from alpha_product_db.movies;

select * from age_types;