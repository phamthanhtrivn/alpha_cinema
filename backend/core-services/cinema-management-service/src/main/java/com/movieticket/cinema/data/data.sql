
INSERT INTO alpha_cinema_db.cinemas (id, name, address, phone, created_at, updated_at, status) VALUES
                                                                                                   ('C001', 'CGV Vincom', 'Vincom Plaza HCM', '0900000001', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                   ('C002', 'Lotte Cinema', 'Lotte Mart District 7', '0900000002', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true);

INSERT INTO rooms (id, cinema_id, room_number, projection_type, capacity, created_at, updated_at, status) VALUES
                                                                                                              ('R001', 'C001', 1, '_2D', 100, '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                              ('R002', 'C001', 2, '_3D', 80, '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                              ('R003', 'C002', 1, 'IMAX', 120, '2026-03-12 10:00:00', '2026-03-12 10:00:00', true);

INSERT INTO seat_types (id, name, description) VALUES
                                                   ('ST001', 'Standard', 'Normal seat'),
                                                   ('ST002', 'VIP', 'Luxury comfortable seat');

INSERT INTO seats (id, room_id, row_name, column_name, seat_type_id, created_at, updated_at, status) VALUES
                                                                                                         ('S001', 'R001', 'A', '1', 'ST001', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S002', 'R001', 'A', '2', 'ST001', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S003', 'R001', 'A', '3', 'ST002', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S004', 'R001', 'B', '1', 'ST001', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S005', 'R001', 'B', '2', 'ST002', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S006', 'R002', 'A', '1', 'ST001', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S007', 'R002', 'A', '2', 'ST001', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S008', 'R002', 'B', '1', 'ST002', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S009', 'R003', 'A', '1', 'ST001', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true),
                                                                                                         ('S010', 'R003', 'A', '2', 'ST002', '2026-03-12 10:00:00', '2026-03-12 10:00:00', true);