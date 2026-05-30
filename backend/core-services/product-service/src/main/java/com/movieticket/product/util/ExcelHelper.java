package com.movieticket.product.util;

import com.movieticket.product.entity.AgeType;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.enums.TranslationType;
import com.movieticket.product.exception.BusinessException;
import org.apache.poi.ss.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.*;

public class ExcelHelper {

    public static final String TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public static boolean hasExcelFormat(MultipartFile file) {
        return TYPE.equals(file.getContentType());
    }

    public static List<Artist> parseArtistExcel(InputStream is) {
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<Artist> artists = new ArrayList<>();
            int rowNumber = 0;

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Bỏ qua dòng tiêu đề
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                rowNumber++;

                // Kiểm tra dòng trống
                if (isRowEmpty(currentRow)) {
                    continue;
                }

                String fullName = getCellValueAsString(currentRow.getCell(0));
                String nationality = getCellValueAsString(currentRow.getCell(1));

                if (fullName.isEmpty()) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Tên nghệ sĩ không được để trống.");
                }
                if (nationality.isEmpty()) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Quốc tịch không được để trống.");
                }

                LocalDate dateOfBirth = getCellValueAsLocalDate(currentRow.getCell(2));
                String bio = getCellValueAsString(currentRow.getCell(3));
                String avatarUrl = getCellValueAsString(currentRow.getCell(4));

                Artist artist = Artist.builder()
                        .fullName(fullName)
                        .nationality(nationality)
                        .dateOfBirth(dateOfBirth)
                        .bio(bio)
                        .avatarUrl(avatarUrl.isEmpty() ? null : avatarUrl)
                        .build();

                artists.add(artist);
            }

            return artists;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Lỗi phân tích file Excel nghệ sĩ: " + e.getMessage());
        }
    }

    public static List<Movie> parseMovieExcel(InputStream is,
                                             Map<String, AgeType> ageTypeMap,
                                             Map<String, Artist> artistMap) {
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<Movie> movies = new ArrayList<>();
            int rowNumber = 0;

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Bỏ qua dòng tiêu đề
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                rowNumber++;

                // Kiểm tra dòng trống
                if (isRowEmpty(currentRow)) {
                    continue;
                }

                // Đọc các trường cơ bản
                String title = getCellValueAsString(currentRow.getCell(0));
                Integer duration = getCellValueAsInteger(currentRow.getCell(1));
                LocalDate premiereDate = getCellValueAsLocalDate(currentRow.getCell(2));
                Integer releaseYear = getCellValueAsInteger(currentRow.getCell(3));

                if (title.isEmpty()) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Tiêu đề phim không được để trống.");
                }
                if (duration == null || duration <= 0) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Thời lượng phim phải lớn hơn 0.");
                }
                if (premiereDate == null) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Ngày khởi chiếu không hợp lệ hoặc để trống (Định dạng chuẩn: YYYY-MM-DD).");
                }
                if (releaseYear == null) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Năm phát hành không hợp lệ hoặc để trống.");
                }

                String producer = getCellValueAsString(currentRow.getCell(4));
                String nationality = getCellValueAsString(currentRow.getCell(5));
                String ageTypeInput = getCellValueAsString(currentRow.getCell(6));

                // Ánh xạ độ tuổi
                if (ageTypeInput.isEmpty()) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Mã giới hạn độ tuổi không được để trống.");
                }
                AgeType ageType = resolveAgeType(ageTypeInput, ageTypeMap);
                if (ageType == null) {
                    throw new BusinessException("Lỗi dòng " + rowNumber + ": Không tìm thấy mã độ tuổi '" + ageTypeInput + "'. Vui lòng chọn trong các giá trị: P, T13, T16, T18.");
                }

                // Ánh xạ Diễn viên & Đạo diễn
                String actorsInput = getCellValueAsString(currentRow.getCell(7));
                String directorsInput = getCellValueAsString(currentRow.getCell(8));

                Set<Artist> actors = resolveArtists(actorsInput, artistMap, "Diễn viên", rowNumber);
                Set<Artist> directors = resolveArtists(directorsInput, artistMap, "Đạo diễn", rowNumber);

                String description = getCellValueAsString(currentRow.getCell(9));
                String trailerUrl = getCellValueAsString(currentRow.getCell(10));
                String posterUrl = getCellValueAsString(currentRow.getCell(11));
                String bannerUrl = getCellValueAsString(currentRow.getCell(12));

                // Release Status
                String statusInput = getCellValueAsString(currentRow.getCell(13)).toUpperCase();
                ReleaseStatus releaseStatus = ReleaseStatus.UPCOMING;
                if (!statusInput.isEmpty()) {
                    try {
                        releaseStatus = ReleaseStatus.valueOf(statusInput);
                    } catch (IllegalArgumentException e) {
                        throw new BusinessException("Lỗi dòng " + rowNumber + ": Trạng thái chiếu '" + statusInput + "' không hợp lệ. Vui lòng chọn: UPCOMING, NOW_SHOWING, ENDED.");
                    }
                }

                // Thể loại
                String genresInput = getCellValueAsString(currentRow.getCell(14));
                Set<String> genres = new HashSet<>();
                if (!genresInput.isEmpty()) {
                    for (String g : genresInput.split(",")) {
                        genres.add(g.trim());
                    }
                }

                // Định dạng chiếu
                String projectionsInput = getCellValueAsString(currentRow.getCell(15)).toUpperCase();
                Set<ProjectionType> projections = new HashSet<>();
                if (!projectionsInput.isEmpty()) {
                    for (String p : projectionsInput.split(",")) {
                        String cleanP = p.trim();
                        if (cleanP.equals("2D")) {
                            projections.add(ProjectionType._2D);
                        } else if (cleanP.equals("3D")) {
                            projections.add(ProjectionType._3D);
                        } else {
                            try {
                                projections.add(ProjectionType.valueOf(cleanP));
                            } catch (IllegalArgumentException e) {
                                throw new BusinessException("Lỗi dòng " + rowNumber + ": Định dạng chiếu '" + cleanP + "' không hợp lệ. Chỉ chấp nhận: 2D, 3D, IMAX.");
                            }
                        }
                    }
                } else {
                    projections.add(ProjectionType._2D);
                }

                // Ngôn ngữ chiếu
                String translationsInput = getCellValueAsString(currentRow.getCell(16)).toUpperCase();
                Set<TranslationType> translations = new HashSet<>();
                if (!translationsInput.isEmpty()) {
                    for (String t : translationsInput.split(",")) {
                        String cleanT = t.trim();
                        try {
                            translations.add(TranslationType.valueOf(cleanT));
                        } catch (IllegalArgumentException e) {
                            throw new BusinessException("Lỗi dòng " + rowNumber + ": Ngôn ngữ chiếu '" + cleanT + "' không hợp lệ. Chỉ chấp nhận: SUBTITLES, VOICE_OVER, DUBBING.");
                        }
                    }
                } else {
                    translations.add(TranslationType.SUBTITLES);
                }

                Movie movie = Movie.builder()
                        .title(title)
                        .duration(duration)
                        .premiereDate(premiereDate)
                        .releaseYear(releaseYear)
                        .producer(producer.isEmpty() ? null : producer)
                        .nationality(nationality.isEmpty() ? null : nationality)
                        .ageType(ageType)
                        .actors(actors)
                        .directors(directors)
                        .description(description.isEmpty() ? null : description)
                        .trailerUrl(trailerUrl.isEmpty() ? null : trailerUrl)
                        .thumbnailUrl(posterUrl.isEmpty() ? null : posterUrl)
                        .bannerUrl(bannerUrl.isEmpty() ? null : bannerUrl)
                        .releaseStatus(releaseStatus)
                        .genre(genres)
                        .supportedProjection(projections)
                        .supportedTranslation(translations)
                        .totalReviews(0L)
                        .totalSumRating(0.0)
                        .avgRating(0.0)
                        .build();

                movies.add(movie);
            }

            return movies;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Lỗi phân tích file Excel phim: " + e.getMessage());
        }
    }

    private static boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValueAsString(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private static String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    try {
                        return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                    } catch (Exception e) {
                        return "";
                    }
                }
                double doubleVal = cell.getNumericCellValue();
                if (doubleVal == (long) doubleVal) {
                    return String.valueOf((long) doubleVal);
                }
                return String.valueOf(doubleVal);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    try {
                        return String.valueOf(cell.getNumericCellValue());
                    } catch (Exception ex) {
                        return "";
                    }
                }
            default:
                return "";
        }
    }

    private static Integer getCellValueAsInteger(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        String str = getCellValueAsString(cell);
        if (str.isEmpty()) return null;
        try {
            return Integer.parseInt(str);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static LocalDate getCellValueAsLocalDate(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            try {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            } catch (Exception e) {
                return null;
            }
        }
        String str = getCellValueAsString(cell);
        if (str.isEmpty()) return null;
        try {
            return LocalDate.parse(str);
        } catch (Exception e) {
            return null;
        }
    }

    private static AgeType resolveAgeType(String input, Map<String, AgeType> ageTypeMap) {
        if (input == null || input.trim().isEmpty()) return null;
        String cleanInput = input.trim();
        // Thử tìm theo ID gốc
        AgeType ageType = ageTypeMap.get(cleanInput.toLowerCase());
        if (ageType != null) return ageType;

        // Thử tìm theo tên viết tắt (e.g. P, T13, T16, T18)
        for (AgeType at : ageTypeMap.values()) {
            if (at.getName().equalsIgnoreCase(cleanInput)) {
                return at;
            }
        }
        return null;
    }

    private static Set<Artist> resolveArtists(String input,
                                             Map<String, Artist> artistMap,
                                             String roleName,
                                             int rowNumber) {
        Set<Artist> artists = new HashSet<>();
        if (input == null || input.trim().isEmpty()) return artists;

        String[] names = input.split(",");
        for (String name : names) {
            String cleanName = name.trim();
            if (cleanName.isEmpty()) continue;

            // Tìm kiếm trong map nghệ sĩ (key là tên viết thường)
            Artist artist = artistMap.get(cleanName.toLowerCase());
            if (artist == null) {
                throw new BusinessException("Lỗi dòng " + rowNumber + ": " + roleName + " '" + cleanName + "' không tồn tại trong hệ thống. Vui lòng tạo hồ sơ nghệ sĩ này trước.");
            }
            artists.add(artist);
        }
        return artists;
    }
}
