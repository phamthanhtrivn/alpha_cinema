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

SHOW CREATE TABLE alpha_product_db.artists;